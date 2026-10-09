"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const NAVY = "#0C388D";
const WHITE = "#FFFFFF";
const LOGO_SIZE = 88;

// Applied inline (not via gsap.set) so every piece is already hidden in the
// very first rendered HTML — including server-rendered markup, before any
// JS has run — so there's no flash of the fully-formed logo pre-hydration.
// Opacity only, deliberately — no transform/scale here. Percentage
// `transform-origin` on raw CSS is ambiguous for SVG elements across
// browsers (resolves against the SVG viewport rather than each piece's own
// bounding box unless `transform-box: fill-box` is set), which visually
// distorts/misplaces the pieces. GSAP's own SVG-aware transformOrigin
// handling (used in the effect below) computes this correctly, so scale is
// left entirely to GSAP instead of being set via raw inline CSS.
const HIDDEN_PIECE_STYLE: React.CSSProperties = {
  opacity: 0,
};

export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const topLeftRef = useRef<SVGRectElement>(null);
  const topRightRef = useRef<SVGRectElement>(null);
  const midRef = useRef<SVGGElement>(null);
  const bottomRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const finish = () => {
      html.style.overflow = previousOverflow;
      setDone(true);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // Pieces start hidden via inline style — show the complete logo
      // immediately (no build animation) before fading the whole thing out.
      gsap.set([topLeftRef.current, topRightRef.current, midRef.current, bottomRef.current], {
        opacity: 1,
        scale: 1,
      });

      const tl = gsap.timeline({ onComplete: finish });
      tl.to([bgRef.current, logoWrapRef.current], {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      });
      return () => {
        tl.kill();
        html.style.overflow = previousOverflow;
      };
    }

    const buildStep = 0.35;
    const buildOverlap = "-=0.15";
    const buildEase = "power2.out";
    const finaleDuration = 0.9;
    const finaleEase = "expo.out";

    const targetEl = document.querySelector<HTMLElement>('[data-loading-target="logo"] svg');
    const loadingRect = logoWrapRef.current?.getBoundingClientRect();
    const targetRect = targetEl?.getBoundingClientRect();
    const shapes = svgRef.current?.querySelectorAll("rect, path");

    // Starting state: completely empty — every piece hidden, nothing
    // pre-rendered. The logo builds itself from zero, not from an
    // already-partial frame.
    gsap.set([topLeftRef.current, topRightRef.current, midRef.current, bottomRef.current], {
      opacity: 0,
      scale: 0.4,
      transformOrigin: "50% 50%",
    });

    const tl = gsap.timeline({ onComplete: finish });

    // Phase 1 — construct: pieces build in one after another from nothing
    // until the logo is fully formed.
    tl.to(topLeftRef.current, { opacity: 1, scale: 1, duration: buildStep, ease: buildEase })
      .to(topRightRef.current, { opacity: 1, scale: 1, duration: buildStep, ease: buildEase }, buildOverlap)
      .to(midRef.current, { opacity: 1, scale: 1, duration: buildStep, ease: buildEase }, buildOverlap)
      .to(bottomRef.current, { opacity: 1, scale: 1, duration: buildStep, ease: buildEase }, buildOverlap)
      // Brief hold on the completed logo before it moves on.
      .to({}, { duration: 0.25 })
      .addLabel("finale");

    // Phase 2 — transition: only once fully built does it recolor, move
    // into its final header position, and reveal the page underneath.
    if (shapes && shapes.length) {
      tl.to(shapes, { fill: NAVY, duration: finaleDuration, ease: finaleEase }, "finale");
    }
    tl.to(bgRef.current, { yPercent: -100, duration: finaleDuration, ease: finaleEase }, "finale");

    if (loadingRect && targetRect) {
      const scale = targetRect.width / loadingRect.width;
      const deltaX = targetRect.left + targetRect.width / 2 - (loadingRect.left + loadingRect.width / 2);
      const deltaY = targetRect.top + targetRect.height / 2 - (loadingRect.top + loadingRect.height / 2);

      tl.to(
        logoWrapRef.current,
        { x: deltaX, y: deltaY, scale, duration: finaleDuration, ease: finaleEase },
        "finale"
      );
    }

    return () => {
      tl.kill();
      html.style.overflow = previousOverflow;
    };
  }, []);

  if (done) return null;

  return (
    <>
      <div ref={bgRef} className="fixed inset-0 z-[100]" style={{ backgroundColor: NAVY }} />
      <div
        ref={logoWrapRef}
        className="fixed z-[101]"
        style={{
          top: "50%",
          left: "50%",
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          marginTop: -(LOGO_SIZE / 2),
          marginLeft: -(LOGO_SIZE / 2),
        }}
      >
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          viewBox="0 0 37 37"
          fill="none"
        >
          <rect ref={topLeftRef} width="12" height="12" fill={WHITE} style={HIDDEN_PIECE_STYLE} />
          <rect ref={topRightRef} x="24" width="12" height="12" fill={WHITE} style={HIDDEN_PIECE_STYLE} />
          <g ref={midRef} style={HIDDEN_PIECE_STYLE}>
            <path d="M24 12H12V24L24 12Z" fill={WHITE} />
            <path d="M0 24L12 24L12 12L0 24Z" fill={WHITE} />
            <path d="M24 24L36 24L36 12L24 24Z" fill={WHITE} />
          </g>
          <g ref={bottomRef} style={HIDDEN_PIECE_STYLE}>
            <rect y="24" width="12" height="12" fill={WHITE} />
            <rect x="24" y="24" width="12" height="12" fill={WHITE} />
          </g>
        </svg>
      </div>
    </>
  );
}
