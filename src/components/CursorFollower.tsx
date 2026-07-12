"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";
import { springCursor } from "@/lib/motion";
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
  const springX = useSpring(x, springCursor);
  const springY = useSpring(y, springCursor);

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
        width: hovering ? 30 : 22,
        height: hovering ? 30 : 22,
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.4 }}
    >
      <div
        className={cn(
          "h-full w-full rounded-full border-[1.5px] backdrop-blur-[3px] transition-colors duration-300",
          hovering ? "border-clay/60 bg-clay/[0.08]" : "border-foreground/35 bg-foreground/[0.03]",
        )}
      />
    </motion.div>
  );
}
