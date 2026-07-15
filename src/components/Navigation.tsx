"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useTransform } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/Button";
import { LorizMark } from "@/components/icons/LorizMark";
import { easeGlass, springLayout } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { heroLogoDockProgress, NAV_LOGO_DOM_ID } from "@/lib/heroLogoDock";

type HoverRect = { left: number; width: number };

type NavigationProps = {
  heroLogoDockEnabled?: boolean;
};

export function Navigation({ heroLogoDockEnabled = false }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hoverRect, setHoverRect] = useState<HoverRect | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = usePrefersReducedMotion();
  // Die fliegende Marke erreicht bei 0.9 bereits exakt diese Zielbox. Das
  // echte Logo wird danach unter der noch opaken Portal-Marke aktiviert; erst
  // anschließend blendet das Portal aus. So ist nie eine versetzte Dublette
  // sichtbar und die Gesamtopazität bleibt konstant.
  const dockedLogoOpacity = useTransform(heroLogoDockProgress, [0.9, 0.92], [0, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
          "relative isolate flex w-full items-center justify-between backdrop-blur-[2px] transition-[max-width,margin-top,padding,border-radius] duration-700 ease-[var(--ease-glass)]",
          scrolled
            ? "mt-3 max-w-[calc(1200px-2rem)] rounded-full px-5 py-3 sm:px-6"
            : "max-w-[1200px] px-6 py-6 sm:px-8 lg:px-10",
        )}
      >
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: easeGlass }}
          className="glass-floating backdrop-blur-[var(--glass-blur-lg)] pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
        />

        <Link
          href="/#start"
          className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-2 py-1 text-[1.05rem] font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <motion.span
            id={heroLogoDockEnabled ? NAV_LOGO_DOM_ID : undefined}
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            style={heroLogoDockEnabled ? { opacity: dockedLogoOpacity } : { opacity: 1 }}
          >
            <LorizMark className="h-full w-full" />
          </motion.span>
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
