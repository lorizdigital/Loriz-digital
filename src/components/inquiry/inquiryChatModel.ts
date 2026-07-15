import type { InquiryContactDraft } from "./ContactDetailsStep";
import type { InquirySummarySection } from "./InquirySummary";
import { QUESTION_CATALOG, getOptionLabel, getProjectTypeLabel } from "@/lib/inquiry/catalog";
import { getVisibleQuestionIds } from "@/lib/inquiry/flow";
import type { InquiryDraft, QuestionId } from "@/lib/inquiry/types";

const COMMON_QUESTION_IDS = new Set<QuestionId>([
  "timeline",
  "project_stage",
  "additional_choice",
  "additional_message",
]);

export function isCommonQuestion(id: QuestionId): boolean {
  return COMMON_QUESTION_IDS.has(id);
}

export function getBranchQuestionIds(draft: InquiryDraft): QuestionId[] {
  return getVisibleQuestionIds(draft).filter((id) => !isCommonQuestion(id));
}

export function formatInquiryAnswer(draft: InquiryDraft, id: QuestionId): string[] {
  const value = draft.answers[id];
  const values = Array.isArray(value)
    ? value
    : typeof value === "string" && value
      ? [value]
      : [];

  return values.map((item) =>
    item === "other"
      ? `Sonstiges: ${draft.customAnswers[id] ?? ""}`
      : QUESTION_CATALOG[id].options
        ? getOptionLabel(id, item)
        : item,
  );
}

export function buildInquirySummarySections(
  draft: InquiryDraft,
  contact: InquiryContactDraft,
): InquirySummarySection[] {
  const projectRows = getBranchQuestionIds(draft)
    .map((id) => ({ label: QUESTION_CATALOG[id].prompt, value: formatInquiryAnswer(draft, id) }))
    .filter((row) => row.value.length > 0 && row.value.some(Boolean));
  const commonRows = (["timeline", "project_stage", "additional_message"] as QuestionId[])
    .map((id) => ({ label: QUESTION_CATALOG[id].prompt, value: formatInquiryAnswer(draft, id) }))
    .filter((row) => row.value.length > 0 && row.value.some(Boolean));

  return [
    {
      id: "project",
      title: "Projekt",
      rows: [
        {
          label: "Projektart",
          value: draft.projectType ? getProjectTypeLabel(draft.projectType) : "–",
        },
        ...projectRows,
      ],
    },
    { id: "common", title: "Zeitrahmen und Stand", rows: commonRows },
    {
      id: "contact",
      title: "Kontakt",
      rows: [
        { label: "Name", value: contact.name },
        ...(contact.company ? [{ label: "Unternehmen", value: contact.company }] : []),
        { label: "E-Mail", value: contact.email },
        ...(contact.phone ? [{ label: "Telefon", value: contact.phone }] : []),
        {
          label: "Kontaktweg",
          value:
            contact.preferredContact === "email"
              ? "E-Mail"
              : contact.preferredContact === "phone"
                ? "Telefon"
                : "Beides möglich",
        },
      ],
    },
  ];
}

export function validateInquiryContact(
  contact: InquiryContactDraft,
  privacyAccepted: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (contact.name.trim().length < 2) errors.name = "Bitte geben Sie Ihren Namen ein.";
  if (!/^\S+@\S+\.\S+$/u.test(contact.email.trim())) {
    errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
  }
  const phone = contact.phone.trim();
  if (phone && (!/^[+()\d\s./-]+$/u.test(phone) || phone.length < 5)) {
    errors.phone = "Bitte geben Sie eine gültige Telefonnummer ein.";
  } else if (
    (contact.preferredContact === "phone" || contact.preferredContact === "both") &&
    !phone
  ) {
    errors.phone = "Für diesen Kontaktweg wird eine Telefonnummer benötigt.";
  }
  if (!privacyAccepted) {
    errors.privacyAccepted = "Bitte bestätigen Sie die Kenntnisnahme der Datenschutzhinweise.";
  }
  return errors;
}
