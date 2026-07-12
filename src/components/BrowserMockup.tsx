"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { LayoutGrid, Smartphone, Sparkles } from "lucide-react";
import { easeGlass } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type BrowserMockupProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

const features = [
  { icon: LayoutGrid, tint: "bg-accent" },
  { icon: Smartphone, tint: "bg-clay" },
  { icon: Sparkles, tint: "bg-[#8a9bb0]" },
];

export function BrowserMockup({ mouseX, mouseY }: BrowserMockupProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
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
      {/* Peekende zweite Glasfläche – erzeugt Tiefe ohne eigenen Inhalt */}
      <div
        aria-hidden="true"
        className="glass-subtle backdrop-blur-[var(--glass-blur-sm)] absolute -right-3 -top-3 h-full w-full rounded-[1.75rem]"
      />

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
        <div className="space-y-7 bg-white/[0.94] p-6 sm:p-8">
          {/* Mini-Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <div className="h-2 w-16 rounded-full bg-foreground/70" />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-2 w-8 rounded-full bg-surface-muted sm:block" />
              <div className="hidden h-2 w-8 rounded-full bg-surface-muted sm:block" />
              <div className="h-6 w-16 rounded-full bg-accent" />
            </div>
          </div>

          {/* Hero-innerhalb-des-Mockups: Text + farbige Bildfläche */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 flex flex-col justify-center space-y-3">
              <div className="h-2 w-16 rounded-full bg-clay/60" />
              <div className="h-4 w-full rounded-md bg-foreground/90" />
              <div className="h-4 w-4/5 rounded-md bg-foreground/90" />
              <div className="h-2 w-full rounded-full bg-surface-muted" />
              <div className="flex gap-2 pt-1">
                <div className="h-8 w-20 rounded-full bg-accent" />
                <div className="h-8 w-8 rounded-full border border-border" />
              </div>
            </div>
            <div className="relative col-span-2 aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-clay/35 via-accent-soft to-[#e4e9ee]">
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-accent/15 blur-xl" />
              <div className="absolute -top-4 right-2 h-16 w-16 rounded-full bg-white/40 blur-lg" />
              <div className="absolute bottom-4 left-4 h-10 w-10 rounded-xl bg-white/50 shadow-sm" />
            </div>
          </div>

          {/* Feature-Zeile mit echten Akzentfarben statt leerer Flächen */}
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-surface-muted/50 p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${feature.tint}`}
                >
                  <feature.icon className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-foreground/25" />
                  <div className="h-1.5 w-2/3 rounded-full bg-foreground/15" />
                </div>
              </div>
            ))}
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
