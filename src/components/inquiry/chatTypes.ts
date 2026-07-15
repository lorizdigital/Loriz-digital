import type { InquiryContactDraft } from "./ContactDetailsStep";
import type { InquiryDraft, QuestionId } from "@/lib/inquiry/types";

export type InquiryStage = "project-type" | "questions" | "contact" | "summary" | "success";
export type InquiryEditSection = "project" | "common" | "contact" | null;

export type InquiryEditSnapshot = {
  draft: InquiryDraft;
  completedQuestionIds: QuestionId[];
  contact: InquiryContactDraft;
  privacyAccepted: boolean;
};

export type InquiryApiError = {
  ok?: false;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
