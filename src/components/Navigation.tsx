"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/Button";
import { LorizMark } from "@/components/icons/LorizMark";
import { easeGlass, springLayout } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MOBILE_LOGO_TARGET_ID } from "@/lib/mobileLogoDock";

type HoverRect = { left: number; width: number };

type NavigationProps = {
  heroLogoDockEnabled?: boolean;
};

export function Navigation({ heroLogoDockEnabled = false }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hoverRect, setHoverRect] = useState<HoverRect | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    let wasScrolled = false;

    const onScroll = () => {
      const isScrolled = window.scrollY > 24;
      if (isScrolled === wasScrolled) return;
      wasScrolled = isScrolled;
      setScrolled(isScrolled);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkHover = (el: HTMLAnchorElement) => {
    const navBox = navRef.current?.getBoundingClientRect();
    if (!navBox) return;
    const linkBox = el.getBoundingClientRect();
    setHoverRect({ left: linkBox.left - navBox.left, width: linkBox.width });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <motion.div
        className={cn(
          // Mobil bleibt die Zielgeometrie des Logos stabil. Der transparente
          // Header ist am Seitenanfang optisch unveraendert; beim Scrollen muss
          // nur noch die Glasflaeche eingeblendet werden. Den Layout-Morph gibt
          // es weiterhin ab Tablet-Groesse, wo kein Logo-Dock aktiv ist.
          "relative isolate mt-3 flex w-full max-w-[calc(1200px-2rem)] items-center justify-between rounded-full px-5 py-3 sm:px-6 md:backdrop-blur-[2px] md:transition-[max-width,margin-top,padding,border-radius] md:duration-700 md:ease-[var(--ease-glass)]",
          scrolled
            ? "md:mt-3 md:max-w-[calc(1200px-2rem)] md:rounded-full md:px-6 md:py-3"
            : "md:mt-0 md:max-w-[1200px] md:rounded-none md:px-8 md:py-6 lg:px-10",
        )}
      >
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: easeGlass }}
          className="glass-floating pointer-events-none absolute inset-0 -z-10 rounded-[inherit] backdrop-blur-[3px] md:backdrop-blur-[var(--glass-blur-lg)]"
        />

        <Link
          href="/#start"
          className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-2 py-1 text-[1.05rem] font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <span
            id={heroLogoDockEnabled ? MOBILE_LOGO_TARGET_ID : undefined}
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center"
          >
            <LorizMark
              className={cn(
                "h-full w-full",
                heroLogoDockEnabled && !shouldReduceMotion && "hidden md:block",
              )}
            />
          </span>
          Loriz Digital
        </Link>

        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 lg:flex"
          onMouseLeave={() => setHoverRect(null)}
        >
          {!shouldReduceMotion && (
            <AnimatePresence>
              {hoverRect && (
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: hoverRect.left, width: hoverRect.width }}
                  exit={{ opacity: 0 }}
                  transition={springLayout}
                  className="glass-subtle backdrop-blur-[var(--glass-blur-sm)] pointer-events-none absolute inset-y-0 left-0 z-0 h-full rounded-full"
                />
              )}
            </AnimatePresence>
          )}
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={(e) => handleLinkHover(e.currentTarget)}
              className={cn(
                "relative z-10 inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-[0.95rem] text-foreground/80 transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                shouldReduceMotion && "hover:bg-foreground/[0.05]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/#kontakt" variant="primary" size="sm">
            Projekt anfragen
          </Button>
        </div>

        <MobileMenu />
      </motion.div>
    </header>
  );
}
