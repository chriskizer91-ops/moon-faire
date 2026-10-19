# Music of the Moon Faire

Chris's songs for Moon Faire, made small for the game and broken down into their key, beat, bars, chords and named parts, so the game and the films can play any part of any song and tune their bells to it.

## The songs

| Song | Key | Beat | Speed | Length | File | Page |
|---|---|---|---|---|---|---|
| [Carnival of Ashes](carnival-of-ashes/breakdown.md) | G minor | waltz, 3 to the bar | about 140, slowing to 120; the opening is 160 | 2:28 | 1.3 MB | https://claude.ai/artifact/FQ7G2X3Db5BA7uEKQfHNwh |

`songs.json` lists every song with its file and its parts, so the game reads one file to find any part.

## How songs are kept

- **One small file per song**: Opus at 64 kbps stereo, levelled to -16 LUFS like `art/music/`. That's about 0.5 MB a minute, against 11.5 MB for Suno's WAV and 1 MB for the films' MP3s, and in listening tests Opus at 64 kbps sounds about as good as MP3 at 128. Every current desktop browser and Android phone plays it, and iPhones from iOS 18.4.
- **Encoded once, from the WAV.** The breakdown is measured from the Opus file, so rebuilding never puts the sound through the encoder a second time.
- **Parts are times, not files.** A part is a start and an end in the song's one file, in seconds. The game and the films play a part by seeking to its start, and a part can loop between its start and end.
- **No WAV or lossless copy in the repo.** Suno keeps the original, so it can be downloaded again if a song ever needs re-encoding.

## What each song's folder holds

- `<song>.opus`: the song.
- `breakdown.md`: the breakdown in plain words. Start here.
- `breakdown.json`: everything measured: every beat, each part's bar lines and chords, the speed once a second, the loudness four times a second.
- `<song>.html`: the phone page. Tap a number to hear one part, or tap the strip to jump.
- `sections.json`: the only file written by hand. Where each part starts, its name, what it sounds like, what it's good for, and the notes on the song as a whole.

## Bringing in a song

Chris sends the WAV (an MP3 works too, but a WAV is better, since it's only encoded once). Then:

```
pip install librosa matplotlib          # plus ffmpeg with libopus, which the repo's tools already use
python3 music-of-the-moon-faire/tools/breakdown.py add <song.wav> --look <a folder outside the repo>
```

1. `add` encodes the song, measures it and drafts `sections.json`, with each part's start where the sound changes most. `--look` draws the song, 50 seconds to a picture, with the drafted starts on it.
2. Check every start against the drawings and move it onto the real change: the band coming in or dropping out, a stop, a swell. The drafted starts land near the changes, rarely on them.
3. Name each part, and write what it sounds like and what it's good for in the films. Mark a part `"bars": true` when the band keeps a steady beat through it, so its bar lines and chords get counted, and `"beat": false` when it has no beat at all (a swell, a held chord). Set `beats_per_bar` for the song (3 for a waltz, 4 for most else). Write the song's `summary`, `bells` and `fit`.
4. `python3 music-of-the-moon-faire/tools/breakdown.py <song-folder>` writes the breakdown, the page and `songs.json`. Read the chords it prints: a part whose chords don't settle into a pattern usually starts a beat or two off.
5. Publish the song's page as an artifact, with the song's `.opus` file published beside it (as `audio/ogg`), and add the song to the table above.

The tool takes its loudness, key and decoding from `tools/pack_audio.py`, so its numbers match that tool's for `art/music/`. It writes only inside this folder.

To use a part in a film, point a `music` segment in the film's `scene.json` at the song's `.opus` file, with `from` and `to` set to the part's start and end.
