export type MotionDebugStatus = "idle" | "recording" | "stopped";

export type MotionDebugEvent = {
  t: number;
  type: string;
  data: Record<string, unknown>;
};

type MotionDebugReport = {
  version: 1;
  createdAt: string;
  durationMs: number;
  metadata: Record<string, unknown>;
  events: MotionDebugEvent[];
};

const MAX_EVENTS = 20_000;

let status: MotionDebugStatus = "idle";
let recordingId = 0;
let startedAt = 0;
let stoppedAt = 0;
let metadata: Record<string, unknown> = {};
let events: MotionDebugEvent[] = [];

function round(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function viewportMetadata() {
  if (typeof window === "undefined") return {};
  const viewport = window.visualViewport;
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    devicePixelRatio: window.devicePixelRatio,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    visualViewportWidth: viewport?.width ?? null,
    visualViewportHeight: viewport?.height ?? null,
    visualViewportScale: viewport?.scale ?? null,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    path: window.location.pathname,
  };
}

export function isMotionDebugEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("motion-debug") === "1";
}

export function isMotionDebugRecording() {
  return status === "recording";
}

export function getMotionDebugStatus() {
  return status;
}

export function getMotionDebugRecordingId() {
  return recordingId;
}

export function getMotionDebugEventCount() {
  return events.length;
}

export function startMotionDebugRecording() {
  if (typeof window === "undefined") return;
  recordingId += 1;
  status = "recording";
  startedAt = performance.now();
  stoppedAt = 0;
  events = [];
  metadata = viewportMetadata();
  recordMotionDebugEvent("recording_start", {
    scrollY: round(window.scrollY),
    visualViewportOffsetTop: round(window.visualViewport?.offsetTop ?? 0),
  });
}

export function stopMotionDebugRecording() {
  if (status !== "recording") return;
  recordMotionDebugEvent("recording_stop", {
    scrollY: typeof window === "undefined" ? null : round(window.scrollY),
  });
  stoppedAt = performance.now();
  status = "stopped";
}

export function resetMotionDebugRecording() {
  status = "idle";
  startedAt = 0;
  stoppedAt = 0;
  metadata = {};
  events = [];
}

export function recordMotionDebugEvent(
  type: string,
  data: Record<string, unknown> = {},
) {
  if (status !== "recording" || typeof performance === "undefined") return false;
  if (events.length >= MAX_EVENTS) {
    stoppedAt = performance.now();
    status = "stopped";
    return false;
  }
  events.push({
    t: round(performance.now() - startedAt),
    type,
    data,
  });
  return true;
}

export function buildMotionDebugReport(): MotionDebugReport {
  const end = stoppedAt || (typeof performance === "undefined" ? startedAt : performance.now());
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    durationMs: round(Math.max(0, end - startedAt)),
    metadata,
    events,
  };
}

export function serializeMotionDebugReport() {
  return JSON.stringify(buildMotionDebugReport(), null, 2);
}

export function exportMotionDebugReport() {
  if (typeof document === "undefined") return;
  const blob = new Blob([serializeMotionDebugReport()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `loriz-motion-debug-${new Date().toISOString().replaceAll(":", "-")}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
