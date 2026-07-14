import { describe, expect, it } from "vitest";

import { normalizeInquiryInput } from "./normalizeInput";

describe("server input normalization", () => {
  it("normalizes single-line values and preserves intentional message lines", () => {
    expect(
      normalizeInquiryInput({
        contact: { name: "  Lino\u0000   Loriz  " },
        additionalMessage: " Erste Zeile \r\n Zweite   Zeile ",
      }),
    ).toEqual({
      contact: { name: "Lino Loriz" },
      additionalMessage: "Erste Zeile\n Zweite Zeile",
    });
  });

  it("lowercases direct-API email input", () => {
    expect(
      normalizeInquiryInput({ contact: { email: "ANNA@EXAMPLE.COM" } }),
    ).toEqual({ contact: { email: "anna@example.com" } });
  });

  it("rejects excessively nested or link-heavy input", () => {
    let nested: unknown = "value";
    for (let index = 0; index < 14; index += 1) nested = { nested };
    expect(() => normalizeInquiryInput(nested)).toThrow(RangeError);
    expect(() =>
      normalizeInquiryInput({
        message: Array.from(
          { length: 9 },
          (_, index) => `https://example.com/${index}`,
        ).join(" "),
      }),
    ).toThrow(RangeError);
  });
});
