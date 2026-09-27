# Verifying a pointillist film

## Automated (`npm run export` → `checks.json`; the export fails if any fail)

- Every plate is painted, with no browser errors and no blank or uniform plates.
- **Static holds are bit-identical** across their frames (no fizz or shimmer).
- **Motion shots change** frame to frame. A gathering passage may settle, so a repeated last frame is fine.
- **Every cut changes the image**, and **`repeatOf` shots equal their source** (the loop).
- **Determinism:** out-of-order seeks equal sequential capture.
- **Compression:** decoded native MP4 against the lossless frame, compared **in the video's colour space**. The frame is converted to yuv420p and must score **≥ 40 dB on Y, U and V**. RGB PSNR is reported too.
- **Both MP4s:** H.264 yuv420p, the exact frame count and duration, and an audio stream.
- **Translation mode** adds three more: the capture is pixel-identical to the source plates, the source AAC stream is stream-copied (MD5 equal), and the output never lands inside the source.

## Why RGB PSNR is low on some plates (and why that's acceptable)

Dense complementary dots (a blue fleck inside gold, for example) sit closer together than H.264's 4:2:0 colour resolution, so their hues blend in the delivered video. A **lossless** yuv420p encode scores the same RGB PSNR (around 25 dB on the densest plates), so bitrate can't fix it. The YUV-domain check (usually ≥ 46 dB) shows the encode itself is excellent. To confirm the marks survive, decode one frame, then crop and zoom it 3× against the lossless PNG:

```bash
ffmpeg -i out/<id>/<id>-native.mp4 -vf "select=eq(n\,<frame>)" -frames:v 1 dec.png
ffmpeg -i anchors/<file>.png -i dec.png -filter_complex "[0]crop=150:150:300:300,scale=450:450:flags=neighbor[a];[1]crop=150:150:300:300,scale=450:450:flags=neighbor[b];[a][b]hstack" crop.png
```

If marks really vanish, enlarge or simplify them first. Only 4:4:4 delivery (not widely supported) or a genuine higher-resolution render keeps full colour resolution. The 1080 delivery file is a Lanczos upscale of the 600 master; always call it that, never a re-render.

## Tools (`engine/tools/`, copied into every project as `tools/`)

| Command | Purpose |
|---|---|
| `python3 tools/cut_audit.py out/<id>` | measures the six axes (G P D S M C) for every cut and writes `cut-audit.json` |
| `python3 tools/thumb_delta.py out/<id> [ids…]` | thumbnail ΔE and ΔL, original or underpainting vs pointillist |
| `node tools/playback_check.mjs --port 4195` | real-time preview rate (target 1.00×) and browser errors |
| Phone check | `ffmpeg -pattern_type glob -i 'out/<id>/anchors/*.png' -vf "scale=96:96:flags=area,tile=11x2" -frames:v 1 phone.png` — every focal subject must still read |
| Plates vs video | every static plate PNG must equal its exported anchor frame, compared as decoded RGBA |
| Sound | `ffmpeg -i <id>.wav -af ebur128=peak=true -f null -` gives integrated loudness (about −22 LUFS for the soft score), loudness range and true peak; check that no second is much louder than the rest |

## Visual review (do it; numbers don't replace it)

1. **Contact sheet:** does the film read as varied in arrangement, scale, density and mark organisation, not as a palette swap of one texture?
2. **Every plate at full size:** do the dots read as painted colour, not noise or confetti? Are silhouettes clear? Is anything muddy on dark grounds?
3. **Both sides of every cut:** does each change at least three axes perceptibly?
4. **Particles at start, middle and end:** is the core coherent, does it settle, and is nothing left solid behind moving dots?
5. **Hero → crop:** do the same pixels become abstract rhythm?
6. **Loop:** does the last shot equal the first?
7. **Real time:** watch and listen at normal speed. Say plainly if you could only measure and not watch or listen.

## Known limits to report honestly

- AAC adds about 5 ms of encoder padding, so an MP4 set to loop may show a tiny audio gap. The WAV loops perfectly.
- Thumbnail ΔE around 6–7 remains on dark, saturated translated plates.
- The cut audit undercounts hue-family changes between pale grounds.
