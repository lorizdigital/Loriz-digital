import { answerHasOther } from "./flow";
import type {
  ContactDetails,
  InquiryDraft,
  InquirySubmission,
  QuestionId,
} from "./types";

export function normalizeSingleLine(value: string): string {
  return value.normalize("NFC").replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim();
}

export function normalizeMultiline(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\r\n?/gu, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/gu, " ").trimEnd())
    .join("\n")
    .trim();
}

function stringAnswer(draft: InquiryDraft, id: QuestionId): string {
  const value = draft.answers[id];
  return typeof value === "string" ? normalizeSingleLine(value) : "";
}

function arrayAnswer(draft: InquiryDraft, id: QuestionId): string[] {
  const value = draft.answers[id];
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeSingleLine).filter(Boolean))];
}

function normalizedCustomAnswers(draft: InquiryDraft) {
  return Object.fromEntries(
    Object.entries(draft.customAnswers)
      .filter(([id, value]) =>
        Boolean(value && answerHasOther(draft.answers[id as QuestionId])),
      )
      .map(([id, value]) => [id, normalizeSingleLine(value ?? "")])
      .filter(([, value]) => Boolean(value)),
  );
}

export function buildInquirySubmission(
  draft: InquiryDraft,
  contact: ContactDetails,
  privacyAccepted: boolean,
): InquirySubmission | null {
  if (!draft.projectType || !privacyAccepted) return null;
  const rawAdditionalMessage = draft.answers.additional_message;
  const additionalChoice = stringAnswer(draft, "additional_choice") as "yes" | "no";

  const shared = {
    timeline: stringAnswer(draft, "timeline"),
    projectStage: stringAnswer(draft, "project_stage"),
    additionalChoice,
    ...(additionalChoice === "yes" && typeof rawAdditionalMessage === "string" && rawAdditionalMessage.trim()
      ? { additionalMessage: normalizeMultiline(rawAdditionalMessage) }
      : {}),
    customAnswers: normalizedCustomAnswers(draft),
    contact: {
      name: normalizeSingleLine(contact.name),
      ...(contact.company ? { company: normalizeSingleLine(contact.company) } : {}),
      email: normalizeSingleLine(contact.email).toLowerCase(),
      ...(contact.phone ? { phone: normalizeSingleLine(contact.phone) } : {}),
      preferredContact: contact.preferredContact,
    },
    privacyAccepted: true as const,
  };

  switch (draft.projectType) {
    case "new_website":
      return {
        ...shared,
        projectType: "new_website",
        answers: {
          goals: arrayAnswer(draft, "new_website_goals"),
          requestedPages: arrayAnswer(draft, "new_website_pages"),
          requestedFeatures: arrayAnswer(draft, "new_website_features"),
          contentStatus: stringAnswer(draft, "new_website_content_status"),
        },
      };
    case "website_redesign":
      return {
        ...shared,
        projectType: "website_redesign",
        answers: {
          improvements: arrayAnswer(draft, "redesign_improvements"),
          currentSituation: arrayAnswer(draft, "redesign_current_situation"),
          ...(stringAnswer(draft, "redesign_current_url")
            ? { currentWebsite: stringAnswer(draft, "redesign_current_url") }
            : {}),
          scope: stringAnswer(draft, "redesign_scope"),
        },
      };
    case "digital_processes":
      return {
        ...shared,
        projectType: "digital_processes",
        answers: {
          area: arrayAnswer(draft, "process_area"),
          currentWorkflow: arrayAnswer(draft, "process_current_workflow"),
          desiredOutcomes: arrayAnswer(draft, "process_outcomes"),
          users: arrayAnswer(draft, "process_users"),
        },
      };
    case "custom_software":
      return {
        ...shared,
        projectType: "custom_software",
        answers: {
          solutionType: arrayAnswer(draft, "software_solution_type"),
          tasks: arrayAnswer(draft, "software_tasks"),
          access: arrayAnswer(draft, "software_access"),
          existingSystemRelation: stringAnswer(draft, "software_existing_relation"),
          ...(stringAnswer(draft, "software_existing_system_name")
            ? { existingSystemName: stringAnswer(draft, "software_existing_system_name") }
            : {}),
        },
      };
    case "not_sure":
      return {
        ...shared,
        projectType: "not_sure",
        answers: {
          improvements: arrayAnswer(draft, "unsure_improvements"),
          challenges: arrayAnswer(draft, "unsure_challenges"),
        },
      };
  }
}
