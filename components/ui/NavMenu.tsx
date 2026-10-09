"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MenuIcon from "./MenuIcon";

// The menu's resting width and its narrower width while scrolling down.
const MENU_WIDTH = 410;
const SCROLL_SHRINK_WIDTH = 320;
// Scroll distance (px) before the shrink engages, so it stays full-size
// right at the top of the page instead of shrinking on the first pixel.
const SCROLL_SHRINK_THRESHOLD = 60;

const NAV_ITEMS = ["Home", "Projects", "About", "Expertise", "For Architects", "Contact"];

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
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

const ARROW_ICON_SIZE = 14;
const ARROW_GAP = 4; // matches the link's own `gap-1`
const ARROW_EXIT_OFFSET = 16; // small diagonal exit/entry travel

// A phone/email link whose arrow is a two-state, JS-driven loop rather than
// a CSS hover toggle — CSS transitions can only interpolate directly toward
// one target, but this needs a scripted, asymmetric sequence: exit one way,
// then enter from a DIFFERENT side than it left through, landing at a
// DIFFERENT resting spot depending on direction:
//
//   hover in:  (right of text) → exits top-right → enters from bottom-left
//              → settles LEFT of text, and stays put (no further motion)
//              while hovered.
//   hover out: (left of text)  → exits bottom-left → enters from top-right
//              → settles back to its original spot right of the text.
//
// The "settle left of text" target is computed from the text span's own
// measured width, so it works identically regardless of link length.
function ContactLink({ href, children }: { href: string; children: React.ReactNode }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const didMountRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const arrow = arrowRef.current;
    const text = textRef.current;
    if (!arrow || !text) return;

    // Skip on mount — the arrow already renders at its default (right of
    // text) resting spot via normal flex flow, nothing to animate yet.
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    gsap.killTweensOf(arrow);

    // The text itself slides right on hover and eases back left on release,
    // independent of the arrow's own choreography below.
    gsap.to(text, { x: isHovered ? 8 : 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });

    const tl = gsap.timeline();

    if (isHovered) {
      const leftTargetX = -(text.getBoundingClientRect().width + ARROW_GAP * 2 + ARROW_ICON_SIZE);
      tl.to(arrow, {
        x: ARROW_EXIT_OFFSET,
        y: -ARROW_EXIT_OFFSET,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      })
        .set(arrow, { x: leftTargetX - ARROW_EXIT_OFFSET, y: ARROW_EXIT_OFFSET })
        .to(arrow, { x: leftTargetX, y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    } else {
      tl.to(arrow, {
        x: "-=" + ARROW_EXIT_OFFSET,
        y: "+=" + ARROW_EXIT_OFFSET,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      })
        .set(arrow, { x: ARROW_EXIT_OFFSET, y: -ARROW_EXIT_OFFSET })
        .to(arrow, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    }

    return () => {
      tl.kill();
    };
  }, [isHovered]);

  return (
    <a
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="  nav-anim-item relative inline-flex w-fit items-center gap-1 text-white transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <span ref={textRef}>{children}</span>
      <span
        ref={arrowRef}
        className=" inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center sticky"
      >
        <ArrowIcon />
      </span>
    </a>
  );
}

export default function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const bottomDivRef = useRef<HTMLDivElement>(null);

  /* When the menu is open or hovered, treat as "active" for color purposes */
  const colorActive = isHovered || isOpen;

  /*
   * Height is driven with GSAP rather than a plain CSS transition so the
   * open animation can overshoot slightly past its resting height before
   * easing back — reading as the top edge being gently pulled upward
   * rather than a mechanical unfold. Both phases live on one timeline
   * (rather than chained tweens) so there's no one-frame kink where they
   * meet. Closing is a plain ease back to 0.
   *
   * The nav rows/contact links start hidden (faded down) and rise into
   * place slightly after the container starts growing, so the content
   * reads as emerging up out of the panel rather than popping in with it.
   */
  useEffect(() => {
    const panel = panelRef.current;
    const nav = navRef.current;
    const container = containerRef.current;
    const ul = ulRef.current;
    const bg = bgRef.current;
    const bottomDiv = bottomDivRef.current;
    if (!panel || !nav || !container || !ul || !bg || !bottomDiv) return;

    gsap.killTweensOf([panel, container, ul, bg, bottomDiv]);
    const items = nav.querySelectorAll<HTMLElement>(".nav-anim-item");
    gsap.killTweensOf(items);

    const targetLR = (isOpen || isHovered) ? -7 : 0;

    if (isOpen) {
      const targetHeight = nav.scrollHeight + 32;
      gsap.set(items, { opacity: 0, y: 12 });
      gsap.set(ul, { paddingTop: 8 });
      gsap.set(bottomDiv, { paddingBottom: 16 });
      gsap.set(bg, { borderRadius: "6px 6px 0 0" });

      const tl = gsap.timeline();
      // scale: 1 — opening also restores full size immediately, so the
      // panel never unfolds out of a scroll-shrunk button.
      // Container stays put (y: 0) but restores full width so the panel
      // never unfolds out of a scroll-shrunk button. Content never shifts;
      // only the pill's top edge expands upward (bg `top` below).
      tl.to(container, { y: 0, width: MENU_WIDTH, duration: 0.65, ease: "power3.out" }, 0)
        .fromTo(panel, { height: 0 }, { height: targetHeight, duration: 0.65, ease: "power3.out" }, 0)
        .to(ul, { paddingTop: 24, duration: 0.65, ease: "power3.out" }, 0)
        .to(bottomDiv, { paddingBottom: 52, duration: 0.65, ease: "power3.out" }, 0)
        .to([bg, panel], { left: targetLR, right: targetLR, duration: 0.65, ease: "power3.out" }, 0)
        // Only the upper part expands upward: the pill background grows 8px
        // past its top edge while its bottom — and all content — stays put.
        .to(bg, { top: -8, duration: 0.65, ease: "power3.out" }, 0)
        // `from: "end"` reveals the rows bottom-to-top so the content reads
        // as rising up out of the panel, matching the panel's upward lift.
        .to(
          items,
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: { each: 0.045, from: "end" } },
          0.1
        );
    } else {
      const tl = gsap.timeline();
      const closeDuration = 0.5;

      tl.to(container, { y: 0, duration: closeDuration, ease: "power2.inOut" }, 0)
        .to(panel, { height: 0, duration: closeDuration, ease: "power2.inOut" }, 0)
        .to(ul, { paddingTop: 8, duration: closeDuration, ease: "power2.inOut" }, 0)
        .to(bottomDiv, { paddingBottom: 16, duration: closeDuration, ease: "power2.inOut" }, 0)
        .to([bg, panel], { left: targetLR, right: targetLR, duration: closeDuration, ease: "power2.inOut" }, 0)
        // Collapse the pill's top-edge expansion back to rest.
        .to(bg, { top: 0, duration: closeDuration, ease: "power2.inOut" }, 0);

      tl.set(bg, { borderRadius: "6px" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return; // If open, isOpen's effect handles left/right

    const bg = bgRef.current;
    const panel = panelRef.current;
    if (!bg || !panel) return;

    const targetLR = isHovered ? -7 : 0;
    gsap.to([bg, panel], { left: targetLR, right: targetLR, duration: 0.35, ease: "power2.inOut", overwrite: "auto" });
  }, [isHovered, isOpen]);

  /*
   * Scroll-reactive shrink: scrolling down narrows the widget to
   * SCROLL_SHRINK_WIDTH (edges pull inward toward its center, since it's
   * centered in its wrapper); scrolling back up restores the full width.
   * Driven by ScrollTrigger's own direction tracking rather than a raw
   * scroll listener, so it stays in sync with Lenis (SmoothScrollProvider
   * already calls ScrollTrigger.update() on every Lenis tick). A single
   * ScrollTrigger instance lives for the component's lifetime; `isOpen` is
   * read via a ref so it doesn't need to be recreated on every toggle.
   */
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Position-based, not direction-based: the menu stays shrunk the
        // whole time the page is scrolled past the threshold, and only
        // returns to full width once it's back at the top. (Never shrink
        // while the panel is open — a shrinking dropdown would feel off.)
        const shouldShrink = !isOpenRef.current && self.scroll() > SCROLL_SHRINK_THRESHOLD;
        gsap.to(container, {
          width: shouldShrink ? SCROLL_SHRINK_WIDTH : MENU_WIDTH,
          duration: 1.1,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    /*
     * `relative` anchors the absolutely-positioned panel below.
     * Fixed width shared by button (w-full) and panel (inset-0) so they
     * are always pixel-identical — the visual effect is one unit unfolding.
     */
    <div ref={containerRef} className="relative w-full sm:w-102.5">
      {/* Backdrop: closes menu when clicking anywhere outside the widget */}
      <div
        aria-hidden
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 ${isOpen ? "" : "pointer-events-none"}`}
      />

      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="site-nav-panel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-50 box-border flex w-full h-10 cursor-pointer items-center overflow-visible bg-transparent"
      >
        {/*
         * Background layer — expands equally left & right on hover so the
         * content never shifts. Also turns blue and loses its bottom radius
         * when the panel is open, merging visually into one component.
         * Driven by `colorActive` (not `isHovered` alone) so the expanded
         * width holds for the entire time the menu is open, regardless of
         * where the cursor is, and only relaxes once the menu fully closes.
         */}
        <div
          ref={bgRef}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: "6px",
            backgroundColor: colorActive ? "#0C388D" : "rgb(246,246,246)",
            transition: "background-color 450ms ease-in-out",
            zIndex: 0,
          }}
        />

        {/*
         * Content layer — pinned to the button's own box via absolute inset-0.
         * Nothing inside ever moves regardless of background expansion.
         */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-between px-[25px] pointer-events-none font-[var(--font-suisse)] text-[14.8864px] leading-[26.8296px]"
          style={{
            color: colorActive ? "white" : "black",
            transition: "color 450ms ease-in-out",
          }}
        >
          <span className="">Menu</span>
          <MenuIcon
            isOpen={isOpen}
            strokeClassName={`transition-colors duration-[450ms] ease-in-out ${
              colorActive ? "stroke-white" : "stroke-black"
            }`}
          />
        </div>
      </button>

      {/*
       * ── Panel ─────────────────────────────────────────────────────────
       * `absolute top-full` overlays the page — content below never shifts.
       * `-left-[7px] -right-[7px]` matches the button's hover-expanded width
       * exactly (same ±7px offsets as the hover background) so both states
       * feel like the same shape. Height is driven entirely by GSAP (see
       * effect above) so the open animation can overshoot then settle.
       */}
      <div
        ref={panelRef}
        className="absolute top-[100%] -mt-[1px] z-50 overflow-hidden"
        style={{ height: 0, left: 0, right: 0 }}
      >
        <nav ref={navRef} id="site-nav-panel" aria-hidden={!isOpen}>
          {/* No top gap, no top radius — flows flush from the blue button above */}
          <div className="rounded-b-2xl bg-[#0C388D] text-white pt-[1px]">
            <ul ref={ulRef} className="flex flex-col px-8">
              {NAV_ITEMS.map((item) => (
                <li key={item} className="nav-anim-item border-b border-white/15 last:border-b-0">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="group flex items-center gap-4 py-[19px] text-[19px] font-medium text-white transition-colors duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white"
                  >
                    <span className="h-[7px] w-[7px] shrink-0 bg-white origin-right opacity-0 [transform:perspective(200px)_rotateY(90deg)] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:[transform:perspective(200px)_rotateY(0deg)]" />
                    <span className="transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                      {item}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div ref={bottomDivRef} className="flex flex-col gap-4 px-8 pt-5 text-[14.5px]">
              <ContactLink href="tel:0483987479">0483 987 479</ContactLink>
              <ContactLink href="mailto:info@havenconstructions.com.au">
                info@havenconstructions.com.au
              </ContactLink>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
