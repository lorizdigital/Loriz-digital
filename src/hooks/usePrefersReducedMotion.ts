"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  // Server und erster Client-Render liefern bewusst denselben Wert, damit
  // keine Hydration-Mismatches entstehen (siehe framer-motions eigenes
  // useReducedMotion, das window.matchMedia synchron beim ersten
  // Client-Render liest und damit vom Server abweichen kann).
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
