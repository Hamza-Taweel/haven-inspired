"use client";

import Logo from "@/components/ui/Logo";
import NavMenu from "@/components/ui/NavMenu";

// Header laid out with absolute offsets measured from the top-left of the
// page so each element lands at its exact spec position:
//   logo         → 51px top, 47px left   (scrolls away with the header)
//   "Let's Talk" → 51px top, 47px right  (scrolls away with the header)
//   menu         → 48px top              (fixed — the only thing that follows)
//   paragraph    → 177px top, 47px right (scrolls away with the header)
// Header height is fixed (220px) so its bottom edge sits ~22px above the
// Haven wordmark in the next section.
export default function Header() {
  return (
    <header className="relative z-30 h-55 w-full bg-white">
      {/* Logo — 51px from top, 47px from left */}
      <div className="absolute top-12.75 left-11.75" data-loading-target="logo">
        <Logo />
      </div>

      {/*
       * The menu is the only element fixed to the viewport, so it's the only
       * one that follows the user down the page. Centered horizontally at
       * menu width; the wrapper is pointer-transparent so it never blocks
       * clicks on the logo / "Let's Talk" behind it, while the menu stays
       * clickable.
       */}
      <div className="pointer-events-none fixed left-1/2 top-12 z-40 flex w-full max-w-102.5 -translate-x-1/2 justify-center px-4 sm:px-0 *:pointer-events-auto">
        <NavMenu />
      </div>

      {/* "Let's Talk" — 51px from top, 47px from right */}
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="group absolute top-12.75 right-11.75 inline-block text-[15.71px] leading-[22.07px] text-[#252320]"
      >
        Let&apos;s Talk
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-in-out group-hover:scale-x-100" />
      </a>

      {/* Paragraph — 177px from top, 47px from right */}
      <p className="absolute top-44.25 right-11.75 max-w-85 indent-5 text-[14.71px] leading-[22.07px] text-[#252323]">
        <span className="absolute left-0 top-1.5 h-2.25 w-2.25 bg-[#0C388D]" />
        A Haven home is more than bricks and mortar. It&rsquo;s crafted, personal and shaped
        around you.
      </p>
    </header>
  );
}
