"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Container from "@/components/ui/Container";
import { crookedRiseReveal, splitIntoWords } from "@/lib/animations";

const QUOTE_FONT_FAMILY = 'var(--font-suisse), "fontSuisse Fallback", Inter, Helvetica, sans-serif';

export default function Testimonial() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteTextRef = useRef<HTMLSpanElement>(null);
  const attributionTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // The oversized opening quote mark is its own element (see JSX) so
      // splitting only the sentence into words doesn't flatten its distinct
      // font-size away.
      const quoteWords = splitIntoWords(quoteTextRef.current);
      const attributionWords = splitIntoWords(attributionTextRef.current);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      tl.add(crookedRiseReveal(quoteWords)).add(
        crookedRiseReveal(attributionWords),
        "-=0.3"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white pt-0 pb-20 sm:pt-2 sm:pb-24">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
          {/* Empty spacer column — matches the Collaborators section's left
              text column above so this block's left edge lines up with
              that section's image column, not the container edge. */}
          <div aria-hidden className="hidden md:col-span-4 md:block" />

          <div className="md:col-span-8">
            <div className="max-w-[900px]">
              <p
                className="block"
                style={{
                  fontFamily: QUOTE_FONT_FAMILY,
                  fontSize: "49px",
                  letterSpacing: "-1.96px",
                  lineHeight: "58.7px",
                  color: "#252320",
                  backgroundColor: "#FFFFFF",
                  boxSizing: "border-box",
                }}
              >
                <span aria-hidden style={{ fontSize: "64px" }}>
                  &ldquo;
                </span>{" "}
                <span ref={quoteTextRef}>
                  Haven Construction is the most genuine, trustworthy builder, who can construct the
                  most intricate structure with ease, and they work tirelessly to make your dreams
                  come to life, and are equally as excited about their work as you are about your
                  finished home.
                </span>
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-[#6b6b68]">
              <span className="h-[7px] w-[7px] shrink-0 bg-[#1a1a1a]" />
              <span ref={attributionTextRef}>Michael and Kathryn - Project Calibre</span>
            </div>
          </div>
        </div>
      </Container>

      <div className="mt-16 w-full border-t border-black/10 sm:mt-20" />
    </section>
  );
}
