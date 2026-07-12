"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

const RENDER_WIDTH = 1440;
/** Feste Fensterhöhe im 1440px-Koordinatenraum – der sichtbare Ausschnitt
 * ist damit immer bewusst gewählt statt zufällig aus dem Grid-Layout
 * abgeleitet. */
const WINDOW_HEIGHT = 900;
const PAN_DURATION = 26;
const PAN_TIMES = [0, 0.28, 0.56, 0.8, 1];

type DesktopBrowserPreviewProps = {
  url: string;
  siteName: string;
  startOffset?: number;
  endOffset?: number;
  className?: string;
};

export function DesktopBrowserPreview({
  url,
  siteName,
  startOffset = 0,
  endOffset = 480,
  className,
}: DesktopBrowserPreviewProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const windowRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;

    const updateScale = () => setScale(el.offsetWidth / RENDER_WIDTH);
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startPan = () => {
    controls.start({
      y: [-startOffset, -startOffset, -endOffset, -endOffset, -startOffset],
      transition: { duration: PAN_DURATION, times: PAN_TIMES, repeat: Infinity, ease: "easeInOut" },
    });
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ y: -startOffset });
      return;
    }
    startPan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, startOffset, endOffset]);

  const domain = new URL(url).hostname.replace(/^www\./, "");
  const iframeContentHeight = endOffset + WINDOW_HEIGHT;

  return (
    <div
      className={cn("glass-elevated backdrop-blur-[var(--glass-blur-lg)] overflow-hidden rounded-[1.5rem]", className)}
      onPointerEnter={() => controls.stop()}
      onPointerLeave={() => !prefersReducedMotion && startPan()}
    >
      {/* Browser-Leiste */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-white/45 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e3aba1" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e8cf9c" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#a9d0b4" }} />
        </div>
        <div className="ml-2 flex-1 truncate rounded-full bg-white/70 px-3 py-1 text-center text-xs text-muted-foreground">
          {domain}
        </div>
      </div>

      {/* Fenster: feste Aspect-Ratio, bewusst gewählter Ausschnitt, schneidet
          nur den Website-Inhalt ab – nie den Rahmen selbst. */}
      <div
        ref={windowRef}
        className="relative w-full overflow-hidden bg-surface-muted"
        style={{ aspectRatio: `${RENDER_WIDTH} / ${WINDOW_HEIGHT}` }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clay/60" />
          </div>
        )}

        {scale > 0 && (
          // Ebene 1: ausschließlich Skalierung (responsiv, per ResizeObserver).
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: RENDER_WIDTH, transform: `scale(${scale})` }}
          >
            {/* Ebene 2: ausschließlich vertikale Position/Animation, im
                unskalierten 1440px-Koordinatenraum – kollidiert dadurch nie
                mit der scale()-Transformation von Ebene 1. */}
            <motion.div animate={controls}>
              <iframe
                src={url}
                title={`Live-Vorschau von ${siteName}`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="no-referrer"
                tabIndex={-1}
                aria-hidden="true"
                onLoad={() => setLoaded(true)}
                style={{ width: RENDER_WIDTH, height: iframeContentHeight, border: 0 }}
                className={cn(
                  "pointer-events-none block transition-opacity duration-500",
                  loaded ? "opacity-100" : "opacity-0",
                )}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
