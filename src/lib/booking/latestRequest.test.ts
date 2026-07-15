import { describe, expect, it } from "vitest";
import { LatestRequestCoordinator } from "./latestRequest";

describe("LatestRequestCoordinator", () => {
  it("invalidates and aborts an older request when a newer one starts", () => {
    const coordinator = new LatestRequestCoordinator();
    const first = coordinator.begin();
    const second = coordinator.begin();

    expect(first.signal.aborted).toBe(true);
    expect(first.isCurrent()).toBe(false);
    expect(second.signal.aborted).toBe(false);
    expect(second.isCurrent()).toBe(true);
  });

  it("invalidates the active request when the flow is reset", () => {
    const coordinator = new LatestRequestCoordinator();
    const request = coordinator.begin();

    coordinator.cancel();

    expect(request.signal.aborted).toBe(true);
    expect(request.isCurrent()).toBe(false);
  });

  it("keeps a completed handle stale after a later request was cancelled", () => {
    const coordinator = new LatestRequestCoordinator();
    const first = coordinator.begin();
    coordinator.begin();
    coordinator.cancel();

    expect(first.isCurrent()).toBe(false);
  });
});
