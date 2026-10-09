"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Container from "@/components/ui/Container";

type Award = {
  org: string;
  title: string;
  year: string;
};

const AWARDS: Award[] = [
  { org: "Melbourne Design Awards", title: "Gold – Custom Home ($3–$5m)", year: "'25" },
  {
    org: "National Architecture Awards",
    title: "Residential Boutique Custom Builder of the Year",
    year: "'24",
  },
  { org: "HIA Victoria", title: "Winner – Renovated Kitchen", year: "'23" },
  { org: "HIA Victoria", title: "Winner – Custom Home Under $3m", year: "'20" },
];

const TEXT_CLASS = "block text-[17.8864px] leading-[26.8296px] text-[#252320] bg-white";
const TEXT_FONT_FAMILY =
  'var(--font-suisse), "fontSuisse Fallback", Inter, Helvetica, sans-serif';

export default function Awards() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const revealFrom = { clipPath: "inset(0 100% 0 0)", y: 20, opacity: 0 };
      const revealTo = (duration: number) => ({
        clipPath: "inset(0 0% 0 0)",
        y: 0,
        opacity: 1,
        duration,
        ease: "power2.out",
        // The first tween added at a timeline's absolute start (time 0)
        // renders immediately by default, which would skip past the
        // explicit hidden state set below — force it to wait for playback.
        immediateRender: false,
      });

      const rowCells = cellRefs.current.map((cells) =>
        cells.filter((el): el is HTMLSpanElement => el !== null)
      );

      // Set the hidden state synchronously up front — a tween's "from"
      // state only renders once the timeline's playhead reaches it, which
      // would leave later rows fully visible until the ScrollTrigger fires.
      const allCells = [labelRef.current, ...rowCells.flat()].filter(
        (el): el is HTMLDivElement | HTMLSpanElement => el !== null
      );
      gsap.set(allCells, revealFrom);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      if (labelRef.current) {
        tl.to(labelRef.current, revealTo(0.3), 0);
      }

      rowCells.forEach((validCells, i) => {
        if (validCells.length === 0) return;
        const position = 0.25 + i * 0.1;
        tl.to(validCells, revealTo(0.5), position);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-20 sm:py-28">
      <Container>
        <div ref={labelRef} className="flex items-start gap-2 text-sm font-medium text-[#1a1a1a]">
          <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-[#1a1a1a]" />
          <span>Awards</span>
        </div>

        <div className="mt-10 border-t border-black/10 sm:mt-14">
          {AWARDS.map((award, i) => (
            <div
              key={`${award.org}-${award.year}`}
              className="grid grid-cols-[minmax(140px,280px)_1fr_44px] items-center gap-4 border-b border-black/10 py-6 sm:grid-cols-[minmax(180px,320px)_1fr_60px]"
            >
              <span
                ref={(el) => {
                  if (!cellRefs.current[i]) cellRefs.current[i] = [];
                  cellRefs.current[i][0] = el;
                }}
                className={TEXT_CLASS}
                style={{ fontFamily: TEXT_FONT_FAMILY }}
              >
                {award.org}
              </span>
              <span
                ref={(el) => {
                  if (!cellRefs.current[i]) cellRefs.current[i] = [];
                  cellRefs.current[i][1] = el;
                }}
                className={TEXT_CLASS}
                style={{ fontFamily: TEXT_FONT_FAMILY }}
              >
                {award.title}
              </span>
              <span
                ref={(el) => {
                  if (!cellRefs.current[i]) cellRefs.current[i] = [];
                  cellRefs.current[i][2] = el;
                }}
                className={`${TEXT_CLASS} text-right`}
                style={{ fontFamily: TEXT_FONT_FAMILY }}
              >
                {award.year}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
