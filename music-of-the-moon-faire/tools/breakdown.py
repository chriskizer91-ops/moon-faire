"""Bring one of Chris's songs into Moon Faire: small enough for a phone, and broken down into its key, beat, bars,
chords and named parts.

    python3 music-of-the-moon-faire/tools/breakdown.py add <song.wav> [--name slug] [--look DIR]
    python3 music-of-the-moon-faire/tools/breakdown.py <slug>

`add` levels the song and encodes it once, straight from the WAV, as <slug>/<slug>.opus. It drafts
sections.json from the places where the sound changes; --look also draws the song into DIR (keep that outside
the repo), to check each change against. Then name the parts, fix their starts and write what each one is good
for in sections.json, and run the second form. It measures the Opus file and writes:

    breakdown.json      key, speed, beats, bars, chords per bar, loudness, and each part's start and end
    breakdown.md        the breakdown in plain words
    <slug>.html         a phone page: the song drawn as a map, tap a part to hear it
    ../songs.json       every song in the folder, with its parts, for the game to read

The song is kept once. A part is a start and an end in that one file, so the game, the films and the page
play parts by time. Rebuilding never re-encodes, so the sound only goes through the encoder once.
Everything stays inside music-of-the-moon-faire/. Needs ffmpeg with libopus, numpy and librosa
(pip install librosa; matplotlib too for --look). Loudness, key and decoding come from tools/pack_audio.py.
"""
import argparse, base64, glob, json, os, re, subprocess, sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FOLDER = os.path.dirname(HERE)
ROOT = os.path.dirname(FOLDER)
sys.dont_write_bytecode = True  # importing pack_audio must not leave files in tools/
sys.path.insert(0, os.path.join(ROOT, "tools"))
import pack_audio as pa  # noqa: E402

import librosa  # noqa: E402

# Opus at 64 kbps stereo: in listening tests Opus at this rate rates "good" to "excellent" on music, about what
# MP3 needs 128 kbps for, so a song costs about 0.5 MB a minute (the WAV is 11.5 MB a minute). Levelled to
# -16 LUFS like art/music, so songs from either place play at the same loudness.
BITRATE = "64k"
LUFS = -16
SR = 22050  # analysis rate
NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
SAY = {"C#": "C sharp", "Eb": "E flat", "F#": "F sharp", "Ab": "A flat", "Bb": "B flat"}


def say(note):
    return SAY.get(note, note)


def clock(t, places=1):
    m, s = divmod(t, 60)
    return f"{int(m)}:{s:0{3 + places if places else 2}.{places}f}"


# ---- measuring ----

def tempo_curve(onsets, fps):
    """The beat length (s) once a second, from how the rhythm repeats over the 8 seconds around it."""
    half, step = int(4 * fps), int(fps)
    lo, hi = int(0.30 * fps), int(0.60 * fps)  # 100-200 beats a minute
    times, period = [], []
    for c in range(0, len(onsets), step):
        seg = onsets[max(0, c - half): c + half]
        if len(seg) < half:
            break
        seg = seg - seg.mean()
        ac = np.correlate(seg, seg, "full")[len(seg) - 1:]
        ac /= ac[0] + 1e-9
        i = lo + int(np.argmax(ac[lo:hi]))
        bend = ac[i - 1] - 2 * ac[i] + ac[i + 1]
        frac = (ac[i - 1] - ac[i + 1]) / (2 * bend) if bend else 0.0
        times.append(c / fps)
        period.append((i + frac) / fps)
    period = np.array(period)
    pad = np.pad(period, 2, mode="edge")
    period = np.median(np.lib.stride_tricks.sliding_window_view(pad, 5), axis=1)
    return np.array(times), period


def measure(path):
    y = pa.decode(path, 1, SR)[:, 0].astype(np.float32)
    harm, perc = librosa.effects.hpss(y, margin=2.0)
    hop = 128
    fps = SR / hop
    onsets = librosa.onset.onset_strength(y=perc, sr=SR, hop_length=hop, n_fft=1024, lag=2, max_size=3)
    onsets = np.maximum(onsets - np.convolve(onsets, np.ones(64) / 64, mode="same"), 0)
    ct, period = tempo_curve(onsets, fps)
    bpm = np.interp(np.arange(len(onsets)) / fps, ct, 60 / period)
    _, beats = librosa.beat.beat_track(onset_envelope=onsets, sr=SR, hop_length=hop, bpm=bpm,
                                       units="time", tightness=800, trim=False)
    chroma = librosa.feature.chroma_cqt(y=harm, sr=SR, hop_length=512, bins_per_octave=36, n_octaves=6,
                                        fmin=librosa.note_to_hz("C1"))
    rms = librosa.feature.rms(y=y, hop_length=SR // 4, frame_length=SR // 2)[0]
    shape = np.clip((20 * np.log10(rms + 1e-9) + 50) / 44, 0, 1)
    key, sure = pa.key_of(y, SR)
    lufs, peak, _ = pa.loudness(path)
    return {"seconds": len(y) / SR, "beats": beats, "tempo_t": ct, "tempo_bpm": 60 / period,
            "chroma": chroma, "shape": shape, "key": key, "key_sure": sure, "lufs": lufs, "peak": peak, "y": y}


TEMPLATES = []
for root in range(12):
    for kind, steps in (("", (0, 4, 7)), ("m", (0, 3, 7))):
        v = np.zeros(12)
        v[[(root + s) % 12 for s in steps]] = 1
        v[root] += 0.3
        TEMPLATES.append((NOTES[root] + kind, v / np.linalg.norm(v)))


def pitch_profile(m, a, b):
    f = librosa.time_to_frames([a, b], sr=SR, hop_length=512)
    p = m["chroma"][:, f[0]:max(f[1], f[0] + 1)].mean(axis=1)
    return p / (p.max() + 1e-9)


def in_key(key):
    """The chords that belong to the key; a full band blurs chords, so these win a close call."""
    tonic, mode = key.split()
    t = NOTES.index(tonic)
    steps = ((0, "m"), (3, ""), (5, "m"), (7, "m"), (7, ""), (8, ""), (10, "")) if mode == "minor" else \
            ((0, ""), (2, "m"), (4, "m"), (5, ""), (7, ""), (9, "m"))
    return {NOTES[(t + s) % 12] + kind for s, kind in steps}


def chord_at(m, a, b):
    p = pitch_profile(m, a, b)
    p = p / (np.linalg.norm(p) + 1e-9)
    home = in_key(m["key"])
    return max(TEMPLATES, key=lambda t: float(t[1] @ p) + (0.05 if t[0] in home else 0.0))[0]


def part_facts(m, part, end, per_bar):
    a = part["start"]
    beats = m["beats"]
    inside = beats[(beats >= a - 0.12) & (beats < end - 0.05)]
    facts = {"name": part["name"], "slug": part["slug"], "start": round(a, 2), "end": round(end, 2),
             "seconds": round(end - a, 2)}
    gaps = np.diff(inside)
    facts["bpm"] = round(float(60 / np.median(gaps)), 1) if len(gaps) >= 3 and part.get("beat", True) else None
    p = pitch_profile(m, a, end)
    facts["notes"] = [NOTES[i] for i in np.argsort(-p)[:5] if p[i] >= 0.5]
    s = m["shape"][int(a * 4): max(int(end * 4), int(a * 4) + 1)]
    facts["fullness"] = round(float(s.mean()), 2)
    if part.get("bars"):
        downs = inside[::per_bar]
        bar = per_bar * float(np.median(gaps))
        bars = []
        for i, t in enumerate(downs):
            stop = downs[i + 1] if i + 1 < len(downs) else min(end, t + bar)
            if stop - t > 0.6 * bar:  # a scrap of a bar cut off by the next part doesn't count
                bars.append({"t": round(float(t), 3), "chord": chord_at(m, t, stop)})
        facts["bars"] = bars
    return facts


def novelty(m):
    """How much the sound changes at each half second, 0-1, from the song's timbre over 8 seconds either side."""
    hop = 512
    mf = librosa.feature.mfcc(y=m["y"], sr=SR, hop_length=hop, n_mfcc=20)[1:]
    block = int(SR / hop * 0.5)
    n = mf.shape[1] // block
    feat = mf[:, :n * block].reshape(mf.shape[0], n, block).mean(axis=2)
    feat = (feat - feat.mean(axis=1, keepdims=True)) / (feat.std(axis=1, keepdims=True) + 1e-9)
    ssm = np.corrcoef(feat.T)
    k = 16
    g = np.exp(-0.5 * ((np.arange(2 * k) - k + 0.5) / (k / 2)) ** 2)
    kernel = np.kron(np.array([[1, -1], [-1, 1]]), np.ones((k, k))) * np.outer(g, g)
    padded = np.pad(ssm, k, mode="edge")
    nov = np.array([(padded[i:i + 2 * k, i:i + 2 * k] * kernel).sum() for i in range(n)])
    return np.maximum(nov, 0) / (nov.max() + 1e-9)


def draft_parts(nov):
    """A first guess at the parts, every one called 'Part n'. The real changes are near these, not on them."""
    from scipy.signal import find_peaks
    peaks, _ = find_peaks(nov, height=0.25, distance=8)
    starts = [0.0] + [round(p * 0.5, 2) for p in peaks if p * 0.5 > 2]
    return [{"start": s, "name": f"Part {i + 1}", "slug": f"part-{i + 1}", "bars": True, "sound": "", "use": ""}
            for i, s in enumerate(starts)]


def look(m, nov, parts, out):
    """Draw the song for checking the parts by eye: its sound, loudness, how much it changes, and the drafted starts."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    os.makedirs(out, exist_ok=True)
    hop = 256
    mel = librosa.power_to_db(librosa.feature.melspectrogram(y=m["y"], sr=SR, hop_length=hop, n_mels=96), ref=np.max)
    rms = librosa.feature.rms(y=m["y"], hop_length=hop)[0]
    t = np.arange(len(rms)) * hop / SR
    dur = m["seconds"]
    for a in np.arange(0, dur, 48):
        b = min(dur, a + 50)
        fig, ax = plt.subplots(3, 1, figsize=(34, 10), sharex=True, gridspec_kw={"height_ratios": [3, 1, 1]})
        i0, i1 = int(a * SR / hop), int(b * SR / hop)
        ax[0].imshow(mel[:, i0:i1], aspect="auto", origin="lower", extent=[a, b, 0, 96], cmap="magma")
        ax[1].plot(t[i0:i1], 20 * np.log10(rms[i0:i1] + 1e-6))
        nt = np.arange(len(nov)) * 0.5
        sel = (nt >= a) & (nt < b)
        ax[2].plot(nt[sel], nov[sel])
        for p in parts:
            if a <= p["start"] < b:
                for x in ax:
                    x.axvline(p["start"], color="c", lw=1.5)
        for bt in m["beats"][(m["beats"] >= a) & (m["beats"] < b)]:
            ax[0].axvline(bt, color="w", lw=0.4, alpha=0.4)
        for x in ax:
            x.set_xticks(np.arange(a, b, 1))
            x.grid(axis="x", alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(out, f"look_{int(a):03d}.png"), dpi=48)
        plt.close()
    print(f"Drew the song in {out}")


# ---- writing ----

def run(*args):
    subprocess.run([pa.ffmpeg(), "-v", "error", "-y", *args], check=True)


def add(src, name, look_dir):
    slug = name or re.sub(r"[^a-z0-9]+", "-", os.path.splitext(os.path.basename(src))[0].lower()).strip("-")
    slug = re.sub(r"^[0-9a-f]{8}-", "", slug)  # uploads arrive with a short id in front
    out = os.path.join(FOLDER, slug)
    os.makedirs(out, exist_ok=True)
    song = os.path.join(out, slug + ".opus")
    # two passes of EBU R128, as pack_audio does: measure, then one even step to -16 LUFS. Not trimmed, so every
    # time in the breakdown is also a time in the WAV.
    _, _, x = pa.loudness_cut(src, [])
    norm = (f"loudnorm=I={LUFS}:TP=-1.5:LRA=11:measured_I={x['input_i']}:measured_TP={x['input_tp']}:"
            f"measured_LRA={x['input_lra']}:measured_thresh={x['input_thresh']}:offset={x['target_offset']}:linear=true")
    run("-i", src, "-vn", "-map_metadata", "-1", "-af", f"{norm},aresample=48000", "-ac", "2",
        "-c:a", "libopus", "-b:a", BITRATE, "-vbr", "on", "-application", "audio", song)
    m = measure(song)
    nov = novelty(m)
    sections = os.path.join(out, "sections.json")
    if not os.path.exists(sections):
        title = " ".join(w.capitalize() for w in slug.split("-"))
        write_json(sections, {"title": title, "source": os.path.basename(src), "beats_per_bar": 3,
                              "summary": [], "fit": [], "bells": "", "parts": draft_parts(nov)})
    if look_dir:
        look(m, nov, json.load(open(sections))["parts"], look_dir)
    print(f"{os.path.relpath(song, ROOT)}: {os.path.getsize(song) / 1e6:.2f} MB (the WAV was {os.path.getsize(src) / 1e6:.1f} MB), "
          f"{m['key']}, {clock(m['seconds'])}")
    print(f"Now name the parts in {os.path.relpath(sections, ROOT)}, then run: python3 {os.path.relpath(__file__, ROOT)} {slug}")


def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write("\n")


def build(slug):
    out = os.path.join(FOLDER, slug)
    song = os.path.join(out, slug + ".opus")
    spec = json.load(open(os.path.join(out, "sections.json")))
    m = measure(song)
    per_bar = spec.get("beats_per_bar", 3)
    parts = spec["parts"]
    ends = [p["start"] for p in parts[1:]] + [m["seconds"]]
    facts = [part_facts(m, p, e, per_bar) for p, e in zip(parts, ends)]
    profile = pitch_profile(m, 0, m["seconds"])
    data = {
        "title": spec["title"], "source": spec.get("source", ""), "song": f"{slug}.opus",
        "kb": round(os.path.getsize(song) / 1024), "seconds": round(m["seconds"], 2),
        "key": m["key"], "key_sure": round(m["key_sure"], 2),
        "notes": [NOTES[i] for i in np.argsort(-profile)[:7]],
        "beats_per_bar": per_bar, "lufs": round(m["lufs"], 1), "peak_db": round(m["peak"], 1),
        "tempo": [[round(float(t), 1), round(float(b), 1)] for t, b in zip(m["tempo_t"], m["tempo_bpm"])],
        "beats": [round(float(b), 3) for b in m["beats"]],
        "shape_step": 0.25, "shape": [round(float(v), 2) for v in m["shape"]],
        "summary": spec.get("summary", []), "fit": spec.get("fit", []), "bells": spec.get("bells", ""),
        "parts": [dict(f, sound=p.get("sound", ""), use=p.get("use", "")) for f, p in zip(facts, parts)],
    }
    write_json(os.path.join(out, "breakdown.json"), data)
    with open(os.path.join(out, "breakdown.md"), "w") as f:
        f.write(markdown(data, slug))
    page(data, os.path.join(out, slug + ".html"))
    catalog()
    print(f"{slug}: {clock(data['seconds'])}, {data['kb']} KB, {data['key']} (sure {data['key_sure']}), "
          f"{len(data['beats'])} beats, {len(facts)} parts, {data['lufs']} LUFS")
    for f in facts:
        print(f"  {clock(f['start'])}  {f['name']:<22} {f['seconds']:6.2f} s  "
              f"{(str(f['bpm']) + ' bpm') if f['bpm'] else '':>10}  {' '.join(b['chord'] for b in f.get('bars', []))}")


def catalog():
    """songs.json: every song here, with its file and its parts, so the game reads one file to find any part."""
    songs = []
    for path in sorted(glob.glob(os.path.join(FOLDER, "*", "breakdown.json"))):
        d = json.load(open(path))
        slug = os.path.basename(os.path.dirname(path))
        speeds = [p["bpm"] for p in d["parts"] if p["bpm"]]
        songs.append({
            "slug": slug, "title": d["title"], "file": f"{slug}/{d['song']}", "kb": d["kb"], "seconds": d["seconds"],
            "key": d["key"], "beats_per_bar": d["beats_per_bar"],
            "bpm": [round(min(speeds)), round(max(speeds))] if speeds else None,
            "parts": [{"slug": p["slug"], "name": p["name"], "start": p["start"], "end": p["end"], "bpm": p["bpm"],
                       "bars": len(p["bars"]) if "bars" in p else None} for p in d["parts"]],
        })
    write_json(os.path.join(FOLDER, "songs.json"), {
        "about": "Every song in music-of-the-moon-faire, written by tools/breakdown.py. Play a part from start to end "
                 "(seconds) in the song's file; each song's breakdown.json has its beats, bar lines and chords.",
        "songs": songs})


def markdown(d, slug):
    speeds = [p["bpm"] for p in d["parts"] if p["bpm"]]
    tonic, mode = d["key"].split()
    lines = [f"# {d['title']}", "",
             f"{d['source']}", "",
             "Made by `tools/breakdown.py` from `sections.json`; edit that and run the tool again rather than editing this.", "",
             "| | |", "|---|---|",
             f"| Length | {clock(d['seconds'])} |",
             f"| Key | {say(tonic)} {mode} (match {d['key_sure']} out of 1; pack_audio calls this 'sure') |",
             f"| Beat | {d['beats_per_bar']} beats to the bar |",
             f"| Speed | {min(speeds):.0f} to {max(speeds):.0f} beats a minute; each part's speed is below |",
             f"| Notes it uses most | {', '.join(say(n) for n in d['notes'])} |",
             f"| File | `{d['song']}`, {d['kb']} KB: Opus at {BITRATE}bps, {d['lufs']} LUFS, peak {d['peak_db']} dB |",
             ""]
    if d["summary"]:
        lines += ["## In short", ""] + [f"- {s}" for s in d["summary"]] + [""]
    if d["bells"]:
        lines += ["## Tuning bells and chimes to it", "", d["bells"], ""]
    lines += ["## The parts", "",
              f"Each part is a stretch of `{d['song']}`: play it from its start to its end, in seconds.", "",
              "| | Part | Start | End | Length | Speed | Bars |", "|---|---|---|---|---|---|---|"]
    for i, p in enumerate(d["parts"]):
        bars = str(len(p["bars"])) if "bars" in p else ""
        bpm = f"{p['bpm']:.0f}" if p["bpm"] else ""
        lines.append(f"| {i + 1} | {p['name']} | {p['start']:.2f} | {p['end']:.2f} | {p['seconds']:.1f} s | {bpm} | {bars} |")
    lines.append("")
    for i, p in enumerate(d["parts"]):
        lines += [f"### {i + 1}. {p['name']}, {clock(p['start'])} to {clock(p['end'])}", ""]
        if p["sound"]:
            lines += [p["sound"], ""]
        if p["use"]:
            lines += [f"**Good for:** {p['use']}", ""]
        if p.get("bars"):
            lines += ["**Chords, one per bar:** " + " · ".join(b["chord"] for b in p["bars"]), ""]
        if p["notes"]:
            lines += ["**Strongest notes:** " + ", ".join(say(n) for n in p["notes"]), ""]
    lines += ["Chord names: Gm is G minor, Cm is C minor, D is D major, and so on. A chord read from a full band "
              "can be off by a bar where the band plays a run, so trust the pattern more than any single bar.", ""]
    if d["fit"]:
        lines += ["## How it fits Moon Faire", ""] + [f"- {s}" for s in d["fit"]] + [""]
    lines += ["## Files", "",
              f"- `{d['song']}`: the song, for the game, the films and the phone. Every part plays from this one file.",
              "- `breakdown.json`: everything measured: every beat, the bar lines and chord of each part, "
              "the speed once a second, and the loudness four times a second.",
              f"- `{slug}.html`: the phone page. Tap a part to hear just that part.",
              "- `sections.json`: the hand-written part: where each part starts, its name, and what it is good for.", "",
              "## How it was measured", "",
              "By measurement and by pictures of the sound, not by ear. The beat comes from the drum and pluck hits, "
              "the speed from how often their rhythm repeats, the bar lines from counting beats from the start of "
              "each part, and the chords from which notes sound most in each bar. Instrument names in the notes "
              "above are guesses from the shape of the sound, so correct them if they're wrong.", ""]
    return "\n".join(lines)


def page(d, dst):
    tpl = open(os.path.join(HERE, "page.html")).read()
    font = base64.b64encode(open(os.path.join(ROOT, "art", "fonts", "jacquard24-latin.woff2"), "rb").read()).decode()
    html = (tpl.replace("/*TITLE*/", d["title"]).replace("/*FONT*/", font)
            .replace("/*DATA*/", json.dumps(d, ensure_ascii=False, separators=(",", ":"))))
    with open(dst, "w") as f:
        f.write(html)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "add":
        ap = argparse.ArgumentParser(description="Encode a new song once, from its WAV, and draft its parts.")
        ap.add_argument("add")
        ap.add_argument("file")
        ap.add_argument("--name", help="the song's folder name, like carnival-of-ashes")
        ap.add_argument("--look", help="a folder outside the repo to draw the song into, for checking the parts")
        args = ap.parse_args()
        add(args.file, args.name, args.look)
    else:
        ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
        ap.add_argument("slug", help="the song's folder in music-of-the-moon-faire/")
        build(ap.parse_args().slug)


if __name__ == "__main__":
    main()
