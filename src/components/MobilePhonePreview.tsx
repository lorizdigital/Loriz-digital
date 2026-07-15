"use client";

import { useCallback, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/** Muss der tatsächlichen Aufnahme aus capture-mobile-screenshot.mjs
 * entsprechen (Viewport 390×844). */
const CAPTURE_WIDTH = 390;
const CAPTURE_HEIGHT = 844;
/** Bewusst kleiner als CAPTURE_HEIGHT, damit innerhalb des Displays Raum für
 * die dezente Pan-Animation bleibt, ohne je über den Bildrand hinauszulaufen. */
const SCREEN_HEIGHT = 760;
const PAN_DURATION = 22;
const PAN_TIMES = [0, 0.3, 0.58, 0.82, 1];

type MobilePhonePreviewProps = {
  image: string;
  alt: string;
  startOffset?: number;
  endOffset?: number;
  priority?: boolean;
  className?: string;
};

export function MobilePhonePreview({
  image,
  alt,
  startOffset = 0,
  endOffset = CAPTURE_HEIGHT - SCREEN_HEIGHT,
  priority = false,
  className,
}: MobilePhonePreviewProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const controls = useAnimationControls();

  const startPercent = (startOffset / CAPTURE_HEIGHT) * 100;
  const endPercent = (endOffset / CAPTURE_HEIGHT) * 100;

  const startPan = useCallback(() => {
    controls.start({
      y: [`-${startPercent}%`, `-${startPercent}%`, `-${endPercent}%`, `-${endPercent}%`, `-${startPercent}%`],
      transition: { duration: PAN_DURATION, times: PAN_TIMES, repeat: Infinity, ease: "easeInOut" },
    });
  }, [controls, endPercent, startPercent]);

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ y: `-${startPercent}%` });
      return;
    }
    startPan();
  }, [controls, prefersReducedMotion, startPan, startPercent]);

  return (
    // Bewusst ohne eigenes `position`: Das steuert ausschließlich die
    // aufrufende Komponente über `className` (z. B. absolute Platzierung
    // neben dem Desktop-Browser). Die interne relative/absolute-Verschachtelung
    // für Notch und Screen lebt eine Ebene tiefer, damit sich beides nie
    // widerspricht.
    <div
      className={cn("glass-elevated backdrop-blur-[var(--glass-blur-sm)] rounded-xl p-2", className)}
      onPointerEnter={() => controls.stop()}
      onPointerLeave={() => !prefersReducedMotion && startPan()}
    >
      <div className="relative">
        {/* dezente Kamera-/Sensor-Andeutung statt schwerer Notch */}
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 h-1.5 w-8 -translate-x-1/2 rounded-full bg-black/15" />

        <div
          className="relative w-full overflow-hidden rounded-lg bg-surface-muted"
          style={{ aspectRatio: `${CAPTURE_WIDTH} / ${SCREEN_HEIGHT}` }}
        >
          <motion.div animate={controls} className="absolute inset-x-0 top-0">
            <Image
              src={image}
              alt={alt}
              width={CAPTURE_WIDTH}
              height={CAPTURE_HEIGHT}
              sizes="(min-width: 1024px) 220px, 45vw"
              quality={80}
              priority={priority}
              className="block h-auto w-full"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
