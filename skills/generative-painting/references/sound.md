# Sound

**User preference (important):** the style's author wants scores that are **soothing, low and quiet**, with gentle exploration and no loud moments. They liked the widening grain-cloud sound (the `dust` character) and disliked thumps, noise bursts and bright pads. The engine ships `src/score-soft.js` for this: grain-cloud shades per shot, a low drone, one slow wandering melodic line in a consonant scale, and a slow leveller. It measures about −22 LUFS with a momentary maximum around −18. Use it by default. The table below describes the original, livelier `score.js`, for when energy is explicitly wanted.

`src/score.js` is a pure-JS offline synth. It uses FM bells, Karplus-Strong plucks, band-limited noise, micro-grains, detuned pads, a pitch-dropping thump, a Schroeder reverb and a loop-length drone. There are no samples. Node export and browser preview render identical samples.

**What the seed decides.** `AUDIO_SEED` in `film.js` is a random 20-character string. It chooses the mode (from 5 scales), root, tempo (84–131 BPM), swing, bell inharmonicity, pluck brightness and reverb size. Re-roll it (`scripts/new-film.sh` does this automatically) until the palette of sound suits the film. The original used `3l5ngyddysc7gxx58uy6`: hirajoshi, B2, 104 BPM, glassy bells.

**What the edit decides.** Each shot's `sound` sets its texture, and changes land on the exact frame of the cut. A `repeatOf` shot reuses its source shot's generator, so the loop sounds like the start again. Tails wrap circularly and the drone completes whole cycles over the film, which keeps the file loop-seamless.

| `sound` | Texture | Give it to |
|---|---|---|
| `exuberant` | thump, swung pluck/bell run, sparkle grains | the dense saturated opener/loop |
| `textile` | repeating 4-note pluck cell | patterns |
| `engraved` | dry scratch-clicks, sparse bell | fine linework |
| `night` | low pad, sparse high bells | dark voids |
| `wreath` | circular arpeggio panned around | rings and perimeters |
| `canopy` | dark pad, low plucks, air | dark lush glazes |
| `corners` | four hard-panned bells | four-corner layouts |
| `ornament` | nine even plucks in 3 rows | grids |
| `specimen` | three distinct isolated notes | few isolated objects |
| `dust` | widening grain cloud | particles loosening |
| `engineering` | ticks, noise bursts, thump, harsh pad | technical/punk plates |
| `radial` | grain burst settling into a chord | particle blooms |
| `wildflower` | scattered plucks | fields and crowds |
| `measured` | metronome clicks and a glass chord | diagrams |
| `nothing` | near-silence, one tiny tone | "almost nothing" |
| `single` / `inside` | one chord; the crop plays it darker and low-passed | hero → crop pair (keyed by plate, so both share the chord) |
| `monument` | a swell with a rising bell ladder | the long hold |
| `landscape` | an open pad with distant plucks | landscapes |
| `journal` | pencil-scratch noise, soft clicks | notebook pages |

Match the character to *what the painting is*, not to its subject. The export measures loudness and peak, so the WAV lands around −16 LUFS, which suits social platforms. You can't hear the result, so be honest about it: say the audio was verified by measurement, and let the user judge the taste. A silent film is fine too. Drop the audio input from the ffmpeg command if the user wants one.
