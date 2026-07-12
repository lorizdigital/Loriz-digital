"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";
import { springParallax } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia(FINE_POINTER_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

/**
 * Dezenter, nachziehender Cursor-Begleiter für Desktop-Mauszeiger. Ersetzt
 * bewusst NICHT den nativen Cursor (Präzision, Formulare, Textauswahl
 * bleiben unangetastet), sondern fügt eine Liquid-Glass-Kreisfläche hinzu,
 * die leicht hinterherzieht und über klickbaren Elementen aufblüht.
 */
export function CursorFollower() {
  const shouldReduceMotion = usePrefersReducedMotion();
  const hasFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );
  const enabled = hasFinePointer && !shouldReduceMotion;
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springParallax);
  const springY = useSpring(y, springParallax);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target as HTMLElement | null;
      setHovering(!!target?.closest("a, button, [role='button']"));
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[999] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ x: springX, y: springY }}
      animate={{
        width: hovering ? 52 : 26,
        height: hovering ? 52 : 26,
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.5 }}
    >
      <div
        className={cn(
          "glass-subtle backdrop-blur-[var(--glass-blur-sm)] h-full w-full rounded-full border transition-colors duration-300",
          hovering ? "border-clay/40 bg-accent-soft" : "border-foreground/15",
        )}
      />
    </motion.div>
  );
}
