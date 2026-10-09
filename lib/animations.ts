import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits an element's text into words, each wrapped in an overflow-hidden
 * mask with an inner mover span. Feed the returned movers into
 * `crookedRiseReveal`. Safe to call again on an already-split element.
 */
export function splitIntoWords(el: HTMLElement | null): HTMLElement[] {
  if (!el) return [];
  const words = (el.textContent ?? "").split(/\s+/).filter(Boolean);
  el.innerHTML = words
    .map(
      (word) =>
        `<span class="word-mask inline-block overflow-hidden align-top"><span class="word-inner inline-block will-change-transform">${word}</span></span>`
    )
    .join(" ");
  return Array.from(el.querySelectorAll<HTMLElement>(".word-inner"));
}

/**
 * "Crooked Rise" text reveal — words slide up out of their mask on a
 * slightly twisted, left-to-right staggered wave rather than rising
 * straight and uniform. Pair with `splitIntoWords` to build the `words`
 * array, and chain multiple calls into one gsap.timeline for a
 * heading/paragraph sequence.
 */
export function crookedRiseReveal(words: HTMLElement[], extra?: gsap.TweenVars) {
  return gsap.fromTo(
    words,
    { yPercent: 120, rotate: (i: number) => (i % 2 === 0 ? 7 : -7) },
    {
      yPercent: 0,
      rotate: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.018,
      ...extra,
    }
  );
}

/**
 * "Photo Drift" parallax — an oversized image slides vertically inside an
 * overflow-hidden frame, scrubbed directly to scroll position. `range` is
 * the percentage travelled in each direction (e.g. 22 = ±22%). The media
 * element must be sized with `photoDriftBufferStyle(range)` so the drift
 * never reveals empty edges.
 */
export function photoDrift(
  mediaEl: HTMLElement | null,
  frameEl: HTMLElement | null,
  range = 22
) {
  if (!mediaEl || !frameEl) return;
  return gsap.fromTo(
    mediaEl,
    { yPercent: -range },
    {
      yPercent: range,
      ease: "none",
      scrollTrigger: {
        trigger: frameEl,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}

/**
 * Inline style for the `photoDrift` media element: buffers it above/below
 * the frame by `range` percent so the ±range drift always stays covered.
 * Use the same `range` value passed to `photoDrift`.
 */
export function photoDriftBufferStyle(range = 22): CSSProperties {
  return {
    top: `-${range}%`,
    height: `${100 + range * 2}%`,
  };
}
