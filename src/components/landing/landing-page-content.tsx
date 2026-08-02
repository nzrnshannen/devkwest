"use client";

import { useState, useEffect } from "react";
import { MouseRippleEffect } from "@/components/landing/mouse-ripple-effect";
import { HeroSection } from "@/components/landing/hero-section";
import { FeedbackForm } from "@/components/landing/feedback-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const RIPPLE_FILTER_ID = "landing-water-ripple";

export function LandingPageContent() {
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  useEffect(() => {
    setIsDevModalOpen(true);
  }, []);

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

      <Modal 
        isOpen={isDevModalOpen} 
        onClose={() => setIsDevModalOpen(false)} 
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
        <div className="flex flex-col items-center text-center pt-2">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
            <Construction className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
            System Under Active<br />Development
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
            Welcome to DevKwest! Please note that our platform is currently in active development. You may encounter incomplete features, testing data, or occasional instability as we prepare for our official release.
          </p>
          <Button 
            onClick={() => setIsDevModalOpen(false)}
            className="w-full rounded-xl bg-white py-6 text-base font-semibold text-black hover:bg-white/90"
          >
            I Understand
          </Button>
        </div>
      </Modal>
    </main>
  );
}
