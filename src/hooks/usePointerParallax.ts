"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { springParallax } from "@/lib/motion";

/**
 * Liefert stark geglättete, normalisierte Zeigerkoordinaten (-1 bis 1) relativ
 * zum Viewport. Bleibt auf Touch-Geräten und bei reduzierter Bewegung bei 0,0 –
 * der Listener wird dann gar nicht erst gebunden.
 */
export function usePointerParallax() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springParallax);
  const y = useSpring(rawY, springParallax);

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarsePointer || prefersReducedMotion) return;

    const handlePointerMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [rawX, rawY]);

  return { x, y };
}
