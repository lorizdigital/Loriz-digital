"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Eng begrenzter Fade fuer die erste Eyebrow nach dem Hero. Auf iOS bleibt
 * ihre Position konstant; der IntersectionObserver gibt nur das Startsignal
 * fuer eine native Opacity-Transition.
 */
export function ProblemEyebrowReveal({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || visible) return;
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion, visible]);

  return (
    <div
      ref={elementRef}
      className={`transition-opacity ease-[var(--ease-glass)] ${
        prefersReducedMotion ? "opacity-100 duration-0" : "duration-700"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  );
}
