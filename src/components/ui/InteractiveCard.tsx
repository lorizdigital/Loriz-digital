"use client";

import {
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

type InteractiveCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Ruhige, mauspositionsgebundene Karteninteraktion für große Inhaltsflächen.
 * Auf Touch-Geräten und bei reduzierter Bewegung bleibt die Karte vollständig
 * statisch; Inhalt und interaktive Kindelemente bleiben uneingeschränkt nutzbar.
 */
export function InteractiveCard({ children, className }: InteractiveCardProps) {
  const hasFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const isInteractive = hasFinePointer && !prefersReducedMotion;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const horizontal = useMotionValue(0);
  const vertical = useMotionValue(0);
  const highlightOpacity = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 24, mass: 0.65 };
  const smoothHorizontal = useSpring(horizontal, springConfig);
  const smoothVertical = useSpring(vertical, springConfig);
  const smoothHighlightOpacity = useSpring(highlightOpacity, {
    stiffness: 180,
    damping: 26,
    mass: 0.5,
  });

  const rotateX = useTransform(smoothVertical, [-1, 1], [2.2, -2.2]);
  const rotateY = useTransform(smoothHorizontal, [-1, 1], [-2.2, 2.2]);
  const highlight = useMotionTemplate`radial-gradient(420px circle at ${pointerX}px ${pointerY}px, rgb(163 131 95 / 0.13), transparent 68%)`;

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isInteractive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    pointerX.set(localX);
    pointerY.set(localY);
    horizontal.set((localX / rect.width - 0.5) * 2);
    vertical.set((localY / rect.height - 0.5) * 2);
  }

  function handlePointerEnter() {
    if (isInteractive) highlightOpacity.set(1);
  }

  function handlePointerLeave() {
    horizontal.set(0);
    vertical.set(0);
    highlightOpacity.set(0);
  }

  return (
    <motion.div
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={isInteractive ? { y: -4, scale: 1.004 } : undefined}
      transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.7 }}
      style={{
        rotateX: isInteractive ? rotateX : 0,
        rotateY: isInteractive ? rotateY : 0,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative isolate transition-[border-color,box-shadow] duration-500 ease-[var(--ease-glass)]",
        isInteractive && "will-change-transform hover:border-clay/25 hover:shadow-glass-md",
        className,
      )}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
        style={{ background: highlight, opacity: smoothHighlightOpacity }}
      />
    </motion.div>
  );
}
