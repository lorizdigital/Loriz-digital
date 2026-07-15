export type InquiryAnswer = string | string[];

export type InquiryOption = {
  value: string;
  label: string;
  exclusive?: boolean;
};

export type InquiryQuestion = {
  id: string;
  prompt: string;
  type: "single" | "multiple" | "text" | "url";
  options?: InquiryOption[];
  optional?: boolean;
  allowOther?: boolean;
  otherValue?: string;
  maxLength?: number;
  visibleWhen?: {
    questionId: string;
    equals?: string;
    includes?: string;
  };
};

export type InquiryBranch = {
  value: string;
  label: string;
  transition?: string;
  questionIds: string[];
};

export type InquiryCopy = {
  welcome: string;
  branchPrompt: string;
  contactPrompt: string;
  privacyLabel: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
};

export type InquiryKitConfig = {
  id: string;
  endpoint: string;
  privacyUrl: string;
  branches: InquiryBranch[];
  commonQuestionIds?: string[];
  questions: InquiryQuestion[];
  copy: InquiryCopy;
};

export type InquiryDraft = {
  branch?: string;
  answers: Record<string, InquiryAnswer | undefined>;
  customAnswers: Record<string, string | undefined>;
};

export type InquiryContact = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  preferredContact: "email" | "phone" | "both";
};

export type InquiryPayload = {
  formId: string;
  branch: string;
  answers: Record<string, InquiryAnswer>;
  customAnswers: Record<string, string>;
  contact: InquiryContact;
  privacyAccepted: true;
};

export type InquiryValidationResult =
  | { valid: true }
  | { valid: false; message: string };
