"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { DesktopBrowserPreview } from "@/components/DesktopBrowserPreview";
import { MobilePhonePreview } from "@/components/MobilePhonePreview";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const TABLET_QUERY = "(min-width: 640px)";

function subscribeToViewport(callback: () => void) {
  const mql = window.matchMedia(TABLET_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getViewportSnapshot() {
  return window.matchMedia(TABLET_QUERY).matches;
}

function getServerSnapshot() {
  // Server und erster Client-Render liefern bewusst denselben Wert, damit
  // nie versehentlich ein iframe unterhalb von 640px geladen wird und keine
  // Hydration-Mismatches entstehen.
  return false;
}

/** True ab Tablet-Breite (≥640px). Hydration-sicher, kein Flackern. */
function useIsTabletOrLarger() {
  return useSyncExternalStore(subscribeToViewport, getViewportSnapshot, getServerSnapshot);
}

export type ProjectShowcaseProps = {
  title: string;
  url: string;
  mobileImage: string;
  alt: string;
  accent?: string;
  desktopStartOffset?: number;
  desktopEndOffset?: number;
  mobileStartOffset?: number;
  mobileEndOffset?: number;
  className?: string;
};

export function ProjectShowcase({
  title,
  url,
  mobileImage,
  alt,
  accent = "#a3835f",
  desktopStartOffset,
  desktopEndOffset,
  mobileStartOffset,
  mobileEndOffset,
  className,
}: ProjectShowcaseProps) {
  const isTabletOrLarger = useIsTabletOrLarger();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} – Website in neuem Tab öffnen`}
      className={cn(
        "group relative flex h-full min-h-[340px] items-center justify-center p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:p-8 lg:min-h-[480px] lg:p-10",
        className,
      )}
    >
      {/* Sehr dezenter Lichtschein hinter den Geräten */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div
          className="h-2/3 w-2/3 rounded-full opacity-[0.12] blur-3xl"
          style={{ backgroundColor: accent }}
        />
      </div>

      {isTabletOrLarger ? (
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -4 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
          className="relative w-full max-w-[640px]"
        >
          <DesktopBrowserPreview
            url={url}
            siteName={title}
            startOffset={desktopStartOffset}
            endOffset={desktopEndOffset}
            className="w-full shadow-elevated transition-shadow duration-300 group-hover:shadow-[0_50px_90px_-30px_rgb(27_27_24/0.32)]"
          />
          <MobilePhonePreview
            image={mobileImage}
            alt={alt}
            startOffset={mobileStartOffset}
            endOffset={mobileEndOffset}
            className="absolute -bottom-7 -right-4 w-[32%] max-w-[180px] shadow-elevated sm:-right-6 lg:-bottom-9 lg:-right-8 lg:w-[29%] lg:max-w-[210px]"
          />
        </motion.div>
      ) : (
        <MobilePhonePreview
          image={mobileImage}
          alt={alt}
          startOffset={mobileStartOffset}
          endOffset={mobileEndOffset}
          className="w-full max-w-[300px] shadow-elevated"
        />
      )}
    </a>
  );
}
