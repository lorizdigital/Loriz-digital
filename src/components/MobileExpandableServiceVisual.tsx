"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easeGlass } from "@/lib/motion";
import { cn } from "@/lib/cn";

type MobileExpandableServiceVisualProps = {
  eyebrow: string;
  title: string;
  description: string;
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
};

export function MobileExpandableServiceVisual({
  eyebrow,
  title,
  description,
  openLabel,
  closeLabel,
  children,
}: MobileExpandableServiceVisualProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const contentId = useId();
  const [expanded, setExpanded] = useState(false);
  const hasInteractedRef = useRef(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasInteractedRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      if (expanded) {
        closeButtonRef.current?.focus({ preventScroll: true });
        contentRef.current?.scrollIntoView({
          block: "start",
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      } else {
        openButtonRef.current?.focus({ preventScroll: true });
        openButtonRef.current?.scrollIntoView({
          block: "nearest",
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [expanded, prefersReducedMotion]);

  function setOpen(nextExpanded: boolean) {
    hasInteractedRef.current = true;
    setExpanded(nextExpanded);
  }

  return (
    <>
      {!expanded && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: easeGlass }}
          className="p-5 sm:p-7 lg:hidden"
        >
          <button
            ref={openButtonRef}
            type="button"
            aria-expanded="false"
            aria-controls={contentId}
            onClick={() => setOpen(true)}
            className="group w-full rounded-[1.35rem] border border-border bg-surface p-5 text-left shadow-soft transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:border-clay/30 hover:bg-surface-muted/30 hover:shadow-glass-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted motion-reduce:hover:translate-y-0"
          >
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-clay">
              {eyebrow}
            </span>
            <span className="mt-2.5 block text-lg font-medium leading-snug tracking-[-0.02em] text-foreground">
              {title}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
              {description}
            </span>
            <span className="mt-5 flex min-h-11 items-center justify-between gap-4 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-soft">
              {openLabel}
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0"
                strokeWidth={1.9}
              />
            </span>
          </button>
        </motion.div>
      )}

      <div
        ref={contentRef}
        id={contentId}
        className={cn(!expanded && "hidden", "scroll-mt-24 lg:block")}
      >
        <div className="flex justify-end border-b border-border bg-surface-muted/55 px-4 py-3 lg:hidden">
          <button
            ref={closeButtonRef}
            type="button"
            aria-expanded="true"
            aria-controls={contentId}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-soft transition-[background-color,border-color,box-shadow] duration-300 hover:border-clay/30 hover:bg-surface-muted hover:shadow-glass-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
          >
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
