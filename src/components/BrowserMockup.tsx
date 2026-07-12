"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { easeGlass } from "@/lib/motion";

type BrowserMockupProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

export function BrowserMockup({ mouseX, mouseY }: BrowserMockupProps) {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end start"],
  });

  const scrollDrift = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [18, -18]);
  const tiltX = useTransform(mouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [1.4, -1.4]);
  const tiltY = useTransform(mouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-1.4, 1.4]);
  const driftX = useTransform(mouseX, [-1, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);
  const driftY = useTransform(mouseY, [-1, 1], shouldReduceMotion ? [0, 0] : [-8, 8]);
  const combinedY = useTransform([scrollDrift, driftY], (values: number[]) => values[0] + values[1]);

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25, ease: easeGlass }}
      className="relative w-full"
    >
      <motion.div
        style={{
          x: driftX,
          y: combinedY,
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 1400,
        }}
        className="glass-elevated backdrop-blur-[var(--glass-blur-lg)] relative overflow-hidden rounded-[1.75rem]"
      >
        {/* Browser-Leiste */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white/40 px-5 py-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e3aba1" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e8cf9c" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#a9d0b4" }} />
          </div>
          <div className="glass-subtle backdrop-blur-[var(--glass-blur-sm)] ml-2 h-6 flex-1 rounded-full" />
        </div>

        {/* Abstrahierter Seiteninhalt – near-opak, damit er als echte Website lesbar bleibt */}
        <div className="space-y-6 bg-white/[0.92] p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <div className="h-2 w-16 rounded-full bg-foreground/70" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 rounded-full bg-surface-muted" />
              <div className="h-2 w-8 rounded-full bg-surface-muted" />
              <div className="h-6 w-16 rounded-full bg-accent/90" />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="h-2.5 w-20 rounded-full bg-clay/45" />
            <div className="h-5 w-3/4 rounded-md bg-foreground/90" />
            <div className="h-5 w-1/2 rounded-md bg-foreground/90" />
          </div>
          <div className="space-y-2.5">
            <div className="h-2.5 w-full rounded-full bg-surface-muted" />
            <div className="h-2.5 w-5/6 rounded-full bg-surface-muted" />
          </div>
          <div className="flex gap-3 pt-1">
            <div className="h-9 w-28 rounded-full bg-accent" />
            <div className="h-9 w-28 rounded-full border border-border" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="aspect-square rounded-xl bg-clay/15" />
            <div className="aspect-square rounded-xl bg-accent-soft" />
            <div className="aspect-square rounded-xl bg-surface-muted" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 aspect-[16/9] rounded-xl bg-surface-muted" />
            <div className="aspect-[16/9] rounded-xl bg-clay/20" />
          </div>
        </div>
      </motion.div>

      {/* Dezente atmosphärische Lichtflächen hinter dem Mockup */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full bg-clay/10 blur-3xl sm:h-56 sm:w-56"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -left-10 -z-10 h-48 w-48 rounded-full bg-[#bfcddb]/20 blur-3xl sm:h-64 sm:w-64"
      />
    </motion.div>
  );
}
