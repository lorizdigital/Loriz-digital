"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { LorizMark } from "@/components/icons/LorizMark";
import { useIsMounted } from "@/hooks/useIsMounted";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  getMobileLogoDockFrame,
  MOBILE_LOGO_DOCK_DISTANCE,
  MOBILE_LOGO_TARGET_ID,
  MOBILE_LOGO_TIMELINE_STEPS,
  type MobileLogoDockGeometry,
} from "@/lib/mobileLogoDock";
import {
  getMotionDebugRecordingId,
  isMotionDebugRecording,
  recordMotionDebugEvent,
} from "@/lib/motionDebug";

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

function debugRound(value: number) {
  return Math.round(value * 1_000) / 1_000;
}

function supportsCssScrollTimeline() {
  return (
    typeof CSS !== "undefined" &&
    CSS.supports("animation-timeline: scroll()") &&
    CSS.supports(`animation-range: 0px ${MOBILE_LOGO_DOCK_DISTANCE}px`)
  );
}

function buildCssTimelineStyle(geometry: MobileLogoDockGeometry) {
  const style: Record<string, string | number> = {};

  for (let index = 0; index <= MOBILE_LOGO_TIMELINE_STEPS; index += 1) {
    const scrollY =
      (index / MOBILE_LOGO_TIMELINE_STEPS) * MOBILE_LOGO_DOCK_DISTANCE;
    const frame = getMobileLogoDockFrame(geometry, scrollY);
    style[`--mobile-logo-transform-${index}`] =
      `translate3d(${frame.absoluteTranslateX}px, ${frame.absoluteTranslateY}px, 0) scale(${frame.scale})`;
  }

  return style as CSSProperties;
}

/**
 * Auf modernen Browsern treibt die native CSS-Scroll-Timeline die Reise auf
 * dem Compositor. Das Quelllogo bleibt dabei absolut im Dokument (inklusive
 * iOS-Overscroll), waehrend am Ziel eine deckungsgleiche feste Bildmarke
 * weich uebernimmt. Aeltere Browser behalten den JavaScript-Fallback.
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
  const [geometry, setGeometry] = useState<MobileLogoDockGeometry | null>(null);
  const active = mounted && isMobile && !prefersReducedMotion;
  const cssTimelineSupported = active && supportsCssScrollTimeline();

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
        targetWidth: targetRect.width,
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
    if (!active || cssTimelineSupported || !element || !geometry) return;
    const flyingElement = element;
    const dockGeometry = geometry;

    let animationFrame: number | null = null;
    let mode: "absolute" | "fixed" = "absolute";
    let lastEndpoint: 0 | 1 | null = null;
    let lastDebugRenderAt: number | null = null;
    let geometryLoggedForRecording = false;
    let lastDebugRecordingId = 0;

    function renderAtCurrentScroll() {
      animationFrame = null;
      const debugRecording = isMotionDebugRecording();
      const debugRecordingId = debugRecording ? getMotionDebugRecordingId() : 0;
      if (debugRecording && debugRecordingId !== lastDebugRecordingId) {
        lastDebugRecordingId = debugRecordingId;
        lastDebugRenderAt = null;
        geometryLoggedForRecording = false;
      }
      if (debugRecording && !geometryLoggedForRecording) {
        geometryLoggedForRecording = recordMotionDebugEvent("logo_geometry", {
          dockDistance: MOBILE_LOGO_DOCK_DISTANCE,
          sourceDocumentLeft: debugRound(dockGeometry.sourceDocumentLeft),
          sourceDocumentTop: debugRound(dockGeometry.sourceDocumentTop),
          sourceWidth: debugRound(dockGeometry.sourceWidth),
          sourceHeight: debugRound(dockGeometry.sourceHeight),
          sourceMarkHeight: debugRound(dockGeometry.sourceMarkHeight),
          targetCenterX: debugRound(dockGeometry.targetCenterX),
          targetCenterY: debugRound(dockGeometry.targetCenterY),
          targetWidth: debugRound(dockGeometry.targetWidth),
          targetHeight: debugRound(dockGeometry.targetHeight),
        });
      } else if (!debugRecording) {
        lastDebugRecordingId = 0;
        geometryLoggedForRecording = false;
      }
      const debugNow = debugRecording ? performance.now() : 0;
      const debugFrameDelta =
        debugRecording && lastDebugRenderAt !== null
          ? debugRound(debugNow - lastDebugRenderAt)
          : null;
      if (debugRecording) lastDebugRenderAt = debugNow;
      else lastDebugRenderAt = null;

      const scrollY = window.scrollY;
      const frame = getMobileLogoDockFrame(dockGeometry, scrollY);
      const { normalized, progress, verticalProgress, scale } = frame;
      const nextMode =
        mode === "fixed"
          ? verticalProgress >= 0.78
            ? "fixed"
            : "absolute"
          : verticalProgress >= 0.85
            ? "fixed"
            : "absolute";

      if (nextMode === "fixed" && normalized === 1 && lastEndpoint === 1) {
        if (debugRecording) {
          recordMotionDebugEvent("logo_render", {
            scrollY: debugRound(scrollY),
            normalized,
            progress,
            verticalProgress,
            mode,
            nextMode,
            skippedEndpointWrite: true,
            frameDeltaMs: debugFrameDelta,
          });
        }
        return;
      }
      if (nextMode === "absolute" && normalized === 0 && lastEndpoint === 0) {
        if (debugRecording) {
          recordMotionDebugEvent("logo_render", {
            scrollY: debugRound(scrollY),
            normalized,
            progress,
            verticalProgress,
            mode,
            nextMode,
            skippedEndpointWrite: true,
            frameDeltaMs: debugFrameDelta,
          });
        }
        return;
      }

      if (nextMode !== mode) {
        if (debugRecording) {
          recordMotionDebugEvent("logo_mode_change", {
            scrollY: debugRound(scrollY),
            from: mode,
            to: nextMode,
            normalized,
            verticalProgress,
          });
        }
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

      // Die vertikale Reise beginnt bewusst spaeter als Skalierung und
      // Seitwaertsbewegung. So bleibt die Marke zuerst im freien Hero-Bereich
      // und steigt erst als bereits kleine Form in den Header auf, statt mit
      // der grossen Headline optisch zu verschmelzen.
      if (mode === "fixed") {
        flyingElement.style.transform = `translate3d(${frame.fixedTranslateX}px, ${frame.fixedTranslateY}px, 0) scale(${scale})`;
      } else {
        flyingElement.style.transform = `translate3d(${frame.absoluteTranslateX}px, ${frame.absoluteTranslateY}px, 0) scale(${scale})`;
      }

      lastEndpoint = normalized === 0 ? 0 : normalized === 1 ? 1 : null;

      if (debugRecording) {
        recordMotionDebugEvent("logo_render", {
          scrollY: debugRound(scrollY),
          normalized: debugRound(normalized),
          progress: debugRound(progress),
          verticalProgress: debugRound(verticalProgress),
          mode,
          scale: debugRound(scale),
          desiredCenterX: debugRound(frame.desiredCenterX),
          desiredViewportY: debugRound(frame.desiredViewportY),
          targetCenterX: debugRound(dockGeometry.targetCenterX),
          targetCenterY: debugRound(dockGeometry.targetCenterY),
          visualViewportHeight: debugRound(window.visualViewport?.height ?? window.innerHeight),
          visualViewportOffsetTop: debugRound(window.visualViewport?.offsetTop ?? 0),
          frameDeltaMs: debugFrameDelta,
          skippedEndpointWrite: false,
        });
      }
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
  }, [active, cssTimelineSupported, geometry]);

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
          <>
            <div
              ref={flyingLogoRef}
              aria-hidden="true"
              data-logo-driver={
                cssTimelineSupported ? "css-scroll-timeline" : "js-scroll-events"
              }
              className={cssTimelineSupported ? "mobile-logo-scroll-source" : undefined}
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
                ...(cssTimelineSupported ? buildCssTimelineStyle(geometry) : {}),
              }}
            >
              {children}
            </div>

            {cssTimelineSupported && (
              <div
                aria-hidden="true"
                className="mobile-logo-scroll-target pointer-events-none fixed z-[60] text-foreground"
                style={{
                  left: geometry.targetCenterX - geometry.targetWidth / 2,
                  top: geometry.targetCenterY - geometry.targetHeight / 2,
                  width: geometry.targetWidth,
                  height: geometry.targetHeight,
                }}
              >
                <LorizMark className="h-full w-full" />
              </div>
            )}
          </>,
          document.body,
        )}
    </>
  );
}
