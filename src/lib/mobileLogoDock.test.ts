import { describe, expect, it } from "vitest";
import {
  getMobileLogoDockFrame,
  MOBILE_LOGO_DOCK_DISTANCE,
  type MobileLogoDockGeometry,
} from "./mobileLogoDock";

const geometry: MobileLogoDockGeometry = {
  sourceDocumentLeft: 24,
  sourceDocumentTop: 289,
  sourceWidth: 392,
  sourceHeight: 88,
  sourceMarkHeight: 80,
  targetCenterX: 54,
  targetCenterY: 46,
  targetWidth: 20,
  targetHeight: 20,
};

describe("getMobileLogoDockFrame", () => {
  it("starts at the source without a transform", () => {
    const frame = getMobileLogoDockFrame(geometry, 0);

    expect(frame.normalized).toBe(0);
    expect(frame.absoluteTranslateX).toBe(0);
    expect(frame.absoluteTranslateY).toBe(0);
    expect(frame.scale).toBe(1);
  });

  it("ends exactly over the fixed navigation target", () => {
    const frame = getMobileLogoDockFrame(geometry, MOBILE_LOGO_DOCK_DISTANCE);

    expect(frame.normalized).toBe(1);
    expect(frame.desiredCenterX).toBe(geometry.targetCenterX);
    expect(frame.desiredViewportY).toBe(geometry.targetCenterY);
    expect(frame.fixedTranslateX + geometry.sourceWidth / 2).toBe(
      geometry.targetCenterX,
    );
    expect(frame.fixedTranslateY + geometry.sourceHeight / 2).toBe(
      geometry.targetCenterY,
    );
    expect(frame.scale).toBe(geometry.targetHeight / geometry.sourceMarkHeight);
  });

  it("clamps overscroll before and after the dock range", () => {
    expect(getMobileLogoDockFrame(geometry, -80).normalized).toBe(0);
    expect(getMobileLogoDockFrame(geometry, 900).normalized).toBe(1);
  });
});
