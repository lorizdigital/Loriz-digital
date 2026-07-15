import { describe, expect, it } from "vitest";

import {
  buildInquiryConfirmationEmail,
  buildInquiryNotificationEmail,
} from "./emailFormat";
import { presentInquiryForEmail } from "./presentInquiry";

const identity = {
  fromEmail: "anfragen@send.loriz.digital",
  fromName: "Loriz Digital",
};

describe("inquiry email formatting", () => {
  it("uses the prospect only as reply-to and escapes user content", () => {
    const email = buildInquiryNotificationEmail({
      requestId: "019f5c48-c6cf-7fc1-8fcc-02ecccea914a",
      recipient: "hallo@loriz.digital",
      identity,
      inquiry: {
        projectType: "Neue Webseite",
        contact: {
          name: "<Lino>",
          email: "kunde@example.com",
          preferredContact: "E-Mail",
        },
        sections: [
          {
            heading: "Angaben",
            items: [{ label: "Ziele", value: ["Mehr Anfragen", "<script>"] }],
          },
        ],
      },
    });

    expect(email.sender.email).toBe("anfragen@send.loriz.digital");
    expect(email.to).toEqual([{ email: "hallo@loriz.digital" }]);
    expect(email.replyTo?.email).toBe("kunde@example.com");
    expect(email.htmlContent).not.toContain("<script>");
    expect(email.htmlContent).toContain("&lt;script&gt;");
    expect(email.textContent).toContain("Mehr Anfragen");
    expect(email.headers?.idempotencyKey).toBe("019f5c48-c6cf-7fc1-8fcc-02ecccea914a");
  });

  it("keeps the confirmation concise without inquiry answers", () => {
    const email = buildInquiryConfirmationEmail({
      requestId: "019f5c48-c6cf-7fc1-8fcc-02ecccea914a",
      identity,
      recipient: { email: "kunde@example.com", name: "Kunde" },
    });

    expect(email.textContent).toContain("Vielen Dank für Ihre Anfrage bei Loriz Digital.");
    expect(email.textContent).toContain("Ihre Angaben sind sicher bei mir eingegangen.");
    expect(email.textContent).toContain(
      "Diese E-Mail bestätigt lediglich den Eingang Ihrer Anfrage.",
    );
    expect(email.textContent).toContain("Referenz: 019f5c48-c6cf-7fc1-8fcc-02ecccea914a");
    expect(email.textContent).not.toContain("Projektart");
    expect(email.headers?.idempotencyKey).toBe("019f5c48-c6cf-7fc1-8fcc-02ecccea914b");
  });

  it("presents enum values with German labels and custom answers", () => {
    const inquiry = presentInquiryForEmail({
      projectType: "not_sure",
      answers: {
        improvements: ["more_inquiries", "other"],
        challenges: ["not_clear"],
      },
      customAnswers: { unsure_improvements: "Bessere Abläufe" },
      timeline: "within_4_weeks",
      projectStage: "first_idea",
      additionalChoice: "no",
      contact: {
        name: "Kunde",
        email: "kunde@example.com",
        preferredContact: "email",
      },
      privacyAccepted: true,
    });

    expect(inquiry.projectType).toBe("Ich bin noch nicht sicher");
    expect(inquiry.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              value: ["Mehr Anfragen", "Sonstiges: Bessere Abläufe"],
            }),
          ]),
        }),
      ]),
    );
  });
});
