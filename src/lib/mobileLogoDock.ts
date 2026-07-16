export const MOBILE_LOGO_TARGET_ID = "mobile-logo-dock-target";
export const MOBILE_LOGO_DOCK_DISTANCE = 300;
export const MOBILE_LOGO_TIMELINE_STEPS = 20;

export type MobileLogoDockGeometry = {
  sourceDocumentLeft: number;
  sourceDocumentTop: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceMarkHeight: number;
  targetCenterX: number;
  targetCenterY: number;
  targetWidth: number;
  targetHeight: number;
};

export type MobileLogoDockFrame = {
  normalized: number;
  progress: number;
  verticalProgress: number;
  scale: number;
  desiredCenterX: number;
  desiredViewportY: number;
  absoluteTranslateX: number;
  absoluteTranslateY: number;
  fixedTranslateX: number;
  fixedTranslateY: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

export function getMobileLogoDockFrame(
  geometry: MobileLogoDockGeometry,
  scrollY: number,
): MobileLogoDockFrame {
  const normalized = clamp01(scrollY / MOBILE_LOGO_DOCK_DISTANCE);
  const progress = smoothstep(normalized);
  const verticalPhase = clamp01((normalized - 0.45) / 0.55);
  const verticalProgress = smoothstep(verticalPhase);
  const targetScale = geometry.targetHeight / geometry.sourceMarkHeight;
  const sourceCenterX = geometry.sourceDocumentLeft + geometry.sourceWidth / 2;
  const sourceCenterY = geometry.sourceDocumentTop + geometry.sourceHeight / 2;
  const sourceViewportY = sourceCenterY - scrollY;
  const desiredCenterX =
    sourceCenterX + (geometry.targetCenterX - sourceCenterX) * progress;
  const desiredViewportY =
    sourceViewportY +
    (geometry.targetCenterY - sourceViewportY) * verticalProgress;
  const scale = 1 + (targetScale - 1) * progress;

  return {
    normalized,
    progress,
    verticalProgress,
    scale,
    desiredCenterX,
    desiredViewportY,
    absoluteTranslateX: desiredCenterX - sourceCenterX,
    absoluteTranslateY: scrollY + desiredViewportY - sourceCenterY,
    fixedTranslateX: desiredCenterX - geometry.sourceWidth / 2,
    fixedTranslateY: desiredViewportY - geometry.sourceHeight / 2,
  };
}
