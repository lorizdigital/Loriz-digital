"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Hydration-sicherer „sind wir im Client"-Flag – z. B. für Portale. */
export function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
