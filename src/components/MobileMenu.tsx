"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { springLayout } from "@/lib/motion";
import { useIsMounted } from "@/hooks/useIsMounted";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const MotionLink = motion.create(Link);

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useIsMounted();
  const prefersReducedMotion = usePrefersReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("a[href], button:not([disabled])")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      (trigger ?? previousFocus)?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
    if (focusable.length === 0) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        className="glass-subtle backdrop-blur-[var(--glass-blur-sm)] relative z-50 flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        {open ? (
          <X aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Menu aria-hidden="true" className="h-5 w-5" />
        )}
      </button>

      {/* Per Portal direkt in <body> gerendert: Die Navigation nutzt Framer
          Motions `layout`-Prop, wodurch ihr Wrapper einen neuen
          Containing Block für `position: fixed`-Kinder erzeugen würde. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="scrim"
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
                />
                <motion.div
                  key="panel"
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Seitennavigation"
                  tabIndex={-1}
                  onKeyDown={handlePanelKeyDown}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.97, y: -6 }}
                  transition={prefersReducedMotion ? { duration: 0 } : springLayout}
                  className="glass-elevated backdrop-blur-[var(--glass-blur-lg)] fixed inset-x-4 bottom-6 top-[5.5rem] z-[70] flex flex-col overflow-y-auto overscroll-contain rounded-xl p-6"
                >
                  <nav className="flex flex-1 flex-col items-start justify-center gap-1">
                    {siteConfig.navigation.map((item, index) => (
                      <MotionLink
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.4,
                          delay: prefersReducedMotion ? 0 : 0.06 + index * 0.05,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="w-full rounded-2xl px-3 py-3 text-2xl font-medium tracking-tight text-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                      >
                        {item.label}
                      </MotionLink>
                    ))}
                  </nav>
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.4,
                      delay: prefersReducedMotion ? 0 : 0.06 + siteConfig.navigation.length * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mt-4"
                  >
                    <Button href="/#kontakt" variant="primary" onClick={() => setOpen(false)}>
                      Projekt anfragen
                    </Button>
                  </motion.div>

                  {/* Rechtstexte: eigene Seiten, bewusst nicht Teil der
                      Hauptnavigation, daher separat und zurückhaltend. */}
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.4,
                      delay: prefersReducedMotion ? 0 : 0.06 + (siteConfig.navigation.length + 1) * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mt-6 flex items-center gap-4"
                  >
                    <Link
                      href="/impressum"
                      onClick={() => setOpen(false)}
                      className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                    >
                      Impressum
                    </Link>
                    <Link
                      href="/datenschutz"
                      onClick={() => setOpen(false)}
                      className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                    >
                      Datenschutz
                    </Link>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
