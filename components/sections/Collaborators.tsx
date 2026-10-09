"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import Container from "@/components/ui/Container";
import { crookedRiseReveal, splitIntoWords } from "@/lib/animations";

type Collaborator = {
  name: string;
  description: string;
};

const COLLABORATORS: Collaborator[] = [
  { name: "Cumulus Studio", description: "Award winning architecture" },
  { name: "Sussex", description: "Australian leading tapware" },
  { name: "Sketch Design & Interiors", description: "Architects" },
  { name: "Miele", description: "Premium appliances" },
  { name: "Bespoke", description: "Windows and doors" },
];

type GalleryItem = {
  src: string;
  caption: string;
};

const GALLERY: GalleryItem[] = [
  { src: "/images/collabs/Img-1.jpg", caption: "In close partnership with Cumulus Studio" },
  { src: "/images/collabs/Img-2.jpg", caption: "Beautiful tapware by Sussex Taps" },
  { src: "/images/collabs/Img-3.jpg", caption: "Award winning interiors by Sketch Design" },
  { src: "/images/collabs/Img-4.jpg", caption: "Finishing touches added with Miele" },
  { src: "/images/collabs/Img-5.jpg", caption: "High-end Bespoke windows and doors" },
];

// Both slots sit fully visible at rest — only stacking order (z-index)
// determines which one shows. During a transition the CURRENT image stays
// put as a backdrop while the UPCOMING image (raised on top) slides in over
// it from the leading edge. clip-path is kept fully open throughout; the
// frame's own overflow-hidden clips the incoming while it's still off-edge.
const CLIP_VISIBLE = "inset(0 0 0 0)";

function CollaboratorGallery() {
  // Two stacked slots ping-pong the "front" (currently-shown) role between
  // them. A nav click loads the upcoming image into the back slot, RAISES it
  // above the current one, and slides it in from the leading edge so it
  // sweeps across and covers the current image — the incoming (background)
  // image is the one that moves, folding the current one away along a single
  // hard edge. The current image stays put underneath as a backdrop, so the
  // sweep never exposes the empty frame.
  const [slotIndices, setSlotIndices] = useState<[number, number]>([0, 1]);
  const [frontSlot, setFrontSlot] = useState<0 | 1>(0);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const slot0Ref = useRef<HTMLDivElement>(null);
  const slot1Ref = useRef<HTMLDivElement>(null);
  const captionRowRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const isAnimatingRef = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (cursorRef.current) {
      quickX.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3" });
      quickY.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3" });
    }
  }, []);

  const currentGalleryIndex = slotIndices[frontSlot];

  // Caption/counter row slides gently down from above and fades in every
  // time the active image changes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!captionRowRef.current) return;
    gsap.fromTo(
      captionRowRef.current,
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }
    );
  }, [currentGalleryIndex]);

  const handleNav = (direction: "next" | "prev") => {
    if (isAnimatingRef.current) return;

    const goingNext = direction === "next";
    const front = frontSlot;
    const back = front === 0 ? 1 : 0;
    const frontEl = front === 0 ? slot0Ref.current : slot1Ref.current;
    const backEl = back === 0 ? slot0Ref.current : slot1Ref.current;
    if (!frontEl || !backEl) return;

    isAnimatingRef.current = true;

    const nextGalleryIndex = goingNext
      ? (slotIndices[front] + 1) % GALLERY.length
      : (slotIndices[front] - 1 + GALLERY.length) % GALLERY.length;

    setSlotIndices((prev) => {
      const next: [number, number] = [...prev];
      next[back] = nextGalleryIndex;
      return next;
    });

    // The current image stays put underneath as a static backdrop while the
    // upcoming image, raised on top, slides in from the leading edge and
    // covers it — so it reads as the incoming (background) image itself
    // moving in to fold the current one away, along the same edge and
    // direction as before. No cross-fade: one clean, hard sweeping edge. The
    // off-edge start position is clipped by the frame's overflow-hidden.
    gsap.set(frontEl, { clipPath: CLIP_VISIBLE, x: "0%", zIndex: 1 });
    gsap.set(backEl, { clipPath: CLIP_VISIBLE, x: goingNext ? "-100%" : "100%", zIndex: 2 });

    gsap.to(backEl, {
      x: "0%",
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        setFrontSlot(back);
        isAnimatingRef.current = false;
      },
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    quickX.current?.(x);
    quickY.current?.(e.clientY - rect.top);
    setHoverSide(x < rect.width / 2 ? "left" : "right");
  };

  const current = GALLERY[currentGalleryIndex];

  return (
    <div>
      {/* Eagerly preload every gallery image up front, with the same
          fill/sizes combo the visible slots use, so a nav click never
          catches one still downloading — without this, the wipe reveals a
          not-yet-loaded frame, reading as a pause followed by a sudden pop
          once the network fetch finally resolves. */}
      <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        {GALLERY.map((item) => (
          <div key={item.src} className="relative h-px w-px">
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>
        ))}
      </div>

      <div
        ref={frameRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverSide(null)}
        className="relative aspect-[3/2] w-full cursor-none overflow-hidden bg-[#f5f5f5]"
      >
        <div
          ref={slot0Ref}
          className="absolute inset-0 will-change-transform"
          style={{ clipPath: CLIP_VISIBLE, zIndex: frontSlot === 0 ? 2 : 1 }}
        >
          <Image
            src={GALLERY[slotIndices[0]].src}
            alt={GALLERY[slotIndices[0]].caption}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        </div>
        <div
          ref={slot1Ref}
          className="absolute inset-0 will-change-transform"
          style={{ clipPath: CLIP_VISIBLE, zIndex: frontSlot === 1 ? 2 : 1 }}
        >
          <Image
            src={GALLERY[slotIndices[1]].src}
            alt={GALLERY[slotIndices[1]].caption}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        <button
          type="button"
          aria-label="Previous image"
          onClick={() => handleNav("prev")}
          className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-none"
        />
        <button
          type="button"
          aria-label="Next image"
          onClick={() => handleNav("next")}
          className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-none"
        />

        {/* custom cursor — the label itself, not a separate overlay */}
        <div
          ref={cursorRef}
          className={`pointer-events-none absolute top-0 left-0 z-20 -translate-x-1/2 -translate-y-1/2 text-2xl font-light text-white [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] transition-opacity duration-200 ease-in-out sm:text-3xl ${
            hoverSide ? "opacity-100" : "opacity-0"
          }`}
        >
          {hoverSide === "left" ? "Prev" : "Next"}
        </div>
      </div>

      <div
        ref={captionRowRef}
        className="mt-4 flex items-center justify-between text-[15px] text-[#1a1a1a]"
      >
        <span>
          {currentGalleryIndex + 1}/{GALLERY.length}
        </span>
        <span>{current.caption}</span>
      </div>
    </div>
  );
}

export default function Collaborators() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const descRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const names = nameRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      const descriptions = descRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      if (names.length === 0 || !paragraphRef.current || descriptions.length === 0) return;

      const labelWords = splitIntoWords(labelRef.current);
      const paragraphWords = splitIntoWords(paragraphRef.current);
      const nameWords = names.flatMap((el) => splitIntoWords(el));
      const descWords = descriptions.flatMap((el) => splitIntoWords(el));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.add(crookedRiseReveal(labelWords))
        .add(crookedRiseReveal(paragraphWords), "-=0.35")
        .add(crookedRiseReveal(nameWords), "-=0.3")
        .add(crookedRiseReveal(descWords), "-=0.25");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="md:col-span-4">
            <div className="flex items-start gap-2 text-sm font-medium text-[#1a1a1a]">
              <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-[#1a1a1a]" />
              <span ref={labelRef}>Our collaborators</span>
            </div>

            <div className="mt-6 w-full border-t border-black/10" />

            <p
              ref={paragraphRef}
              className="mt-8 text-[17.8864px] leading-[26.8296px] text-[#252320]"
            >
              Haven partners with leading architects and designers to realise ideas with
              integrity and precision. Our relationships are built on trust, detail, and shared
              respect for design.
            </p>

            <div className="mt-10 border-t border-black/10">
              {COLLABORATORS.map((collaborator, i) => (
                <div
                  key={collaborator.name}
                  className="flex items-center justify-between gap-4 border-b border-black/10 py-4 text-[15px] text-[#1a1a1a]"
                >
                  <span
                    ref={(el) => {
                      nameRefs.current[i] = el;
                    }}
                  >
                    {collaborator.name}
                  </span>
                  <span
                    ref={(el) => {
                      descRefs.current[i] = el;
                    }}
                    className="text-right text-[#252320]/80"
                  >
                    {collaborator.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8">
            <CollaboratorGallery />
          </div>
        </div>
      </Container>
    </section>
  );
}
