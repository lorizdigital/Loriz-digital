import { describe, expect, it } from "vitest";
import { formatBookingDate } from "./dateFormat";

describe("formatBookingDate", () => {
  it("formats an ISO date in German without a timezone shift", () => {
    expect(formatBookingDate("2026-07-21")).toBe("Dienstag, 21. Juli 2026");
  });

  it("does not invent a date for invalid adapter data", () => {
    expect(formatBookingDate("2026-02-30")).toBe("2026-02-30");
    expect(formatBookingDate("not-a-date")).toBe("not-a-date");
  });
});
