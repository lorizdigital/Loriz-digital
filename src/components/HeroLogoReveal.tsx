"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { easeGlass } from "@/lib/motion";
import {
  isMotionDebugRecording,
  recordMotionDebugEvent,
} from "@/lib/motionDebug";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Baut die Loriz-Digital-Bildmarke aus ihren zwei geometrischen Bestandteilen
 * zusammen (dunkle hohe Form + helle flache Form, exakte Pfade aus
 * LorizMark.tsx übernommen). Startet erst, wenn `start` von außen (Hero.tsx)
 * gesetzt wird – kein eigener, unabhängig geratener Timer.
 */

type Phase = "idle" | "dark" | "light" | "settle" | "done";

const STEP_ORDER: Phase[] = ["idle", "dark", "light", "settle", "done"];

function stepAtLeast(current: Phase, target: Phase) {
  return STEP_ORDER.indexOf(current) >= STEP_ORDER.indexOf(target);
}

type HeroLogoRevealProps = {
  start: boolean;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  forceComplete?: boolean;
  debugId?: "mobile" | "desktop";
  onComplete?: () => void;
};

export function HeroLogoReveal({
  start,
  mouseX,
  mouseY,
  forceComplete = false,
  debugId = "desktop",
  onComplete,
}: HeroLogoRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const hasCompletedRef = useRef(false);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const complete = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_complete", { id: debugId });
    }
    setPhase("done");
    onComplete?.();
  }, [debugId, onComplete]);

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        timeoutsRef.current.delete(id);
        resolve();
      }, ms);
      timeoutsRef.current.add(id);
    });
  }

  useEffect(() => {
    if (!start || hasCompletedRef.current) return;

    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_start", { id: debugId });
    }

    if (prefersReducedMotion) {
      wait(0).then(complete);
    } else {
      async function run() {
        setPhase("dark");
        await wait(450);
        setPhase("light");
        await wait(1000);
        setPhase("settle");
        // Die Settle-Bewegung dauert 600 ms. Erst danach darf das Fertig-
        // Signal den Hero umschalten, sonst wird ihr letzter Abschnitt auf
        // Safari beim Refresh sichtbar abgeschnitten.
        await wait(650);
        complete();
      }
      run();
    }

    // React prueft Effekte im Strict Mode mit einem zusaetzlichen
    // Setup/Cleanup-Durchlauf. Ohne erneutes Scheduling bliebe die Marke nach
    // dem ersten Teil der Animation unsichtbar. Die Completion-Sperre reicht
    // aus, um echte Wiederholungen nach Abschluss zu verhindern.
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, [start, prefersReducedMotion, complete, debugId]);

  useEffect(() => {
    if (!isMotionDebugRecording()) return;
    recordMotionDebugEvent("logo_reveal_phase", { id: debugId, phase });
  }, [debugId, phase]);

  // Beginnt der Nutzer auf Mobil bereits zu scrollen, gewinnt seine
  // Interaktion: Das Logo springt in seinen ruhigen Endzustand, bevor der
  // scrollgebundene Dock es bewegt. So fliegen nie nur einzelne Logohaelften.
  useEffect(() => {
    if (!forceComplete || hasCompletedRef.current) return;
    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_force_complete", { id: debugId });
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
    wait(0).then(complete);
  }, [forceComplete, complete, debugId]);

  const d = (seconds: number) => (prefersReducedMotion || forceComplete ? 0 : seconds);
  const effectivePhase: Phase = forceComplete ? "done" : phase;

  const tiltX = useTransform(mouseY, [-1, 1], prefersReducedMotion ? [0, 0] : [1, -1]);
  const tiltY = useTransform(mouseX, [-1, 1], prefersReducedMotion ? [0, 0] : [-1, 1]);
  const driftX = useTransform(mouseX, [-1, 1], prefersReducedMotion ? [0, 0] : [-6, 6]);
  const driftY = useTransform(mouseY, [-1, 1], prefersReducedMotion ? [0, 0] : [-5, 5]);

  return (
    <div className="flex w-full items-center justify-center py-1 sm:py-4 lg:py-0">
      <motion.svg
        viewBox="72.8 44 140.4 162.6"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-auto text-foreground sm:h-28 md:h-52 lg:h-72 xl:h-80"
        style={{
          x: driftX,
          y: driftY,
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 1200,
        }}
        animate={stepAtLeast(effectivePhase, "settle") ? { scale: [1, 1.015, 1] } : { scale: 1 }}
        transition={{ duration: d(0.6), ease: easeGlass }}
      >
        {/* Dunkle, hohe Form */}
        <motion.path
          d="M 82.8 196.56 L 82.8 54 L 104.976 76.176 L 104.976 168.048 Z"
          fill="currentColor"
          initial={{ opacity: 0, x: -22, y: 14, rotate: -5 }}
          animate={
            stepAtLeast(effectivePhase, "dark")
              ? { opacity: 1, x: 0, y: 0, rotate: 0 }
              : undefined
          }
          transition={{ duration: d(1.1), ease: easeGlass }}
        />
        {/* Helle, flache Form */}
        <motion.path
          d="M 111.312 196.56 L 181.008 196.56 L 203.184 174.384 L 133.488 174.384 Z"
          fill="#d7d2cc"
          initial={{ opacity: 0, x: 18, y: 22 }}
          animate={
            stepAtLeast(effectivePhase, "light")
              ? { opacity: 1, x: 0, y: 0 }
              : undefined
          }
          transition={{ duration: d(1.0), ease: easeGlass }}
        />
      </motion.svg>
    </div>
  );
}
