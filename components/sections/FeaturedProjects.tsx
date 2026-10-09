"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import Container from "@/components/ui/Container";
import { crookedRiseReveal, photoDrift, photoDriftBufferStyle, splitIntoWords } from "@/lib/animations";

// Kept small — these tiles are thumbnail-sized, so an aggressive drift would
// read as jittery rather than cinematic.
const TILE_PHOTO_DRIFT_RANGE = 2;

type Project = {
  name: string;
  year: string;
  type: "image" | "video";
  src: string;
  /** wrapper sizing classes for the mosaic grid cell */
  wrapperClassName: string;
};

const CALIBRE: Project = {
  name: "Calibre",
  year: "2025",
  type: "image",
  src: "/images/featuredProjects/img1.webp",
  wrapperClassName: "w-[694.7px] h-[795.9px]",
};

const SMALL_HOUSE: Project = {
  name: "Small House",
  year: "2024",
  type: "video",
  src: "/videos/hero-section.mp4",
  wrapperClassName: "w-[520.4px] h-[584.9px]",
};

const ASOCAT_RESIDENCE: Project = {
  name: "Asocat Residence",
  year: "2019",
  type: "image",
  src: "/images/featuredProjects/img2.webp",
  wrapperClassName: "w-[647px] h-[861.95px]",
};

const ASOCAT_RESIDENCE_DETAIL: Project = {
  name: "Asocat Residence",
  year: "2019",
  type: "image",
  src: "/images/featuredProjects/img3.webp",
  wrapperClassName: "w-[520.4px] h-[584.9px]",
};

function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Keeps the name/year clamped fully inside the image — they never cross
// the top or bottom edge even when the cursor does.
const LABEL_EDGE_MARGIN = 20;

function ProjectTile({ project, className }: { project: Project; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const quickNameY = useRef<gsap.QuickToFunc | null>(null);
  const quickYearY = useRef<gsap.QuickToFunc | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      photoDrift(mediaRef.current, wrapperRef.current, TILE_PHOTO_DRIFT_RANGE);

      if (cursorRef.current) {
        quickX.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.3, ease: "power3" });
        quickY.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.3, ease: "power3" });
      }
      // Labels are anchored top-0 and vertically centered on their own y
      // coordinate via yPercent, so setting `y` places their center exactly
      // at that pixel line — the same line the cursor is on.
      if (nameRef.current) {
        gsap.set(nameRef.current, { yPercent: -50 });
        quickNameY.current = gsap.quickTo(nameRef.current, "y", { duration: 0.05, ease: "none" });
      }
      if (yearRef.current) {
        gsap.set(yearRef.current, { yPercent: -50 });
        quickYearY.current = gsap.quickTo(yearRef.current, "y", { duration: 0.05, ease: "none" });
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // Cursor's Y within the tile, clamped so the label never crosses the
  // image's top/bottom edge no matter where the cursor is.
  const clampedYFor = (clientY: number, rect: DOMRect) => {
    const relativeY = clientY - rect.top;
    return Math.min(Math.max(relativeY, LABEL_EDGE_MARGIN), rect.height - LABEL_EDGE_MARGIN);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Snap immediately to the cursor's entry position — no tween — so the
    // label appears already aligned instead of animating in from elsewhere.
    const y = clampedYFor(e.clientY, rect);
    gsap.set([nameRef.current, yearRef.current], { y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);

    const y = clampedYFor(e.clientY, rect);
    quickNameY.current?.(y);
    quickYearY.current?.(y);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`group relative block max-w-full shrink-0 cursor-none overflow-hidden ${project.wrapperClassName} ${className ?? ""}`}
      style={{ boxSizing: "border-box" }}
    >
      <div
        ref={mediaRef}
        className="absolute left-0 right-0 will-change-transform"
        style={photoDriftBufferStyle(TILE_PHOTO_DRIFT_RANGE)}
      >
        {project.type === "video" ? (
          <video
            src={project.src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={project.src}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      {/* dark overlay */}
      <div
        className={`pointer-events-none absolute inset-0 bg-[#0c1626] transition-opacity duration-300 ease-in-out ${
          isHovering ? "opacity-20" : "opacity-0"
        }`}
      />

      {/* project name, tracks cursor Y, fixed to left edge */}
      <div
        className={`pointer-events-none absolute top-0 left-6 text-[#ffffff] transition-opacity duration-300 ease-in-out ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <span ref={nameRef} className="inline-block text-lg font-medium">
          {project.name}
        </span>
      </div>

      {/* year, tracks cursor Y, fixed to right edge */}
      <div
        className={`pointer-events-none absolute top-0 right-6 text-[#ffffff] transition-opacity duration-300 ease-in-out ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <span ref={yearRef} className="inline-block text-lg font-medium">
          {project.year}
        </span>
      </div>

      {/* custom cursor */}
      <div
        ref={cursorRef}
        className={`pointer-events-none absolute top-0 left-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white transition-opacity duration-300 ease-in-out ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <ArrowIcon size={80} />
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const para1Ref = useRef<HTMLParagraphElement>(null);
  const para2Ref = useRef<HTMLParagraphElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const seeAllTextRef = useRef<HTMLSpanElement>(null);
  const seeAllUnderlineRef = useRef<HTMLSpanElement>(null);
  const seeAllMountedRef = useRef(false);
  const [seeAllHovered, setSeeAllHovered] = useState(false);

  // "See all projects" underline: a wipe-out/wipe-in sequence rather than a
  // plain CSS scale transition, since the two directions need DIFFERENT
  // transform-origins mid-motion (can't be expressed as one continuous
  // interpolation) — exiting shrinks toward one edge, then the origin flips
  // and it regrows from the opposite edge.
  useEffect(() => {
    const underline = seeAllUnderlineRef.current;
    if (!underline) return;

    // Skip on mount — it already renders at rest (full width) via className.
    if (!seeAllMountedRef.current) {
      seeAllMountedRef.current = true;
      return;
    }

    gsap.killTweensOf(underline);
    const tl = gsap.timeline();

    if (seeAllHovered) {
      // Wipe out toward the right (shrinks from the left, vanishes at the
      // right edge), then regrow from the left until it's full width again.
      gsap.set(underline, { transformOrigin: "100% 50%" });
      tl.to(underline, { scaleX: 0, duration: 0.22, ease: "power2.in" }).set(underline, {
        transformOrigin: "0% 50%",
      }).to(underline, { scaleX: 1, duration: 0.3, ease: "power3.out" });
    } else {
      // Wipe out toward the left, then regrow from the right back to rest.
      gsap.set(underline, { transformOrigin: "0% 50%" });
      tl.to(underline, { scaleX: 0, duration: 0.22, ease: "power2.in" }).set(underline, {
        transformOrigin: "100% 50%",
      }).to(underline, { scaleX: 1, duration: 0.3, ease: "power3.out" });
    }

    return () => {
      tl.kill();
    };
  }, [seeAllHovered]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headingWords = splitIntoWords(headingRef.current);
      const labelWords = splitIntoWords(labelRef.current);
      const para1Words = splitIntoWords(para1Ref.current);
      const para2Words = splitIntoWords(para2Ref.current);
      const seeAllWords = splitIntoWords(seeAllTextRef.current);

      // Underline stays hidden until the "See all projects" words have
      // risen in, then grows in right after — part of the same entrance
      // sequence rather than sitting there fully visible from the start.
      if (seeAllUnderlineRef.current) {
        gsap.set(seeAllUnderlineRef.current, { scaleX: 0, transformOrigin: "0% 50%" });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.add(crookedRiseReveal(headingWords))
        .add(crookedRiseReveal(labelWords), "-=0.35")
        .add(crookedRiseReveal(para1Words), "-=0.3")
        .add(crookedRiseReveal(para2Words), "-=0.25")
        .add(crookedRiseReveal(seeAllWords), "-=0.2")
        .to(seeAllUnderlineRef.current, { scaleX: 1, duration: 0.4, ease: "power3.out" }, "-=0.15");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white pt-20 pb-24 sm:pt-28 sm:pb-32">
      <Container>
        <h2
          ref={headingRef}
          className="text-[48.9274px] leading-[58.7128px] tracking-[-1.95709px] text-[#252323]"
        >
          Featured Projects
        </h2>

        <div className="mt-8 w-full border-t border-black/10 sm:mt-10" />

        <div className="mt-10 grid grid-cols-1 gap-y-8 sm:mt-14 md:grid-cols-3 md:gap-x-10">
          <div className="flex items-start gap-2 text-sm font-medium text-[#1a1a1a]">
            <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-[#1a1a1a]" />
            <span ref={labelRef}>Go beyond bricks and mortar</span>
          </div>

          <div className="md:col-span-2">
            <div className="max-w-[640px] space-y-6 text-[17.8864px] leading-[26.8296px] text-[#252320]">
              <p ref={para1Ref}>
                Our projects are the result of trust, close collaboration, and an uncompromising
                approach to quality. We undertake a limited number of projects at any one time,
                ensuring each home receives the time, focus, and care it deserves.
              </p>
              <p ref={para2Ref}>
                As a family-owned builder with over 35 years of experience in Melbourne, we bring
                continuity, accountability, and proven capability to every project. The result is
                a portfolio of homes that are thoughtfully crafted. Projects defined by precision,
                care, and quiet excellence.
              </p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                onMouseEnter={() => setSeeAllHovered(true)}
                onMouseLeave={() => setSeeAllHovered(false)}
                className="relative inline-block text-base font-medium text-[#252320]"
              >
                <span ref={seeAllTextRef}>See all projects</span>
                <span
                  ref={seeAllUnderlineRef}
                  className="absolute -bottom-0.5 left-0 h-px w-full bg-current"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 sm:mt-20">
          <ProjectTile project={CALIBRE} className="mx-auto" />

          <div className="flex flex-col items-stretch justify-start gap-3 sm:flex-row">
            <div className="flex flex-col gap-6 pl-2">
              <ProjectTile project={SMALL_HOUSE} className="mt-34"  />
              <ProjectTile project={ASOCAT_RESIDENCE_DETAIL} className="mt-50" />
            </div>
            <ProjectTile project={ASOCAT_RESIDENCE} className="ml-35 mt-84" />
          </div>
        </div>
      </Container>
    </section>
  );
}
