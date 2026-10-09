"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "@/components/ui/Logo";

const NAV_LINKS = ["About", "Projects", "Expertise", "For Architects", "Contact"];
const SOCIAL_LINKS = ["Instagram", "Facebook"];

function ArrowUpRight({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
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

function UnderlineLink({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`group relative inline-block w-fit text-white ${className}`}
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-in-out group-hover:scale-x-100" />
    </a>
  );
}

// Wordmark paths are authored rightmost-letter-first (n, e, v, a, H) in the
// source SVG — index 0 is "n", index 4 is "H". The reveal stagger below
// walks the array `from: "end"`, so index 4 ("H") plays first and index 0
// ("n") plays last, giving an H→a→v→e→n (left-to-right) reveal order.
const WORDMARK_PATHS = [
  "M1161.38 411.642V118.417H1226.79V156.762C1242.01 133.642 1271.9 111.65 1313.63 111.65C1375.09 111.65 1414 156.198 1414 220.482V411.642H1348.59V233.452C1348.59 193.415 1329.98 166.348 1290.51 166.348C1257.8 166.348 1226.79 190.596 1226.79 237.399V411.642H1161.38Z",
  "M1135.13 318.6C1126.11 377.245 1078.18 418.409 1008.82 418.409C926.495 418.409 868.979 355.817 868.979 265.594C868.979 177.626 928.751 111.65 1008.82 111.65C1092.84 111.65 1139.65 176.498 1139.65 258.263C1139.65 267.285 1139.08 273.488 1137.39 282.51H931.007C936.645 339.464 969.915 365.967 1008.82 365.967C1046.04 365.967 1068.6 347.358 1076.49 318.6H1135.13ZM1008.26 164.093C964.276 164.093 940.593 194.543 933.262 234.579H1076.49C1075.93 197.362 1051.68 164.093 1008.26 164.093Z",
  "M783.267 411.635H716.164L609.589 118.41H677.819L750.561 336.637L822.739 118.41H888.714L783.267 411.635Z",
  "M523.025 228.94C542.198 226.121 552.348 217.099 552.348 200.182C552.348 178.19 533.176 161.837 499.342 161.837C463.817 161.837 442.953 179.318 439.57 207.512H374.723C380.362 155.07 424.345 111.65 499.906 111.65C579.414 111.65 615.503 152.251 615.503 218.226V351.869C615.503 371.606 616.631 390.778 618.887 411.642H557.423C555.167 400.364 554.039 387.959 553.476 375.553C537.123 400.928 502.725 418.409 464.381 418.409C409.12 418.409 361.753 385.703 361.753 329.877C361.753 270.669 406.3 246.985 464.945 237.963L523.025 228.94ZM423.217 327.058C423.217 355.253 444.645 369.35 473.967 369.35C515.695 369.35 552.348 344.539 552.348 295.48V270.105L480.17 281.947C448.028 287.585 423.217 297.172 423.217 327.058Z",
  "M272.358 0H340.025V411.643H272.358V231.197H67.6667V411.643H0V0H67.6667V170.86H272.358V0Z",
];

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealContentRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const imageCursorRef = useRef<HTMLDivElement>(null);
  const quickImageCursorX = useRef<gsap.QuickToFunc | null>(null);
  const quickImageCursorY = useRef<gsap.QuickToFunc | null>(null);
  const [imageHovering, setImageHovering] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (imageCursorRef.current) {
        quickImageCursorX.current = gsap.quickTo(imageCursorRef.current, "x", {
          duration: 0.3,
          ease: "power3",
        });
        quickImageCursorY.current = gsap.quickTo(imageCursorRef.current, "y", {
          duration: 0.3,
          ease: "power3",
        });
      }

      // Content reveal: scrubbed directly to scroll position (not a
      // one-shot toggle), so the content is masked/hidden above the footer
      // as it starts entering the viewport, slides down into place as you
      // scroll further in, and — because it's a direct function of scroll
      // position rather than a "has it played" flag — automatically resets
      // and replays every time the footer leaves and re-enters the screen.
      if (revealContentRef.current) {
        gsap.fromTo(
          revealContentRef.current,
          { y: -60 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top 55%",
              scrub: 0.6,
            },
          }
        );
      }

      // Wordmark: each letter reveals left-to-right (H first), scrubbed
      // the same way as the content above so it also replays on re-entry.
      const paths = pathRefs.current.filter((el): el is SVGPathElement => el !== null);
      if (paths.length > 0) {
        gsap.fromTo(
          paths,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            stagger: { each: 0.12, from: "end" },
            scrollTrigger: {
              trigger: wordmarkRef.current,
              start: "top bottom",
              end: "top 60%",
              scrub: 0.6,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Lazily creates the quickTo tweens if the mount-time effect somehow
  // raced the ref (e.g. fast refresh) — guarantees tracking works the
  // moment a real mousemove can fire, instead of silently no-op'ing
  // forever via the optional-chained calls below.
  const ensureImageCursorTweens = () => {
    if (!imageCursorRef.current) return;
    quickImageCursorX.current ??= gsap.quickTo(imageCursorRef.current, "x", {
      duration: 0.3,
      ease: "power3",
    });
    quickImageCursorY.current ??= gsap.quickTo(imageCursorRef.current, "y", {
      duration: 0.3,
      ease: "power3",
    });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    ensureImageCursorTweens();
    const rect = e.currentTarget.getBoundingClientRect();
    quickImageCursorX.current?.(e.clientX - rect.left);
    quickImageCursorY.current?.(e.clientY - rect.top);
  };

  return (
    <footer ref={sectionRef} className="relative bg-[#0C388D] py-16 pr-4 pl-6 sm:py-20 sm:pr-8 sm:pl-14">
      {/* Mask: static, clips revealContentRef while it's translated above
          rest during the scroll-scrubbed reveal. */}
      <div className="overflow-hidden">
        <div ref={revealContentRef}>
          <div className="flex items-start justify-between">
            <Logo fill="#FFFFFF" />
            <div className="flex flex-col items-end gap-2 text-[15px]">
              {SOCIAL_LINKS.map((label) => (
                <UnderlineLink key={label}>
                  {label} <ArrowUpRight />
                </UnderlineLink>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-x-10 gap-y-12 sm:mt-10">
            <ul className="flex flex-col gap-3 text-[15px] font-medium">
              {NAV_LINKS.map((label) => (
                <li key={label}>
                  <UnderlineLink>{label}</UnderlineLink>
                </li>
              ))}
            </ul>

            <div className="w-full max-w-[360px] sm:mt-4">
              <div className="flex items-start gap-2 text-sm font-medium text-white">
                <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-white" />
                <span>Recently completed</span>
              </div>

              <div
                onMouseEnter={(e) => {
                  setImageHovering(true);
                  ensureImageCursorTweens();
                  const rect = e.currentTarget.getBoundingClientRect();
                  if (imageCursorRef.current) {
                    gsap.set(imageCursorRef.current, {
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseLeave={() => setImageHovering(false)}
                onMouseMove={handleImageMouseMove}
                className="relative mt-4 aspect-[3/2] w-full cursor-none overflow-hidden"
              >
                <Image
                  src="/images/featuredProjects/img1.webp"
                  alt="Calibre — recently completed project"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className={`pointer-events-none absolute inset-0 bg-[#0c1626] transition-opacity duration-300 ease-in-out ${
                    imageHovering ? "opacity-20" : "opacity-0"
                  }`}
                />

                {/* fixed content — vertically centered on each edge, never tracks the cursor */}
                <span className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-sm font-medium text-white">
                  Calibre
                </span>
                <span className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 text-sm font-medium text-white">
                  2025
                </span>

                {/* custom arrow cursor, tracks the mouse — same as Featured Projects */}
                <div
                  ref={imageCursorRef}
                  className={`pointer-events-none absolute top-0 left-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white transition-opacity duration-300 ease-in-out ${
                    imageHovering ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <ArrowUpRight size={80} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={wordmarkRef} className="mt-16 sm:mt-24">
        <div className="w-full">
          <svg
            viewBox="0 0 1414 419"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block h-auto w-full"
          >
            {WORDMARK_PATHS.map((d, i) => (
              <path
                key={d.slice(0, 12)}
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                d={d}
                fill="#FFFFFF"
              />
            ))}
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-white sm:mt-6">
          <span>&copy;13&ndash;26</span>
          <span>
            Web design Melbourne <span className="font-semibold">jtb_</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
