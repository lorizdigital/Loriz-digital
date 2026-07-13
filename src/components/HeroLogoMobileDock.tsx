"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsMounted } from "@/hooks/useIsMounted";
import { heroLogoDockProgress, NAV_LOGO_DOM_ID } from "@/lib/heroLogoDock";

/**
 * Distanz (px), über die sich die mobile Scroll-Überführung erstreckt. Bewusst
 * ein fester Wert statt an die Hero-Höhe gekoppelt – hält den Übergang auf
 * allen realistischen Mobil-Bildschirmen kurz und kontrolliert, ohne eine
 * zusätzliche Höhen-Messung als weitere Fehlerquelle einzuführen.
 */
const DOCK_DISTANCE = 300;
const NAV_THRESHOLD_SCROLL_Y = 24;
const NAV_MORPH_TRACK_MS = 700;

type Rect = { top: number; left: number; width: number; height: number };

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
}

type HeroLogoMobileDockProps = {
  children: ReactNode;
  ready: boolean;
};

/**
 * Nur auf Mobil (< md) und ohne prefers-reduced-motion aktiv: überführt das
 * fertige Hero-Logo direkt scrollgebunden zur tatsächlichen Position des
 * Navigations-Logos. Auf Tablet/Desktop (>= md) oder bei reduzierter Bewegung
 * wird schlicht das Kind unverändert gerendert – ohne jeden Scroll-Listener.
 */
export function HeroLogoMobileDock({ children, ready }: HeroLogoMobileDockProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const active = isMobile && !prefersReducedMotion;

  useLayoutEffect(() => {
    if (!active) heroLogoDockProgress.set(1);
  }, [active]);

  if (!active) {
    return <>{children}</>;
  }

  return <HeroLogoDockActive ready={ready}>{children}</HeroLogoDockActive>;
}

function HeroLogoDockActive({ children, ready }: HeroLogoMobileDockProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const sourceMarkRef = useRef<HTMLDivElement>(null);
  const [initialRect, setInitialRect] = useState<Rect | null>(null);
  const [initialMarkHeight, setInitialMarkHeight] = useState(0);
  const mounted = useIsMounted();
  const targetCenterX = useMotionValue(0);
  const targetCenterY = useMotionValue(0);
  const targetHeight = useMotionValue(0);

  // Startgeometrie: eigene, im Fluss stehende Platzhalter-Box. In eine
  // scroll-invariante ("Dokument"-)Referenz umgerechnet, damit die spätere
  // Transform-Berechnung unabhängig vom Scroll-Stand zum Messzeitpunkt ist.
  useLayoutEffect(() => {
    function measure() {
      const el = placeholderRef.current;
      const mark = sourceMarkRef.current;
      if (!el || !mark) return;
      const rect = el.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      setInitialRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      setInitialMarkHeight(markRect.height);
    }

    measure();

    const el = placeholderRef.current;
    const resizeObserver = new ResizeObserver(measure);
    if (el) resizeObserver.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // Zielgeometrie: das echte Navigationslogo. Beim Schwellwert von 24 px morphen
  // Padding und Position der Navigation per Layout-Animation. Deshalb wird die
  // Zielbox waehrend dieses kurzen Fensters bildsynchron nachgemessen; eine
  // einzelne verzoegerte Messung koennte sonst einen sichtbaren Endsprung
  // verursachen.
  useLayoutEffect(() => {
    function measure() {
      const el = document.getElementById(NAV_LOGO_DOM_ID);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetCenterX.set(rect.left + rect.width / 2);
      targetCenterY.set(rect.top + rect.height / 2);
      targetHeight.set(rect.height);
    }

    measure();

    let wasScrolled = window.scrollY > NAV_THRESHOLD_SCROLL_Y;
    let animationFrame: number | null = null;
    let trackUntil = 0;

    function trackTargetFor(duration: number) {
      trackUntil = Math.max(trackUntil, performance.now() + duration);
      if (animationFrame !== null) return;

      function tick() {
        measure();
        if (performance.now() < trackUntil) {
          animationFrame = requestAnimationFrame(tick);
        } else {
          animationFrame = null;
        }
      }

      animationFrame = requestAnimationFrame(tick);
    }

    function onScroll() {
      measure();
      const isScrolled = window.scrollY > NAV_THRESHOLD_SCROLL_Y;
      if (isScrolled !== wasScrolled) {
        wasScrolled = isScrolled;
        trackTargetFor(NAV_MORPH_TRACK_MS);
      }
    }

    function onViewportChange() {
      measure();
      trackTargetFor(NAV_MORPH_TRACK_MS);
    }

    // Deckt initiale Layout-Animationen sowie restaurierte Scrollpositionen ab.
    trackTargetFor(NAV_MORPH_TRACK_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);

    const el = document.getElementById(NAV_LOGO_DOM_ID);
    const resizeObserver = new ResizeObserver(measure);
    if (el) resizeObserver.observe(el);

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      resizeObserver.disconnect();
    };
  }, [targetCenterX, targetCenterY, targetHeight]);

  const { scrollY } = useScroll();

  const rawProgress = useTransform(
    scrollY,
    [0, 0.15 * DOCK_DISTANCE, 0.65 * DOCK_DISTANCE, DOCK_DISTANCE],
    [0, 0.02, 0.85, 1],
    { clamp: true },
  );
  const readyProgress = useMotionValue(ready ? 1 : 0);

  useLayoutEffect(() => {
    readyProgress.set(ready ? 1 : 0);
  }, [ready, readyProgress]);

  const dockProgress = useTransform(
    [rawProgress, readyProgress],
    (values: number[]) => (values[1] === 1 ? values[0] : 0),
  );

  // Die räumliche Reise endet bewusst vor der visuellen Übergabe. Erst wenn
  // beide Marken exakt deckungsgleich sind, übernimmt das echte Nav-Logo.
  // Dadurch gibt es kurz vor dem Ziel keine versetzte Doppelkontur.
  const travelProgress = useTransform(dockProgress, [0, 0.9], [0, 1], { clamp: true });

  const x = useTransform([travelProgress, targetCenterX], (values: number[]) => {
    const [p, targetX] = values;
    if (!initialRect) return 0;
    const initialCenterX = initialRect.left + initialRect.width / 2;
    return (targetX - initialCenterX) * p;
  });

  const y = useTransform([travelProgress, scrollY, targetCenterY], (values: number[]) => {
    const [p, sy, targetY] = values;
    if (!initialRect) return 0;
    const initialCenterY = initialRect.top + initialRect.height / 2;
    return (targetY - initialCenterY) * p - sy * (1 - p);
  });

  const scale = useTransform([travelProgress, targetHeight], (values: number[]) => {
    const [p, measuredTargetHeight] = values;
    if (initialMarkHeight === 0 || measuredTargetHeight === 0) return 1;
    const targetScale = measuredTargetHeight / initialMarkHeight;
    return 1 + (targetScale - 1) * p;
  });

  // Das Nav-Logo ist zu diesem Zeitpunkt bereits deckungsgleich eingeblendet.
  // Beim Ausblenden des Portal-Logos bleibt die resultierende Deckkraft daher
  // konstant, statt in der Mitte eines klassischen Crossfades abzufallen.
  const heroOpacity = useTransform(dockProgress, [0.94, 1], [1, 0]);

  useMotionValueEvent(dockProgress, "change", (v) => {
    heroLogoDockProgress.set(v);
  });

  // useMotionValueEvent reagiert erst auf Aenderungen. Bei Reload, Back-Navigation
  // oder Breakpoint-Wechsel muss der aktuelle Scrollstand bereits vor dem Paint
  // im Navigations-Crossfade ankommen.
  useLayoutEffect(() => {
    heroLogoDockProgress.set(dockProgress.get());
    return () => heroLogoDockProgress.set(1);
  }, [dockProgress]);

  return (
    <>
      <div
        ref={placeholderRef}
        aria-hidden="true"
        className="pointer-events-none flex w-full items-center justify-center py-1 sm:py-4 lg:py-0"
      >
        <div
          ref={sourceMarkRef}
          className="h-20 sm:h-28"
          style={{ aspectRatio: "140.4 / 162.6" }}
        />
      </div>

      {mounted &&
        initialRect &&
        createPortal(
          <motion.div
            aria-hidden="true"
            style={{
              position: "fixed",
              top: initialRect.top,
              left: initialRect.left,
              width: initialRect.width,
              height: initialRect.height,
              x,
              y,
              scale,
              opacity: heroOpacity,
              pointerEvents: "none",
              // Das Logo fliegt sichtbar vor dem Header. Das geoeffnete
              // MobileMenu-Panel liegt separat auf Ebene 70 und deckt es ab.
              zIndex: 60,
            }}
          >
            {children}
          </motion.div>,
          document.body,
        )}
    </>
  );
}
