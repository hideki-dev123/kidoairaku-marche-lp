# Scroll-driven film introduction

Baseline: `hideki-dev123/kidoairaku-marche-lp`, main
`6a9ae4d84ec75870a2b3c8cd65681b0b6113e51f`.

## Structure and timeline

`ScrollIntro` wraps the existing Hero without copying or rewriting its content.
The sticky stage contains the complete, naturally sized Hero. The wrapper adds
300svh of scroll travel, producing approximately 410–428svh in the tested layouts.
After the travel ends, the whole Hero—including content below a short viewport—
scrolls normally. The `#top` anchor sits at the end of this travel.

| Progress over the 300svh travel | Behavior |
| --- | --- |
| 0–78% | Native `currentTime` scrubbing of the 10-second film |
| 78–82% | Last displayable frame held; Hero remains hidden |
| 82–100% | Film dissolves; existing artwork, eyebrow, headline, lead, emotions, date, CTA reveal in order |
| 100% onward | Normal Hero/page scrolling and original navigation |

The last frame must have decoded before reveal is allowed, including when the
user jumps directly to the end. Scroll reversal reverses every intro phase.
The shared `MotionExperience` requestAnimationFrame scheduler runs all updates;
seeks are coalesced while the decoder is busy. On iPhone/iPad, the first touch
briefly starts and pauses the muted inline video to unlock Safari's media decoder;
the film continues to advance only from scroll-driven `currentTime` seeks. No
timed autoplay, scroll hijacking or animation dependency is used. Existing Hero
entry animations are disabled only inside the intro; its later ambient/pointer
motion remains intact.

The film scales by at most 2.5% and blurs by at most 2px while fading. Hero lifts
64px and scales from .985 to 1. Topbar and mobile CTA fade in during the reveal;
hidden controls are inert. Portrait layouts enlarge the central composition
while preserving the vortex and lettering, feathering the empty vertical edges.

## Video

- `public/videos/marche-intro-scrub.mp4`: 6,504,645 bytes, 1280×720, 24fps, 10s.
- `public/videos/marche-intro-poster.jpg`: 12,360 bytes, matching first frame.
- Original attachment remains untouched in Downloads (4,784,282 bytes).
- Original SHA-256: `98df1442c0317b7bd3c6b71dd2445533d7f2bc117dd2046370fad3d9ce29a7e8`.
- Derived MP4 SHA-256: `b1b3331453ccd24f2e50c6ee014e8bf33bdff50ce693d8dd1e31153f1c0938f2`.

The original had only one keyframe across all 240 frames. The derived film uses
H.264, yuv420p, CRF 18, faststart, no audio, no B-frames, and a six-frame/0.25s GOP.

```sh
ffmpeg -i input.mp4 -an -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -movflags +faststart public/videos/marche-intro-scrub.mp4
ffmpeg -i public/videos/marche-intro-scrub.mp4 -frames:v 1 \
  -pix_fmt yuvj420p -q:v 2 public/videos/marche-intro-poster.jpg
```

## Fallbacks

- Reduced motion: no intro runway; existing Hero is immediately available.
- Preference changes during the film: collapse the runway and keep Hero in view.
- JavaScript disabled: CSS in `noscript` restores the normal Hero/navigation.
- Skip button: restores Hero and focuses its heading.
- Network/decode error or 15-second loading watchdog: restore usable Hero. This
  timer never controls film progress or determines film completion.
- Hosts without usable HTTP Range seeking: download the film as a Blob and use
  that local seekable source. This costs roughly 6.5MB of Blob memory and may add
  a download before scrubbing; it requires no Cloudflare configuration change.

## Validation

```sh
npm run build
npm test
npm run lint
```

`npm test` builds the Worker, verifies rendered HTML, and checks timeline gating
and reversal. Browser QA uses an externally installed Playwright (not an app
dependency). Start a local Worker preview after building:

```sh
npx wrangler dev --config dist/server/wrangler.json --port 4174
INTRO_TEST_URL=http://127.0.0.1:4174 npm run test:intro:browser
```

`PLAYWRIGHT_MODULE` can point to a preinstalled Playwright `index.mjs` file URL.
Screenshots and machine-readable results are written to ignored
`outputs/intro-qa/`. Tests cover Desktop 1440×900 / 1280×720, Tablet 768×1024,
Mobile 375×812 / 390×844 / 430×932, all film stages, hold/reveal/end, reversal,
stop, reload, reduced motion, no JS, video failure, skip and `#top` entry.

Verified on 2026-09-10: build succeeded; all four `npm test` checks passed; lint
passed with the existing `StaticImage.tsx` no-img-element warning. All six
viewport runs, all six fallback/navigation scenarios, and an iPhone user-gesture
unlock scenario passed against the built local Worker. Additional native wheel input moved 120px and scrubbed to
0.709s; a Chromium touch gesture moved 285px and scrubbed to 1.437s with the video
still paused. Ordinary page scroll after the completed Hero was also verified.
The manual input demonstration is in ignored
`outputs/intro-qa/scroll-intro-demo.webm`.

## Existing environment limitations

- This repository's Vinext 0.0.50 emits local `file:///.../.vinext/fonts/*.woff2`
  URLs on Windows, producing font console errors in both dev and built preview.
  `ALLOW_WINDOWS_VINEXT_FONT_ERRORS=1` records and allows only that exact error
  class; all other console/page errors still fail browser QA. Font configuration
  and the existing layout are unchanged.
- The optional `tsc --noEmit` check encounters pre-existing missing
  `cloudflare:workers`, `Fetcher`, and `D1Database` types. Build and runtime tests
  are independent of this ambient-type setup.
- Vinext sets `history.scrollRestoration = "manual"`; reload returns to the top
  and the intro resets to 0%. That policy is preserved.
- Browser QA includes iPhone UA/touch emulation, but physical iOS Safari and Mac
  trackpad hardware were not available for verification.
- Hosting/Worker configuration, SEO, original copy, Google Forms, existing
  images and sections after Hero are unchanged. Production deployment is
  managed separately from this repository's GitHub `main` branch.
