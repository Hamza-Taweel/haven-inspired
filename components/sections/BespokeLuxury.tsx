"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_SIZE_CLASSES =
  "h-[28vw] max-h-[490px] min-h-[195px] w-[32vw] min-w-[220px] max-w-[560px]";

// Continuous scroll-scrubbed sequence: one grow box scales from its resting
// frame size all the way to a full-viewport frame while its four images take
// turns filling it — each one a hard, instant swap (no crossfade) but each
// also continuously zooming across its own active quarter of progress, so
// the size never resets even though the swap itself is clean. Everything is
// driven from raw ScrollTrigger progress on every tick — no held buffers, no
// separate tweens — so scroll position maps 1:1 to every visual value.
const ZOOM_AMOUNT = 0.16;
const IMAGE_COUNT = 4;
// Progress at which the LAST image becomes active. The first three images
// swap within [0, LAST_IMAGE_START] while the panel is still smaller than
// the viewport (so "Bespoke" / "Luxury" are visible as each swaps in); the
// last image then holds from here to 1 as the panel grows to full-bleed.
const LAST_IMAGE_START = 0.6;
// The resting frame starts at this scale (uniform transform scale, so width
// and height always grow at the same rate and aspect ratio is preserved)
// and grows to 1 purely from normal (unpinned) page scroll as the section
// arrives, so the image is already mid-motion by the time the pinned
// sequence below takes over — no scroll-then-lock-then-animate handoff.
const ENTRY_START_SCALE = 0.4;

export default function BespokeLuxury() {
  const sectionRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const growBoxRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const image3Ref = useRef<HTMLDivElement>(null);
  const image4Ref = useRef<HTMLDivElement>(null);
  const estRef = useRef<HTMLSpanElement>(null);
  const bespokeRef = useRef<HTMLSpanElement>(null);
  const luxuryRef = useRef<HTMLSpanElement>(null);
  const melbourneRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const growBox = growBoxRef.current;
      const measure = measureRef.current;
      const images = [image1Ref.current, image2Ref.current, image3Ref.current, image4Ref.current];
      if (!growBox || !measure || images.some((img) => !img)) return;

      // Measure the resting (small) frame and the full-viewport target, both
      // relative to the section. The grow box animates its actual box model
      // (not a transform scale) between the two so `object-cover` keeps
      // re-cropping fresh at each size instead of blowing up a small crop.
      const sectionRect = sectionRef.current!.getBoundingClientRect();
      const measureRect = measure.getBoundingClientRect();
      const small = {
        top: measureRect.top - sectionRect.top,
        left: measureRect.left - sectionRect.left,
        width: measureRect.width,
        height: measureRect.height,
      };
      // The panel grows all the way to a full-bleed, full-viewport frame by
      // the end of the scroll — the last image fills the entire page.
      const full = { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };

      // First three images divide [0, LAST_IMAGE_START] evenly; the last
      // image spans [LAST_IMAGE_START, 1] so it stays on screen while the
      // panel finishes growing to full-bleed.
      const boundaries = Array.from({ length: IMAGE_COUNT + 1 }, (_, i) =>
        i < IMAGE_COUNT ? (i / (IMAGE_COUNT - 1)) * LAST_IMAGE_START : 1
      );
      // Content stops drifting outward the moment the last image becomes
      // active — it holds at the panel's sides, staying readable until the
      // growing panel finally covers it near full-bleed.
      const contentFreezeProgress = boundaries[IMAGE_COUNT - 1];

      const update = (progress: number) => {
        gsap.set(growBox, {
          top: small.top + (full.top - small.top) * progress,
          left: small.left + (full.left - small.left) * progress,
          width: small.width + (full.width - small.width) * progress,
          height: small.height + (full.height - small.height) * progress,
        });

        images.forEach((img, i) => {
          const stageStart = boundaries[i];
          const stageEnd = boundaries[i + 1];
          // Hard, instant swap — exactly one image is opaque at any given
          // progress value, no overlap, no gap.
          const active = progress >= stageStart && (i === IMAGE_COUNT - 1 ? progress <= stageEnd : progress < stageEnd);

          // Each image continuously zooms across its own active quarter of
          // progress, reaching max zoom right as the next one swaps in —
          // the size never resets even though the swap itself is instant.
          const zoomT = Math.min(Math.max((progress - stageStart) / (stageEnd - stageStart), 0), 1);

          gsap.set(img, { opacity: active ? 1 : 0, scale: 1 + zoomT * ZOOM_AMOUNT });
        });

        // Content drifts outward slowly, never fading, and holds its
        // position once the last image takes over — the growing panel then
        // rises over it via z-index as it fills the page.
        const contentProgress = Math.min(progress, contentFreezeProgress);
        gsap.set(estRef.current, { y: -contentProgress * 20 });
        gsap.set(melbourneRef.current, { y: contentProgress * 20 });
        gsap.set(bespokeRef.current, { x: -contentProgress * 45 });
        gsap.set(luxuryRef.current, { x: contentProgress * 45 });
      };

      update(0);
      gsap.set(growBox, { scale: ENTRY_START_SCALE, transformOrigin: "50% 50%" });

      // Phase A — unpinned: spans the section's entire entrance, from the
      // instant its top crosses the bottom of the viewport (first pixel
      // appearing) to the instant its top reaches the very top of the
      // viewport (where Phase B's pin takes over). Every bit of scroll
      // across that whole span maps directly to scale — no early finish, no
      // freeze, no gap before the pinned sequence picks it up.
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      }).fromTo(growBox, { scale: ENTRY_START_SCALE }, { scale: 1, ease: "none" });

      // Phase B — pinned: the image-swap + grow-to-fullscreen sequence takes
      // over the instant the section reaches the top of the viewport.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=120%",
        scrub: true,
        pin: true,
        onUpdate: (self) => update(self.progress),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 h-screen w-full overflow-hidden bg-white">
      <span
        ref={estRef}
        className="absolute top-[10%] left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-wider text-black"
      >
        Est. 1990
      </span>

      <span
        ref={bespokeRef}
        className="absolute top-1/2 left-[6%] -translate-y-1/2 text-3xl font-normal text-black sm:text-4xl lg:text-5xl"
      >
        Bespoke
      </span>

      <span
        ref={luxuryRef}
        className="absolute top-1/2 right-[6%] -translate-y-1/2 text-3xl font-normal text-black sm:text-4xl lg:text-5xl"
      >
        Luxury
      </span>

      <span
        ref={melbourneRef}
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-wider text-black"
      >
        Melbourne
      </span>

      {/* Hidden reference used only to measure the frame's natural resting
          box via getBoundingClientRect, so the grow box below can be driven
          from real numbers instead of duplicating Tailwind's responsive
          clamp() math by hand. */}
      <div
        ref={measureRef}
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 ${FRAME_SIZE_CLASSES}`}
      />

      <div
        ref={growBoxRef}
        className="absolute z-20 overflow-hidden will-change-[top,left,width,height]"
      >
        <div ref={image1Ref} className="absolute inset-0">
          <Image
            src="/images/bespoke-section/Image_1-1.webp"
            alt="Bespoke joinery detail"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div ref={image2Ref} className="absolute inset-0">
          <Image
            src="/images/bespoke-section/Image_2-1.webp"
            alt="Bespoke interior detail"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div ref={image3Ref} className="absolute inset-0">
          <Image
            src="/images/bespoke-section/Image_3-1-scaled.webp"
            alt="Bespoke material detail"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div ref={image4Ref} className="absolute inset-0">
          <Image
            src="/images/bespoke-section/Kitchen-area-23-1.webp"
            alt="Bespoke kitchen area"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
