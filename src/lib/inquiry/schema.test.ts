import { describe, expect, it } from "vitest";
import { safeParseInquirySubmission } from "./schema";

const shared = {
  timeline: "one_to_three_months",
  projectStage: "rough_requirements",
  additionalChoice: "no" as const,
  customAnswers: {},
  contact: {
    name: "Anna Beispiel",
    email: "anna@example.com",
    preferredContact: "email" as const,
  },
  privacyAccepted: true as const,
};

const submissions = [
  {
    ...shared,
    projectType: "new_website",
    answers: {
      goals: ["more_inquiries"],
      requestedPages: ["home", "services"],
      requestedFeatures: ["contact_requests"],
      contentStatus: "partly_available",
    },
  },
  {
    ...shared,
    projectType: "website_redesign",
    answers: {
      improvements: ["design"],
      currentSituation: ["outdated"],
      currentWebsite: "https://example.com",
      scope: "technical_rebuild",
    },
  },
  {
    ...shared,
    projectType: "digital_processes",
    answers: {
      area: ["customer_requests"],
      currentWorkflow: ["email"],
      desiredOutcomes: ["less_time"],
      users: ["team"],
    },
  },
  {
    ...shared,
    projectType: "custom_software",
    answers: {
      solutionType: ["internal_web_app"],
      tasks: ["manage_data"],
      access: ["whole_team"],
      existingSystemRelation: "none",
    },
  },
  {
    ...shared,
    projectType: "not_sure",
    answers: {
      improvements: ["organization"],
      challenges: ["overview"],
    },
  },
];

describe("inquirySubmissionSchema", () => {
  it("accepts all five complete branches", () => {
    for (const submission of submissions) {
      expect(safeParseInquirySubmission(submission).success).toBe(true);
    }
  });

  it("rejects unknown fields such as a removed budget", () => {
    expect(
      safeParseInquirySubmission({ ...submissions[0], budget: "under_2000" }).success,
    ).toBe(false);
  });

  it("rejects manipulated choice values", () => {
    const submission = structuredClone(submissions[0]);
    submission.answers.goals = ["injected_value"];
    expect(safeParseInquirySubmission(submission).success).toBe(false);
  });

  it("requires a matching custom answer for Sonstiges", () => {
    const missing = structuredClone(submissions[0]);
    missing.answers.goals = ["other"];
    expect(safeParseInquirySubmission(missing).success).toBe(false);

    const complete = {
      ...missing,
      customAnswers: { new_website_goals: "Ein Mitgliederbereich" },
    };
    expect(safeParseInquirySubmission(complete).success).toBe(true);
  });

  it("rejects duplicate and contradictory multiple choices", () => {
    const duplicate = structuredClone(submissions[0]);
    duplicate.answers.requestedPages = ["home", "home"];
    expect(safeParseInquirySubmission(duplicate).success).toBe(false);

    const contradictory = structuredClone(submissions[0]);
    contradictory.answers.requestedFeatures = ["none", "booking"];
    expect(safeParseInquirySubmission(contradictory).success).toBe(false);
  });

  it("accepts only http/https website URLs", () => {
    const submission = structuredClone(submissions[1]);
    submission.answers.currentWebsite = "javascript:alert(1)";
    expect(safeParseInquirySubmission(submission).success).toBe(false);

    const malformed = structuredClone(submissions[1]);
    malformed.answers.currentWebsite = "not a url";
    expect(() => safeParseInquirySubmission(malformed)).not.toThrow();
    expect(safeParseInquirySubmission(malformed).success).toBe(false);
  });

  it("accepts an additional message only after an explicit yes", () => {
    expect(
      safeParseInquirySubmission({
        ...submissions[4],
        additionalChoice: "yes",
        additionalMessage: "Eine kurze Ergänzung",
      }).success,
    ).toBe(true);
    expect(
      safeParseInquirySubmission({
        ...submissions[4],
        additionalMessage: "Manipulierte Ergänzung",
      }).success,
    ).toBe(false);
  });

  it("requires a phone number when phone contact is preferred", () => {
    const submission = {
      ...submissions[4],
      contact: { ...submissions[4].contact, preferredContact: "phone" },
    };
    expect(safeParseInquirySubmission(submission).success).toBe(false);
  });
});
