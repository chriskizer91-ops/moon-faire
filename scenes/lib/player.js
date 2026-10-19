// The page: loading, the play/scrub controls, and hooks for the video render.

let BACKDROP = null;
const IMGS = [], GLOWS = [], ART = {};   // ART: a scene's own named pictures (paintings, foes)

function loadImage(src) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => res(im));
    im.onerror = () => res(null);
    im.src = src;
  });
}

async function loadAll(progress) {
  const names = Object.keys(DATA.art || {});
  const list = [DATA.backdrop, ...DATA.imgs, ...DATA.glows, ...names.map(n => DATA.art[n])];
  let done = 0;
  const tick = () => progress(++done / list.length);
  const [bd, ...rest] = await Promise.all(list.map(s => loadImage(s).then(im => (tick(), im))));
  BACKDROP = bd;
  rest.slice(0, DATA.imgs.length).forEach((im, i) => (IMGS[i] = im));
  rest.slice(DATA.imgs.length, DATA.imgs.length + DATA.glows.length).forEach((im, i) => (GLOWS[i] = im));
  rest.slice(DATA.imgs.length + DATA.glows.length).forEach((im, i) => (ART[names[i]] = im));
  try { await document.fonts.load('40px "Jacquard 24"'); } catch (e) {}
  if (DATA.music) {
    // the film's songs: one track, decoded once, played as a bed under the cues
    try {
      const bytes = Uint8Array.from(atob(DATA.music.slice(DATA.music.indexOf(",") + 1)), c => c.charCodeAt(0));
      const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      MUSIC = await new Off(2, 48000, 48000).decodeAudioData(bytes.buffer);
    } catch (e) { MUSIC = null; }
  }
  return IMGS.every(Boolean);
}

function wav(buf) {
  const n = buf.length, ch = buf.numberOfChannels, rate = buf.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); out.setUint32(4, 36 + n * ch * 2, true); str(8, "WAVE"); str(12, "fmt ");
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, rate, true); out.setUint32(28, rate * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  str(36, "data"); out.setUint32(40, n * ch * 2, true);
  const data = [...Array(ch)].map((_, c) => buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { out.setInt16(o, clamp(data[c][i], -1, 1) * 32767, true); o += 2; }
  return new Uint8Array(out.buffer);
}

(() => {
  const $ = s => document.querySelector(s);
  const cv = $("#film"), g = cv.getContext("2d");
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  let t = 0, playing = false, pb = null, actx = null, muted = false, last = performance.now(), ready = false, started = false;

  function fit() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.min(1920, Math.round(r.width * dpr));
    cv.width = Math.max(320, w); cv.height = Math.round(cv.width * 9 / 16);
  }
  new ResizeObserver(fit).observe($("#screen"));

  function startAudio() {
    if (muted || !actx) return;
    pb && pb.stop();
    pb = new Playback(actx, t);
  }
  function play() {
    if (!ready) return;
    if (t >= DUR - 0.05) t = 0;
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
    }
    if (actx && actx.state === "suspended") actx.resume();
    playing = true; started = true; last = performance.now();
    startAudio();
    $("#cover").hidden = true;
    sync();
  }
  function pause() {
    playing = false;
    pb && pb.stop(); pb = null;
    sync();
  }
  function seek(nt) {
    t = clamp(nt, 0, DUR); started = true;
    if (playing) startAudio();
  }
  function sync() {
    $("#play").setAttribute("aria-label", playing ? "Pause" : "Play");
    $("#playicon").innerHTML = playing ? '<path d="M5 3h4v14H5zM11 3h4v14h-4z"/>' : '<path d="M5 3v14l12-7z"/>';
    $("#mute").setAttribute("aria-pressed", String(muted));
    $("#mute").textContent = muted ? "Sound off" : "Sound on";
  }

  $("#play").onclick = () => (playing ? pause() : play());
  $("#bigplay").onclick = play;
  $("#mute").onclick = () => {
    muted = !muted;
    if (muted) { pb && pb.stop(); pb = null; } else if (playing) { if (!actx) play(); else startAudio(); }
    sync();
  };
  const scrub = $("#scrub");
  scrub.max = DUR;
  scrub.addEventListener("input", () => { seek(Number(scrub.value)); $("#cover").hidden = true; });
  document.addEventListener("keydown", e => {
    if (e.key === " " && e.target === document.body) { e.preventDefault(); playing ? pause() : play(); }
    if (e.key === "ArrowRight") seek(t + 5);
    if (e.key === "ArrowLeft") seek(t - 5);
  });

  const ch = $("#chapters");
  CHAPTERS.forEach(([ct, name]) => {
    const b = document.createElement("button");
    b.innerHTML = `<span class="mono">${fmt(ct)}</span> ${name}`;
    b.onclick = () => { seek(ct); if (!playing) { $("#cover").hidden = true; } };
    ch.appendChild(b);
  });
  const ticks = $("#ticks");
  CHAPTERS.forEach(([ct]) => { const i = document.createElement("i"); i.style.left = (ct / DUR * 100) + "%"; ticks.appendChild(i); });

  let lastCh = -1;
  function loop(now) {
    if (playing) {
      t = pb ? pb.time() : t + (now - last) / 1000;
      if (t >= DUR) { t = DUR; pause(); }
    }
    last = now;
    if (ready) render(g, started ? t : POSTER, cv.width, cv.height);
    if (document.activeElement !== scrub) scrub.value = t;
    $("#time").textContent = `${fmt(t)} / ${fmt(DUR)}`;
    let c = 0;
    CHAPTERS.forEach(([ct], i) => { if (t >= ct) c = i; });
    if (c !== lastCh) {
      [...ch.children].forEach((b, i) => b.setAttribute("aria-current", String(i === c)));
      lastCh = c;
    }
    requestAnimationFrame(loop);
  }

  fit(); sync();
  const loading = loadAll(k => { $("#loadbar").style.width = Math.round(k * 100) + "%"; }).then(ok => {
    ready = true;
    $("#loading").hidden = true;
    $("#bigplay").hidden = false;
    if (!ok) $("#loadnote").hidden = false;
    return ok;
  });
  requestAnimationFrame(loop);

  // Hooks for tools/render_video.mjs.
  let wavBytes = null;
  const off = document.createElement("canvas");
  window.MF = {
    DUR,
    ready: loading,
    frame(ft, w = 1280, h = 720, q = 0.92) {
      off.width = w; off.height = h;
      render(off.getContext("2d"), ft, w, h);
      return off.toDataURL("image/jpeg", q);
    },
    async renderAudio() { wavBytes = wav(await renderSoundtrack()); return wavBytes.length; },
    audioChunk(i, size) {
      const part = wavBytes.subarray(i * size, (i + 1) * size);
      let s = "";
      for (let k = 0; k < part.length; k += 0x8000) s += String.fromCharCode.apply(null, part.subarray(k, k + 0x8000));
      return btoa(s);
    },
  };
})();
