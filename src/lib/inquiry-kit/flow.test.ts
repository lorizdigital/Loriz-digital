import { describe, expect, it } from "vitest";
import {
  applyInquiryChoice,
  buildInquiryPayload,
  createInquiryDraft,
  defineInquiryKit,
  getQuestion,
  getVisibleQuestionIds,
} from "./index";

const config = defineInquiryKit({
  id: "example-contact",
  endpoint: "/api/inquiries",
  privacyUrl: "/privacy",
  branches: [{ value: "consulting", label: "Beratung", questionIds: ["topics", "details"] }],
  commonQuestionIds: ["timeline"],
  questions: [
    {
      id: "topics",
      prompt: "Welche Themen sind wichtig?",
      type: "multiple",
      allowOther: true,
      options: [
        { value: "strategy", label: "Strategie" },
        { value: "none", label: "Noch unklar", exclusive: true },
        { value: "other", label: "Sonstiges" },
      ],
    },
    {
      id: "details",
      prompt: "Bitte beschreiben Sie das Thema.",
      type: "text",
      visibleWhen: { questionId: "topics", includes: "other" },
    },
    {
      id: "timeline",
      prompt: "Wann soll es losgehen?",
      type: "single",
      options: [{ value: "flexible", label: "Flexibel" }],
    },
  ],
  copy: {
    welcome: "Willkommen.",
    branchPrompt: "Wobei können wir helfen?",
    contactPrompt: "Wie dürfen wir Sie erreichen?",
    privacyLabel: "Ich habe die Datenschutzhinweise gelesen.",
    submitLabel: "Anfrage senden",
    successTitle: "Vielen Dank",
    successMessage: "Ihre Anfrage ist eingegangen.",
  },
});

describe("inquiry kit", () => {
  it("resolves conditional questions and exclusive choices", () => {
    const draft = createInquiryDraft();
    draft.branch = "consulting";
    expect(getVisibleQuestionIds(config, draft)).toEqual(["topics", "timeline"]);

    const topics = getQuestion(config, "topics");
    draft.answers.topics = applyInquiryChoice(topics, undefined, "strategy");
    draft.answers.topics = applyInquiryChoice(topics, draft.answers.topics, "other");
    expect(getVisibleQuestionIds(config, draft)).toEqual(["topics", "details", "timeline"]);
    expect(applyInquiryChoice(topics, draft.answers.topics, "none")).toEqual(["none"]);
  });

  it("builds a neutral validated payload", () => {
    const draft = createInquiryDraft();
    draft.branch = "consulting";
    draft.answers.topics = ["strategy"];
    draft.answers.timeline = "flexible";

    const payload = buildInquiryPayload({
      config,
      draft,
      privacyAccepted: true,
      contact: {
        name: "Max Mustermann",
        email: "MAX@EXAMPLE.DE",
        preferredContact: "email",
      },
    });

    expect(payload).toMatchObject({
      formId: "example-contact",
      branch: "consulting",
      contact: { email: "max@example.de" },
      privacyAccepted: true,
    });
  });
});
