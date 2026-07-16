"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  exportMotionDebugReport,
  getMotionDebugEventCount,
  getMotionDebugStatus,
  isMotionDebugEnabled,
  recordMotionDebugEvent,
  resetMotionDebugRecording,
  serializeMotionDebugReport,
  startMotionDebugRecording,
  stopMotionDebugRecording,
  type MotionDebugStatus,
} from "@/lib/motionDebug";

function round(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function subscribeDebugUrl(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getServerDebugSnapshot() {
  return false;
}

export function MotionDebugPanel() {
  const enabled = useSyncExternalStore(
    subscribeDebugUrl,
    isMotionDebugEnabled,
    getServerDebugSnapshot,
  );
  const [status, setStatus] = useState<MotionDebugStatus>(() => getMotionDebugStatus());
  const [eventCount, setEventCount] = useState(0);
  const [copyLabel, setCopyLabel] = useState("JSON kopieren");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || status !== "recording") return;

    let previousFrame = performance.now();
    let frameIndex = 0;

    function captureFrame(now: number) {
      const delta = now - previousFrame;
      previousFrame = now;
      frameIndex += 1;
      const recorded = recordMotionDebugEvent("frame", {
        index: frameIndex,
        deltaMs: round(delta),
      });
      if (!recorded) {
        frameRef.current = null;
        setEventCount(getMotionDebugEventCount());
        setStatus("stopped");
        return;
      }
      frameRef.current = window.requestAnimationFrame(captureFrame);
    }

    function captureViewportEvent(event: Event) {
      const viewport = window.visualViewport;
      recordMotionDebugEvent(`viewport_${event.type}`, {
        scrollY: round(window.scrollY),
        innerHeight: window.innerHeight,
        width: round(viewport?.width ?? window.innerWidth),
        height: round(viewport?.height ?? window.innerHeight),
        offsetTop: round(viewport?.offsetTop ?? 0),
        scale: round(viewport?.scale ?? 1),
      });
    }

    function captureWindowResize(event: Event) {
      recordMotionDebugEvent(event.type, {
        scrollY: round(window.scrollY),
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    }

    function captureWindowScroll() {
      recordMotionDebugEvent("scroll", {
        scrollY: round(window.scrollY),
        visualViewportOffsetTop: round(window.visualViewport?.offsetTop ?? 0),
      });
    }

    frameRef.current = window.requestAnimationFrame(captureFrame);
    window.addEventListener("resize", captureWindowResize);
    window.addEventListener("orientationchange", captureWindowResize);
    window.addEventListener("scroll", captureWindowScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", captureViewportEvent);
    window.visualViewport?.addEventListener("scroll", captureViewportEvent);

    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      window.removeEventListener("resize", captureWindowResize);
      window.removeEventListener("orientationchange", captureWindowResize);
      window.removeEventListener("scroll", captureWindowScroll);
      window.visualViewport?.removeEventListener("resize", captureViewportEvent);
      window.visualViewport?.removeEventListener("scroll", captureViewportEvent);
    };
  }, [enabled, status]);

  if (!enabled) return null;

  function start() {
    startMotionDebugRecording();
    setEventCount(0);
    setCopyLabel("JSON kopieren");
    setStatus("recording");
  }

  function stop() {
    stopMotionDebugRecording();
    setEventCount(getMotionDebugEventCount());
    setStatus("stopped");
  }

  function reset() {
    resetMotionDebugRecording();
    setEventCount(0);
    setCopyLabel("JSON kopieren");
    setStatus("idle");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(serializeMotionDebugReport());
      setCopyLabel("Kopiert");
    } catch {
      setCopyLabel("Kopieren fehlgeschlagen");
    }
  }

  if (status === "recording") {
    return (
      <aside
        aria-label="Motion-Diagnose"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[120]"
      >
        <button
          type="button"
          onClick={stop}
          className="flex min-h-11 items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-red-400" />
          Aufzeichnung stoppen
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Motion-Diagnose"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[120] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-neutral-950 p-4 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Motion-Diagnose</p>
        <span className="flex items-center gap-2 text-xs text-white/70">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white/35" />
          {status === "stopped" ? "Gestoppt" : "Bereit"}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/65">
        Starten, einmal langsam herunter und wieder hoch scrollen, dann stoppen und JSON exportieren.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={start}
          className="min-h-11 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
        >
          {status === "stopped" ? "Neu aufzeichnen" : "Aufzeichnung starten"}
        </button>

        {status === "stopped" && (
          <>
            <button
              type="button"
              onClick={exportMotionDebugReport}
              className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-xs font-medium"
            >
              JSON exportieren
            </button>
            <button
              type="button"
              onClick={copy}
              className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-xs font-medium"
            >
              {copyLabel}
            </button>
          </>
        )}
      </div>

      {status === "stopped" && (
        <div className="mt-3 flex items-center justify-between gap-3 text-[0.68rem] text-white/55">
          <span>{eventCount.toLocaleString("de-DE")} Messpunkte</span>
          <button type="button" onClick={reset} className="min-h-9 px-2 underline underline-offset-2">
            Zurücksetzen
          </button>
        </div>
      )}
      <p className="mt-3 border-t border-white/10 pt-3 text-[0.65rem] leading-relaxed text-white/45">
        Bleibt lokal auf diesem Gerät. Keine Übertragung an den Server.
      </p>
    </aside>
  );
}
