import { describe, expect, it } from "vitest";
import { applyChoiceSelection, getVisibleQuestionIds } from "./flow";
import { buildInquirySubmission, normalizeMultiline, normalizeSingleLine } from "./normalize";
import type { InquiryDraft } from "./types";

describe("inquiry flow", () => {
  it("shows conditional software and additional fields only when relevant", () => {
    const draft: InquiryDraft = {
      projectType: "custom_software",
      answers: {},
      customAnswers: {},
    };
    expect(getVisibleQuestionIds(draft)).not.toContain("software_existing_system_name");
    expect(getVisibleQuestionIds(draft)).not.toContain("additional_message");

    draft.answers.software_existing_relation = "integrate";
    draft.answers.additional_choice = "yes";
    expect(getVisibleQuestionIds(draft)).toContain("software_existing_system_name");
    expect(getVisibleQuestionIds(draft)).toContain("additional_message");
  });

  it("keeps exclusive options separate", () => {
    expect(
      applyChoiceSelection("new_website_features", ["booking"], "none"),
    ).toEqual(["none"]);
    expect(
      applyChoiceSelection("new_website_features", ["none"], "booking"),
    ).toEqual(["booking"]);
  });

  it("normalizes single- and multiline input", () => {
    expect(normalizeSingleLine("  Müller\u0000   GmbH  ")).toBe("Müller GmbH");
    expect(normalizeMultiline("Erste Zeile  \r\nZweite\tZeile")).toBe(
      "Erste Zeile\nZweite Zeile",
    );
  });

  it("builds a final payload without a budget field", () => {
    const draft: InquiryDraft = {
      projectType: "not_sure",
      answers: {
        unsure_improvements: ["organization"],
        unsure_challenges: ["overview"],
        timeline: "open",
        project_stage: "first_idea",
        additional_choice: "no",
      },
      customAnswers: {},
    };
    const submission = buildInquirySubmission(
      draft,
      {
        name: "Anna Beispiel",
        email: "ANNA@EXAMPLE.COM",
        preferredContact: "email",
      },
      true,
    );

    expect(submission).not.toBeNull();
    expect(submission).not.toHaveProperty("budget");
    expect(submission?.contact.email).toBe("anna@example.com");
  });

  it("preserves line breaks in an optional additional message", () => {
    const submission = buildInquirySubmission(
      {
        projectType: "not_sure",
        answers: {
          unsure_improvements: ["organization"],
          unsure_challenges: ["overview"],
          timeline: "open",
          project_stage: "first_idea",
          additional_choice: "yes",
          additional_message: "Erste Zeile\nZweite Zeile",
        },
        customAnswers: {},
      },
      { name: "Anna Beispiel", email: "anna@example.com", preferredContact: "email" },
      true,
    );

    expect(submission?.additionalMessage).toBe("Erste Zeile\nZweite Zeile");
  });
});
