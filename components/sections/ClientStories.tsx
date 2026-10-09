"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Container from "@/components/ui/Container";
import { crookedRiseReveal, splitIntoWords } from "@/lib/animations";

type Story = {
  name: string;
  project: string;
  src: string;
  poster?: string;
};

const STORIES: Story[] = [
  {
    name: "Anna & Jeremy",
    project: "Project Pinnacle",
    src: "/videos/clientStores/client-stores-video1.mp4",
  },
  {
    name: "Rob and Cindy",
    project: "Project Calibre",
    src: "/videos/clientStores/client-stores-video2.mp4",
    poster: "/images/ClientStory.png",
  },
];

function ClientStoryVideo({ story }: { story: Story }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const nameRowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const projectRef = useRef<HTMLSpanElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cursorRef.current) {
        quickX.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3" });
        quickY.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3" });
      }

      const nameWords = splitIntoWords(nameRef.current);
      const projectWords = splitIntoWords(projectRef.current);

      gsap.timeline({
        scrollTrigger: {
          trigger: nameRowRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })
        .add(crookedRiseReveal(nameWords))
        .add(crookedRiseReveal(projectWords), "-=0.35");
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    quickX.current?.(e.clientX - rect.left);
    quickY.current?.(e.clientY - rect.top);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div>
      <div ref={nameRowRef} className="mb-4 flex items-center justify-between text-[15px] text-[#1a1a1a]">
        <span ref={nameRef} className="inline-block">
          {story.name}
        </span>
        <span ref={projectRef} className="inline-block">
          {story.project}
        </span>
      </div>

      <div
        ref={wrapperRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={togglePlay}
        className="relative aspect-video w-full cursor-none overflow-hidden bg-[#f5f5f5]"
      >
        <video
          ref={videoRef}
          src={story.src}
          poster={story.poster}
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />

        {/* custom cursor — follows pointer, always reads "Play" */}
        <div
          ref={cursorRef}
          className={`pointer-events-none absolute top-0 left-0 z-10 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-xl font-light text-[#ffffff] [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] transition-opacity duration-200 ease-in-out sm:h-44 sm:w-44 sm:text-2xl ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          Play
        </div>
      </div>
    </div>
  );
}

export default function ClientStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const labelWords = splitIntoWords(labelTextRef.current);
      const paragraphWords = splitIntoWords(paragraphRef.current);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        })
        .add(crookedRiseReveal(labelWords))
        .add(crookedRiseReveal(paragraphWords), "-=0.35");
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
              <span ref={labelTextRef}>Client stores</span>
            </div>

            <div className="mt-6 w-full border-t border-black/10" />

            <p
              ref={paragraphRef}
              className="mt-8 text-[17.8864px] leading-[26.8296px] text-[#252320]"
            >
              Take a look at the people behind the projects. Each story reflects a shared
              process grounded in trust, clear communication, and respect for detail—
              collaborations shaped over time. From the first conversation to completion, our
              clients are active participants. These stories go beyond finished homes,
              reflecting relationships built with care, projects delivered with integrity, and
              experiences defined by clarity and quiet satisfaction.
            </p>
          </div>

          <div className="flex flex-col gap-20 sm:gap-28 md:col-span-8">
            {STORIES.map((story) => (
              <ClientStoryVideo key={story.name} story={story} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
