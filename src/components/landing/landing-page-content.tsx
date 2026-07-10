"use client";

import { MouseRippleEffect } from "@/components/landing/mouse-ripple-effect";
import { HeroSection } from "@/components/landing/hero-section";
import { FeedbackForm } from "@/components/landing/feedback-form";

const RIPPLE_FILTER_ID = "landing-water-ripple";

export function LandingPageContent() {
  return (
    <main className="relative min-h-screen bg-background">
      <svg aria-hidden="true" className="absolute h-0 w-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id={RIPPLE_FILTER_ID}
            x="-8%"
            y="-8%"
            width="116%"
            height="116%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href="#mouse-ripple-canvas"
              result="displacementMap"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-grid-white"
        style={{ filter: `url(#${RIPPLE_FILTER_ID})` }}
      />

      <MouseRippleEffect />

      <div className="relative z-10 min-h-screen">
        <HeroSection rippleFilterId={RIPPLE_FILTER_ID} />
        <FeedbackForm />
        <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} DevKwest. Built for developers who
            ship.
          </p>
        </footer>
      </div>
    </main>
  );
}
