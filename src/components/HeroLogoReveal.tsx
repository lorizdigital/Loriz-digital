"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type AnimationEvent as ReactAnimationEvent,
} from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  isMotionDebugRecording,
  recordMotionDebugEvent,
} from "@/lib/motionDebug";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Baut die Loriz-Digital-Bildmarke aus ihren beiden geometrischen Teilen auf.
 * Die eigentliche Reveal-Bewegung laeuft als CSS-Keyframe-Animation auf dem
 * Compositor; React setzt nur einmal das Startsignal. Dadurch bleibt sie auch
 * waehrend der auf iOS gemessenen JavaScript/rAF-Pausen fluessig.
 */

type HeroLogoRevealProps = {
  start: boolean;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  forceComplete?: boolean;
  debugId?: "mobile" | "desktop";
  onComplete?: () => void;
};

const SETTLE_ANIMATION_NAME = "hero-logo-reveal-settle";
const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot() {
  return false;
}

export function HeroLogoReveal({
  start,
  mouseX,
  mouseY,
  forceComplete = false,
  debugId = "desktop",
  onComplete,
}: HeroLogoRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
  const hasCompletedRef = useRef(false);
  const viewportActive = debugId === "mobile" ? isMobile : !isMobile;
  const effectiveStart = start && viewportActive;

  const complete = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_complete", { id: debugId });
    }
    onComplete?.();
  }, [debugId, onComplete]);

  useEffect(() => {
    if (!effectiveStart || hasCompletedRef.current) return;
    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_start", {
        id: debugId,
        driver: "css-keyframes",
      });
    }
    if (prefersReducedMotion) complete();
  }, [effectiveStart, prefersReducedMotion, complete, debugId]);

  useEffect(() => {
    if (!viewportActive || !forceComplete || hasCompletedRef.current) return;
    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_force_complete", { id: debugId });
    }
    complete();
  }, [viewportActive, forceComplete, complete, debugId]);

  function recordCssAnimation(
    event: ReactAnimationEvent<SVGGElement>,
    action: "start" | "end",
  ) {
    if (isMotionDebugRecording()) {
      recordMotionDebugEvent("logo_reveal_css_animation", {
        id: debugId,
        action,
        name: event.animationName,
        elapsedMs: Math.round(event.elapsedTime * 1_000),
      });
    }
    if (action === "end" && event.animationName === SETTLE_ANIMATION_NAME) {
      complete();
    }
  }

  const tiltX = useTransform(mouseY, [-1, 1], prefersReducedMotion ? [0, 0] : [1, -1]);
  const tiltY = useTransform(mouseX, [-1, 1], prefersReducedMotion ? [0, 0] : [-1, 1]);
  const driftX = useTransform(mouseX, [-1, 1], prefersReducedMotion ? [0, 0] : [-6, 6]);
  const driftY = useTransform(mouseY, [-1, 1], prefersReducedMotion ? [0, 0] : [-5, 5]);
  const showCompleteState =
    viewportActive && (forceComplete || prefersReducedMotion);

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
      >
        <g
          className={cn(
            "hero-logo-reveal-parts",
            effectiveStart && !showCompleteState && "hero-logo-reveal-started",
            showCompleteState && "hero-logo-reveal-complete",
          )}
          onAnimationStart={(event) => recordCssAnimation(event, "start")}
          onAnimationEnd={(event) => recordCssAnimation(event, "end")}
        >
          <path
            className="hero-logo-reveal-dark"
            d="M 82.8 196.56 L 82.8 54 L 104.976 76.176 L 104.976 168.048 Z"
            fill="currentColor"
          />
          <path
            className="hero-logo-reveal-light"
            d="M 111.312 196.56 L 181.008 196.56 L 203.184 174.384 L 133.488 174.384 Z"
            fill="#d7d2cc"
          />
        </g>
      </motion.svg>
    </div>
  );
}
