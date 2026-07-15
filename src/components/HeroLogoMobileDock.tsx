"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/useIsMounted";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MOBILE_LOGO_TARGET_ID } from "@/lib/mobileLogoDock";

const MOBILE_QUERY = "(max-width: 767px)";
const DOCK_DISTANCE = 300;

type DockGeometry = {
  sourceDocumentLeft: number;
  sourceDocumentTop: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceMarkHeight: number;
  targetCenterX: number;
  targetCenterY: number;
  targetHeight: number;
};

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

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

/**
 * Eine einzige mobile Logo-Instanz. Bis zum Beginn der Ueberfuehrung liegt
 * sie absolut an ihrer natuerlichen Dokumentposition und scrollt damit ohne
 * JavaScript-Lag. Nur waehrend der kurzen Reise wird ein GPU-Transform
 * aktualisiert; am Ziel wechselt dieselbe Instanz auf fixed und bleibt dort.
 */
export function HeroLogoMobileDock({ children }: { children: ReactNode }) {
  const mounted = useIsMounted();
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const placeholderRef = useRef<HTMLDivElement>(null);
  const sourceMarkRef = useRef<HTMLDivElement>(null);
  const flyingLogoRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<DockGeometry | null>(null);
  const active = mounted && isMobile && !prefersReducedMotion;

  useLayoutEffect(() => {
    if (!active) return;

    let width = window.innerWidth;
    let cancelled = false;

    function measure() {
      if (cancelled) return;
      const placeholder = placeholderRef.current;
      const sourceMark = sourceMarkRef.current;
      const target = document.getElementById(MOBILE_LOGO_TARGET_ID);
      if (!placeholder || !sourceMark || !target) return;

      const sourceRect = placeholder.getBoundingClientRect();
      const sourceMarkRect = sourceMark.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      if (!sourceRect.width || !sourceMarkRect.height || !targetRect.height) return;

      setGeometry({
        sourceDocumentLeft: sourceRect.left + window.scrollX,
        sourceDocumentTop: sourceRect.top + window.scrollY,
        sourceWidth: sourceRect.width,
        sourceHeight: sourceRect.height,
        sourceMarkHeight: sourceMarkRect.height,
        targetCenterX: targetRect.left + targetRect.width / 2,
        targetCenterY: targetRect.top + targetRect.height / 2,
        targetHeight: targetRect.height,
      });
    }

    function onResize() {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      measure();
    }

    measure();
    const placeholder = placeholderRef.current;
    const target = document.getElementById(MOBILE_LOGO_TARGET_ID);
    const resizeObserver = new ResizeObserver(measure);
    if (placeholder) resizeObserver.observe(placeholder);
    if (target) resizeObserver.observe(target);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("pageshow", measure);
    void document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("pageshow", measure);
    };
  }, [active]);

  useLayoutEffect(() => {
    const element = flyingLogoRef.current;
    if (!active || !element || !geometry) return;
    const flyingElement = element;
    const dockGeometry = geometry;

    let animationFrame: number | null = null;
    let mode: "absolute" | "fixed" = "absolute";
    let lastEndpoint: 0 | 1 | null = null;

    function renderAtCurrentScroll() {
      animationFrame = null;
      const scrollY = window.scrollY;
      const normalized = Math.min(1, Math.max(0, scrollY / DOCK_DISTANCE));
      const progress = smoothstep(normalized);
      const verticalPhase = Math.min(1, Math.max(0, (normalized - 0.45) / 0.55));
      const verticalProgress = smoothstep(verticalPhase);
      const targetScale = dockGeometry.targetHeight / dockGeometry.sourceMarkHeight;
      const nextMode =
        mode === "fixed"
          ? verticalProgress >= 0.78
            ? "fixed"
            : "absolute"
          : verticalProgress >= 0.85
            ? "fixed"
            : "absolute";

      if (nextMode === "fixed" && normalized === 1 && lastEndpoint === 1) {
        return;
      }
      if (nextMode === "absolute" && normalized === 0 && lastEndpoint === 0) {
        return;
      }

      if (nextMode !== mode) {
        mode = nextMode;
        flyingElement.style.position = mode;
        if (mode === "fixed") {
          flyingElement.style.left = "0px";
          flyingElement.style.top = "0px";
        } else {
          flyingElement.style.left = `${dockGeometry.sourceDocumentLeft}px`;
          flyingElement.style.top = `${dockGeometry.sourceDocumentTop}px`;
        }
      }

      const sourceCenterX =
        dockGeometry.sourceDocumentLeft + dockGeometry.sourceWidth / 2;
      const sourceCenterY =
        dockGeometry.sourceDocumentTop + dockGeometry.sourceHeight / 2;
      const sourceViewportY = sourceCenterY - scrollY;
      const desiredCenterX =
        sourceCenterX + (dockGeometry.targetCenterX - sourceCenterX) * progress;
      const desiredViewportY =
        sourceViewportY +
        (dockGeometry.targetCenterY - sourceViewportY) * verticalProgress;
      // Die vertikale Reise beginnt bewusst spaeter als Skalierung und
      // Seitwaertsbewegung. So bleibt die Marke zuerst im freien Hero-Bereich
      // und steigt erst als bereits kleine Form in den Header auf, statt mit
      // der grossen Headline optisch zu verschmelzen.
      const scale = 1 + (targetScale - 1) * progress;

      if (mode === "fixed") {
        flyingElement.style.transform = `translate3d(${desiredCenterX - dockGeometry.sourceWidth / 2}px, ${desiredViewportY - dockGeometry.sourceHeight / 2}px, 0) scale(${scale})`;
      } else {
        const translateX = desiredCenterX - sourceCenterX;
        const desiredDocumentY = scrollY + desiredViewportY;
        const translateY = desiredDocumentY - sourceCenterY;
        flyingElement.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      }

      lastEndpoint = normalized === 0 ? 0 : normalized === 1 ? 1 : null;
    }

    function scheduleRender() {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(renderAtCurrentScroll);
    }

    renderAtCurrentScroll();
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("pageshow", scheduleRender);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("pageshow", scheduleRender);
    };
  }, [active, geometry]);

  return (
    <>
      <div
        ref={placeholderRef}
        aria-hidden="true"
        className={
          mounted && !active
            ? "pointer-events-none w-full"
            : "pointer-events-none flex w-full items-center justify-center py-1 sm:py-4"
        }
      >
        {mounted && !active ? (
          children
        ) : (
          <div
            ref={sourceMarkRef}
            className="h-20 sm:h-28"
            style={{ aspectRatio: "140.4 / 162.6" }}
          />
        )}
      </div>

      {active &&
        geometry &&
        createPortal(
          <div
            ref={flyingLogoRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: geometry.sourceDocumentLeft,
              top: geometry.sourceDocumentTop,
              width: geometry.sourceWidth,
              height: geometry.sourceHeight,
              transformOrigin: "center center",
              willChange: "transform",
              backfaceVisibility: "hidden",
              pointerEvents: "none",
              zIndex: 60,
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
