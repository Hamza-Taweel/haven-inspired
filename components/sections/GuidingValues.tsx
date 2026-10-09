"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import Container from "@/components/ui/Container";
import { crookedRiseReveal, photoDrift, photoDriftBufferStyle, splitIntoWords } from "@/lib/animations";

const PHOTO_DRIFT_RANGE = 14;

export default function GuidingValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const philosophyRef = useRef<HTMLSpanElement>(null);
  const paragraph1Ref = useRef<HTMLParagraphElement>(null);
  const paragraph2Ref = useRef<HTMLParagraphElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headingWords = splitIntoWords(headingRef.current);
      const philosophyWords = splitIntoWords(philosophyRef.current);
      const paragraph1Words = splitIntoWords(paragraph1Ref.current);
      const paragraph2Words = splitIntoWords(paragraph2Ref.current);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.add(crookedRiseReveal(headingWords))
        .add(crookedRiseReveal(philosophyWords), "-=0.35")
        .add(crookedRiseReveal(paragraph1Words), "-=0.3")
        .add(crookedRiseReveal(paragraph2Words), "-=0.25");

      photoDrift(mediaRef.current, frameRef.current, PHOTO_DRIFT_RANGE);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white pt-36 pb-20 sm:pt-48 sm:pb-28">
      <Container>
        <h2
          ref={headingRef}
          className="text-[48.9274px] leading-[58.7128px] tracking-[-1.95709px] text-[#252323]"
        >
          Our guiding values
        </h2>

        <div className="mt-8 w-full border-t border-black/10 sm:mt-10" />

        <div className="mt-10 grid grid-cols-1 gap-y-12 sm:mt-14 md:grid-cols-3 md:gap-x-10">
          <div className="flex items-start gap-2 text-sm font-medium text-[#1a1a1a]">
            <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-[#1a1a1a]" />
            <span ref={philosophyRef}>Philosophy</span>
          </div>

          <div className="md:col-span-2 md:col-start-2 md:pl-28 lg:pl-40">
            <div className="max-w-[640px] space-y-6 text-[17.8864px] leading-[26.8296px] text-[#252320]">
              <p ref={paragraph1Ref}>
                Our homes go beyond construction. They are measured responses to how our clients
                live. Refined, comfortable, and unmistakably personal. Through true collaboration,
                we align precision and personality, with craftsmanship with care. Complexity
                inspires us. Each project is a chance to explore, refine and build with intent.
              </p>
              <p ref={paragraph2Ref}>
                These are homes that speak without words. Like any bespoke object made to endure,
                these homes carry a sense of quiet confidence. Expressive without excess, and
                defined by lasting quality.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-2 md:pl-28 lg:pl-40">
            <div
              ref={frameRef}
              className="relative aspect-[9/10] w-full max-w-[640px] overflow-hidden sm:aspect-[6/5]"
            >
              <div
                ref={mediaRef}
                className="absolute left-0 right-0 will-change-transform"
                style={photoDriftBufferStyle(PHOTO_DRIFT_RANGE)}
              >
                <Image
                  src="/images/Our-guiding-values--scaled.webp"
                  alt="Haven team collaborating in a home interior"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
