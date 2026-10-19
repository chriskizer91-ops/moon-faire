"""Bring Chris's audio into Moon Faire: trimmed, evened out and small.

    python3 tools/pack_audio.py <file ...>                      # songs -> art/music/
    python3 tools/pack_audio.py --sfx <file ...>                # sound effects -> art/sfx/
    python3 tools/pack_audio.py --name curtain-call <file>      # choose the saved name (one file)
    python3 tools/pack_audio.py --report art/music/*.mp3        # only look: key, tempo, loudness, shape

Songs (Suno and the like) are cut of their silent ends, brought to one loudness
(-16 LUFS, peaks under -1.5 dB) and saved as 128 kbps stereo MP3: about 1 MB a
minute, which every phone browser plays. Effects are trimmed tight, peaked at
-3 dB and saved as 96 kbps mono MP3 (the films place them left and right
themselves). Each file's key, tempo and loudness shape go in index.json beside
it, because the films tune their bells to the song under them and cut on its bars.

Needs ffmpeg (or pip install imageio-ffmpeg) and numpy.
"""
import argparse, json, os, re, subprocess, sys
import numpy as np

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
RATE = 44100
NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
# Krumhansl-Kessler key profiles
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def decode(path, channels=2, rate=RATE):
    """The whole file as float samples, shape (n, channels)."""
    raw = subprocess.run([ffmpeg(), "-v", "error", "-i", path, "-vn", "-ac", str(channels), "-ar", str(rate), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, channels)


def loud_edges(x, rate, floor_db, pad):
    """First and last sample above floor_db (20 ms windows), padded by pad seconds."""
    win = int(rate * 0.02)
    n = len(x) // win
    if n == 0:
        return 0, len(x)
    rms = np.sqrt((x[: n * win].reshape(n, win, -1) ** 2).mean(axis=(1, 2)) + 1e-12)
    on = np.nonzero(20 * np.log10(rms) > floor_db)[0]
    if len(on) == 0:
        return 0, len(x)
    a = max(0, on[0] * win - int(pad * rate))
    b = min(len(x), (on[-1] + 1) * win + int(pad * rate))
    return a, b


def key_of(mono, rate):
    """The likeliest key, from how much of each pitch class sounds (55 Hz - 2 kHz)."""
    size, hop = 8192, 4096
    if len(mono) < size:
        return None, 0.0
    frames = np.lib.stride_tricks.sliding_window_view(mono, size)[::hop] * np.hanning(size)
    mag = np.abs(np.fft.rfft(frames, axis=1))
    f = np.fft.rfftfreq(size, 1 / rate)
    band = (f > 55) & (f < 2000)
    pc = (np.round(12 * np.log2(f[band] / 440.0)).astype(int) + 9) % 12
    chroma = np.zeros(12)
    np.add.at(chroma, pc, np.log1p(mag[:, band]).sum(axis=0))
    best, score = None, -2.0
    for tonic in range(12):
        for mode, prof in (("major", MAJOR), ("minor", MINOR)):
            r = np.corrcoef(chroma, np.roll(prof, tonic))[0, 1]
            if r > score:
                best, score = f"{NAMES[tonic]} {mode}", r
    return best, float(score)


def tempo_of(mono, rate):
    """Beats per minute from the rhythm of note onsets (60-180), or None if there's no steady beat."""
    size, hop = 1024, 512
    if len(mono) < rate * 4:
        return None
    frames = np.lib.stride_tricks.sliding_window_view(mono, size)[::hop] * np.hanning(size)
    logmag = np.log1p(10 * np.abs(np.fft.rfft(frames, axis=1)))
    flux = np.maximum(0, np.diff(logmag, axis=0)).sum(axis=1)
    flux = flux - np.convolve(flux, np.ones(16) / 16, mode="same")
    flux = np.maximum(flux, 0)
    fps = rate / hop
    ac = np.correlate(flux, flux, mode="full")[len(flux) - 1:]
    lags = np.arange(len(ac))
    ok = (lags >= fps * 60 / 180) & (lags <= fps * 60 / 60)
    if not ok.any() or ac[0] <= 0:
        return None
    # lean gently toward the 80-150 range, where most of these songs sit
    bpm_at = 60 * fps / np.maximum(lags, 1)
    weight = np.exp(-0.5 * (np.log2(bpm_at / 115) / 0.9) ** 2)
    i = np.argmax(np.where(ok, ac * weight, -np.inf))
    if ac[i] / ac[0] < 0.08:
        return None
    return round(float(bpm_at[i]), 1)


def shape_of(mono, rate):
    """Loudness per second, 0-1: where the song is sparse, where the band comes in, where it stops."""
    n = len(mono) // rate
    if n == 0:
        return []
    rms = np.sqrt((mono[: n * rate].reshape(n, rate) ** 2).mean(axis=1) + 1e-12)
    db = np.clip((20 * np.log10(rms) + 50) / 44, 0, 1)
    return [round(float(v), 2) for v in db]


def loudness(path):
    """Integrated loudness (LUFS) and true peak (dB) by ffmpeg's EBU R128 measure."""
    err = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = json.loads(err[err.rindex("{"): err.rindex("}") + 1])
    return float(m["input_i"]), float(m["input_tp"]), m


def bars(shape):
    blocks = " ▁▂▃▄▅▆▇█"
    return "".join(blocks[min(8, int(v * 8.99))] for v in shape)


def describe(path, rel):
    x = decode(path)
    mono = decode(path, 1, 22050)[:, 0]
    key, conf = key_of(mono, 22050)
    lufs, peak, _ = loudness(path)
    return {
        "file": rel, "seconds": round(len(x) / RATE, 2), "kb": round(os.path.getsize(path) / 1024),
        "lufs": round(lufs, 1), "peak_db": round(peak, 1),
        "key": key, "key_sure": round(conf, 2), "bpm": tempo_of(mono, 22050), "shape": shape_of(mono, 22050),
    }


def pack(src, kind, name):
    out_dir = os.path.join(ROOT, "art", "music" if kind == "music" else "sfx")
    os.makedirs(out_dir, exist_ok=True)
    slug = name or re.sub(r"[^a-z0-9]+", "-", os.path.splitext(os.path.basename(src))[0].lower()).strip("-")
    dst = os.path.join(out_dir, slug + ".mp3")
    x = decode(src)
    a, b = loud_edges(x, RATE, -60 if kind == "music" else -45, 0.25 if kind == "music" else 0.03)
    start, length = a / RATE, (b - a) / RATE
    cut = ["-ss", f"{start:.3f}", "-t", f"{length:.3f}"]
    if kind == "music":
        # two passes of EBU R128: measure the trimmed song, then bring it to -16 LUFS in one even step
        _, _, m = loudness_cut(src, cut)
        norm = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
        fades = f"afade=t=in:d=0.02,afade=t=out:st={max(0, length - 0.3):.3f}:d=0.3"
        enc = ["-af", f"{norm},{fades},aresample={RATE}", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "128k"]
    else:
        peak = float(np.abs(x[a:b]).max()) or 1.0
        gain = 10 ** (-3 / 20) / peak
        fades = f"afade=t=in:d=0.005,afade=t=out:st={max(0, length - 0.05):.3f}:d=0.05"
        enc = ["-af", f"volume={gain:.4f},{fades}", "-ac", "1", "-ar", str(RATE), "-c:a", "libmp3lame", "-b:a", "96k"]
    subprocess.run([ffmpeg(), "-v", "error", "-y", *cut, "-i", src, "-vn", *enc, dst], check=True)
    rel = os.path.relpath(dst, ROOT)
    info = describe(dst, rel)
    info["source"] = os.path.basename(src)
    info["trimmed"] = [round(start, 2), round(start + length, 2)]
    index = os.path.join(out_dir, "index.json")
    entries = json.load(open(index)) if os.path.exists(index) else {}
    entries[slug] = info
    json.dump(dict(sorted(entries.items())), open(index, "w"), indent=1, ensure_ascii=False)
    return info, os.path.getsize(src)


def loudness_cut(src, cut):
    err = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", *cut, "-i", src, "-af", "loudnorm=print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = json.loads(err[err.rindex("{"): err.rindex("}") + 1])
    return float(m["input_i"]), float(m["input_tp"]), m


def show(info, before=None):
    size = f"{info['kb']} KB" + (f" (was {before / 1024:.0f} KB)" if before else "")
    tempo = f"{info['bpm']} bpm" if info["bpm"] else "no steady beat"
    key = f"{info['key']} (sure {info['key_sure']})" if info["key"] else "no key"
    print(f"{info['file']}: {info['seconds']} s, {size}, {info['lufs']} LUFS, peak {info['peak_db']} dB, {key}, {tempo}")
    if info["shape"]:
        print("  " + bars(info["shape"]))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("files", nargs="+")
    ap.add_argument("--sfx", action="store_true", help="sound effects: tight trim, mono, into art/sfx/")
    ap.add_argument("--name", help="saved name, for a single file")
    ap.add_argument("--report", action="store_true", help="only describe the files, change nothing")
    args = ap.parse_args()
    if args.name and len(args.files) > 1:
        sys.exit("--name takes one file")
    for f in args.files:
        if args.report:
            show(describe(f, f))
        else:
            info, before = pack(f, "sfx" if args.sfx else "music", args.name)
            show(info, before)


if __name__ == "__main__":
    main()
