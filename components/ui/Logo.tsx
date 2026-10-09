"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

const NAVY = "#0C388D";

export default function Logo({
  className = "",
  fill = NAVY,
}: {
  className?: string;
  fill?: string;
}) {
  const topRightRef = useRef<SVGRectElement>(null);
  const midRef = useRef<SVGGElement>(null);
  const bottomRef = useRef<SVGGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const playSequence = () => {
    timelineRef.current?.kill();

    const ease = "power2.inOut";
    const step = 0.3;
    const overlap = "-=0.15";

    const tl = gsap.timeline();
    timelineRef.current = tl;

    tl.to(topRightRef.current, {
      opacity: 0,
      scale: 0.4,
      transformOrigin: "50% 50%",
      duration: step,
      ease,
    })
      .to(
        midRef.current,
        { opacity: 0, scale: 0.4, transformOrigin: "50% 50%", duration: step, ease },
        overlap
      )
      .to(
        bottomRef.current,
        { opacity: 0, scale: 0.4, transformOrigin: "50% 50%", duration: step, ease },
        overlap
      )
      .to({}, { duration: 0.2 })
      .to(topRightRef.current, { opacity: 1, scale: 1, duration: step, ease })
      .to(midRef.current, { opacity: 1, scale: 1, duration: step, ease }, overlap)
      .to(bottomRef.current, { opacity: 1, scale: 1, duration: step, ease }, overlap);
  };

  return (
    <Link
      href="/"
      aria-label="Haven — home"
      className={`inline-flex shrink-0 ${className}`}
      onMouseEnter={playSequence}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="37"
        height="37"
        viewBox="0 0 37 37"
        fill="none"
      >
        {/* top-left square stays visible through the whole sequence */}
        <rect width="12" height="12" fill={fill} />
        <rect ref={topRightRef} x="24" width="12" height="12" fill={fill} />
        <g ref={midRef}>
          <path d="M24 12H12V24L24 12Z" fill={fill} />
          <path d="M0 24L12 24L12 12L0 24Z" fill={fill} />
          <path d="M24 24L36 24L36 12L24 24Z" fill={fill} />
        </g>
        <g ref={bottomRef}>
          <rect y="24" width="12" height="12" fill={fill} />
          <rect x="24" y="24" width="12" height="12" fill={fill} />
        </g>
      </svg>
    </Link>
  );
}
