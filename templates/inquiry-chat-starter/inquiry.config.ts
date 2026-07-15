import { defineInquiryKit } from "../../src/lib/inquiry-kit";

// Neutrales Beispiel: Texte, Themen und Auswahlwerte pro Kundenprojekt ersetzen.
export const inquiryConfig = defineInquiryKit({
  id: "customer-contact",
  endpoint: "/api/inquiries",
  privacyUrl: "/datenschutz",
  branches: [
    {
      value: "service",
      label: "Interesse an einer Leistung",
      transition: "Gerne klären wir kurz, worum es geht.",
      questionIds: ["service_topics", "service_details"],
    },
    {
      value: "general",
      label: "Allgemeine Anfrage",
      questionIds: ["general_message"],
    },
  ],
  commonQuestionIds: ["timeline"],
  questions: [
    {
      id: "service_topics",
      prompt: "Welche Themen interessieren Sie?",
      type: "multiple",
      allowOther: true,
      options: [
        { value: "topic_a", label: "Thema A" },
        { value: "topic_b", label: "Thema B" },
        { value: "not_sure", label: "Noch nicht sicher", exclusive: true },
        { value: "other", label: "Sonstiges" },
      ],
    },
    {
      id: "service_details",
      prompt: "Was sollten wir zu Ihrem Anliegen wissen?",
      type: "text",
      optional: true,
      maxLength: 1000,
    },
    {
      id: "general_message",
      prompt: "Wie können wir Ihnen helfen?",
      type: "text",
      maxLength: 1000,
    },
    {
      id: "timeline",
      prompt: "Wann möchten Sie starten?",
      type: "single",
      options: [
        { value: "soon", label: "Möglichst bald" },
        { value: "one_to_three_months", label: "In 1 bis 3 Monaten" },
        { value: "flexible", label: "Zeitlich flexibel" },
      ],
    },
  ],
  copy: {
    welcome: "Schön, dass Sie da sind. Mit ein paar kurzen Fragen können wir Ihr Anliegen besser einordnen.",
    branchPrompt: "Wobei dürfen wir Sie unterstützen?",
    contactPrompt: "Wie dürfen wir Sie erreichen?",
    privacyLabel: "Ich habe die Datenschutzhinweise zur Bearbeitung meiner Anfrage zur Kenntnis genommen.",
    submitLabel: "Anfrage senden",
    successTitle: "Vielen Dank",
    successMessage: "Ihre Anfrage ist eingegangen. Wir melden uns zeitnah bei Ihnen.",
  },
});
