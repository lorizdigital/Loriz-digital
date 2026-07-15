import { describe, expect, it } from "vitest";
import { demoBookingAdapter, validateDemoSelection } from "./demoAvailability";

describe("demo booking availability", () => {
  it("returns isolated demo data without sharing mutable references", async () => {
    const first = await demoBookingAdapter.listAvailability({ serviceId: "first-conversation" });
    const second = await demoBookingAdapter.listAvailability({ serviceId: "first-conversation" });

    first[1].slots[0].time = "00:00";
    expect(second[1].slots[0].time).toBe("09:30");
  });

  it("accepts only matching services, dates and time slots", () => {
    expect(() =>
      validateDemoSelection({
        serviceId: "first-conversation",
        date: "2026-07-21",
        slotId: "2026-07-21-0930",
      }),
    ).not.toThrow();

    expect(() =>
      validateDemoSelection({
        serviceId: "first-conversation",
        date: "2026-07-20",
        slotId: "injected-slot",
      }),
    ).toThrow("Die Demo-Auswahl ist nicht verfügbar.");
  });

  it("creates a local demo receipt without external persistence", async () => {
    const receipt = await demoBookingAdapter.createBooking(
      {
        serviceId: "project-review",
        date: "2026-07-24",
        slotId: "2026-07-24-1200",
      },
      { idempotencyKey: "test-selection" },
    );

    expect(receipt).toEqual({
      id: "demo-test-selection",
      status: "demo-confirmed",
    });
  });

  it("honors an aborted request before reading demo data", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      demoBookingAdapter.listAvailability(
        { serviceId: "first-conversation" },
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
