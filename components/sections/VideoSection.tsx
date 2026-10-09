"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// The video's resting width matches the "Haven" heading's width exactly.
// Height is a large fraction of the viewport at rest — already reads as a
// proper hero element, not a sliver that "grows from nothing."
const REST_HEIGHT_RATIO = 0.85;
// The rise (video climbing until its top nears the very top of the
// viewport) completes using only this fraction of the scroll distance the
// heading would naturally need to fully exit on its own — keeps the
// video's climb faster than the heading's own scroll-away rate, so it
// visibly overtakes and covers it, comfortably under 1 so the overtake is
// guaranteed. Also sets the whole transition's scroll duration (see
// totalRunway below) — nudged up slightly for smoother timing.
const RISE_SPEED_FACTOR = 0.55;
// How many pixels of the heading's very top edge are deliberately left
// peeking above the video once the rise finishes — the video covers
// everything below this, but doesn't chase the last sliver away.
const SLIVER_MARGIN = 24;

export default function VideoSection() {
  const wrapperRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const wrapper = wrapperRef.current;
      const frame = frameRef.current;
      if (!wrapper || !frame) return;

      const heading = document.querySelector<HTMLElement>("[data-hero-heading]");
      const headingRect = heading?.getBoundingClientRect();
      // Tied directly to the heading's own measured box rather than a
      // window-width-based centering guess, so the match is pixel-precise
      // regardless of the page's own padding/scrollbar quirks.
      const headingLeft = headingRect?.left ?? window.innerWidth * 0.2;

      const restWidth = headingRect?.width ?? window.innerWidth * 0.6;
      const restHeight = window.innerHeight * REST_HEIGHT_RATIO;
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight;

      // Resting state: exact width/position match with the heading,
      // already fully rendered in normal document flow — visible without
      // any scrolling.
      gsap.set(frame, {
        position: "absolute",
        top: 0,
        left: headingLeft,
        width: restWidth,
        height: restHeight,
      });

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      // Pin the wrapper exactly wherever it naturally sits (right under the
      // heading) instead of waiting for it to reach the top of the
      // viewport — pinning at "top top" would only ever engage once the
      // heading has already fully scrolled away, since everything above a
      // pinned-at-top element must have already exited by definition. By
      // pinning here, the heading is still on screen when the rise starts.
      const wrapperTop = wrapper.getBoundingClientRect().top;
      const startPercent = (wrapperTop / window.innerHeight) * 100;

      // How far up the frame must travel so its top edge lands just
      // SLIVER_MARGIN below the viewport's own top — a large, reliable
      // distance driven only by the wrapper's own measured position, not
      // by a second, fragile measurement of the heading that can interact
      // unpredictably with manual layout tweaks (e.g. the -mt-25 lift).
      const riseTargetOffset = Math.max(wrapperTop - SLIVER_MARGIN, 1);
      // Pin duration is exactly the rise's own scroll distance — nothing
      // is appended after it finishes, so the moment the rise (and width,
      // which completes earlier) are done, the pin releases immediately.
      // No leftover pinned scroll distance means no "stuck" feeling and no
      // extra gap before the next section.
      const totalRunway = Math.max(wrapperTop * RISE_SPEED_FACTOR, 1);

      ScrollTrigger.create({
        trigger: wrapper,
        start: `top ${startPercent}%`,
        end: `+=${totalRunway}`,
        scrub: true,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const t = self.progress;

          // Vertical rise: frame's top moves from 0 (aligned with the
          // pinned wrapper) to fully negative, landing SLIVER_MARGIN below
          // the viewport's top at t=1 — covering the heading almost
          // entirely, deliberately leaving just its very top edge peeking
          // above the video. Height grows to fill the viewport. The
          // wrapper's own declared height (h-40) is kept
          // deliberately small — just enough for a natural pin-spacer and
          // a little breathing room, not a full extra viewport — so the
          // next section begins shortly after the pin releases, no
          // sizeable leftover gap.
          const top = -riseTargetOffset * t;
          const height = restHeight + (fullHeight - restHeight) * t;

          // Width: a single continuous ramp from the heading's width to
          // full viewport width, driven by the exact same t as the rise —
          // both reach their end state together at t=1, so "fully covers
          // Haven" and "100vw reached" are the same instant. That instant
          // is also exactly when the pin releases (end of scroll range),
          // so there's no stretch where width is already maxed out but the
          // page still hasn't handed scroll back.
          const width = restWidth + (fullWidth - restWidth) * t;
          const left = headingLeft + (0 - headingLeft) * t;

          gsap.set(frame, { top, left, width, height });
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapperRef} className="relative -mt-25 h-40 w-full overflow-visible">
      <div
        ref={frameRef}
        className="absolute z-40 overflow-hidden bg-white will-change-[top,left,width,height]"
      >
        <video
          className="h-full w-full object-cover"
          src="/videos/hero-section.mp4"
          poster="/images/video-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>
    </section>
  );
}
