# Scroll-Driven Hero Video Transition — Design

Date: 2026-07-01
Scope: `components/sections/VideoSection.tsx` (rewrite in place)

## Problem

The hero video section currently animates by tweening the video frame's
`top/left/width/height` from a small box (sized/positioned relative to the
"Haven" heading) to a full-viewport box as the user scrolls. Because `top`
is interpolated from `0` to `0` the whole time, the frame never actually
translates vertically — it only grows in place. The result reads as a
static box expanding, not a hero scene being "pulled upward" by the scroll.

## Goals

- Video starts centered/sized relative to the heading (unchanged visual
  starting point).
- As the user scrolls, the video combines **scale (zoom)** and **vertical
  translation**, not scale/growth alone.
- No scroll-jacking, pinning, or wheel-blocking — scroll must stay
  continuous the entire time (native CSS `sticky`, not a GSAP `pin`).
- By the time the section's top reaches the top of the viewport, the video
  is full-bleed/full-viewport, and the page continues scrolling normally
  into the next section with no locked/stuck feeling.
- `Wordmark.tsx` and the composition in `page.tsx` are unaffected — no text
  overlay is added on top of the video.

## Non-goals

- No changes to `Wordmark.tsx`, `Header.tsx`, or `page.tsx`.
- No window-resize handling (matches existing behavior — measurements are
  taken once on mount, same limitation as today's implementation).
- No overlay text/content on the video.

## Design

Replace the box-model (`top/left/width/height`) tween with a single
transform-driven element.

**Structure (unchanged):**
- Outer `<section>` gets a computed `marginTop` so its resting position
  sits `HEADING_GAP` below the live "Haven" heading's bottom edge — this
  logic is unchanged from the current implementation.
- Inner container stays `sticky top-0 h-screen w-full overflow-hidden`.

**New animation (replaces the box tween):**
- A single wrapper element inside the sticky container is always laid out
  at full viewport size (`w-full h-full`), with `transform-origin: 50% 0%`
  (top-center).
- `smallScale = (headingWidth * 0.9) / viewportWidth` — reuses the existing
  `WIDTH_RATIO = 0.9` constant, now expressed as a uniform scale factor
  instead of an explicit width.
- At scroll progress `0`: `transform: translateY(48px) scale(smallScale)`.
- At scroll progress `1`: `transform: translateY(0) scale(1)`.
- Both values are linearly interpolated directly against raw
  `ScrollTrigger` progress (`self.progress`) — no synthetic easing curve.
  Linear keeps the video tightly 1:1 coupled to scroll input, which is the
  most reliable way to avoid any perceived lag or "stuck" feeling during
  fast scrolling.
- `transform-origin: 50% 0%` means the scale grows the box symmetrically
  left/right (staying horizontally centered under the heading) while the
  top edge is anchored — combined with the `translateY(48px) → 0` drift,
  the box visibly rises into place while it zooms, rather than only
  expanding from a fixed anchor.
- Uniform scale (same factor on both axes) avoids any video distortion —
  the video element itself stays `w-full h-full object-cover` inside the
  wrapper and is never independently stretched.
- `ScrollTrigger.create({ trigger: section, start: "top bottom", end: "top
  top", scrub: true, onUpdate })` — same trigger config as today. This is
  what already guarantees no pinning/scroll-jacking (CSS `sticky`, not a
  GSAP `pin: true`), so it's kept as-is.

**Reduced motion:**
- If `prefers-reduced-motion: reduce`, skip the scroll-tied transform
  entirely and render the wrapper at its final state (`scale(1)
  translateY(0)`) immediately — consistent with how `LoadingScreen.tsx`
  already handles reduced motion.

## Testing / Verification

Manual, via dev server:
1. Load the page — video should appear sized/centered relative to the
   heading, matching current starting position.
2. Scroll down through the hero — video should visibly rise and zoom
   together, continuously, with no jump or stutter.
3. Confirm the video reaches full-viewport size by the time the section's
   top reaches the top of the viewport.
4. Continue scrolling past the hero — page should flow normally into
   `Collaborators` with no stuck/locked scroll feeling.
5. Emulate `prefers-reduced-motion: reduce` in devtools — video should
   render at full-viewport size with no scroll-tied animation.
