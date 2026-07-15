import type {
  InquiryAnswer,
  InquiryDraft,
  InquiryKitConfig,
  InquiryPayload,
  InquiryQuestion,
  InquiryValidationResult,
  InquiryContact,
} from "./types";

export function defineInquiryKit(config: InquiryKitConfig): InquiryKitConfig {
  const branchValues = new Set<string>();
  const questionIds = new Set<string>();

  if (!config.id.trim()) throw new Error("The inquiry kit needs an id.");
  if (!config.endpoint.startsWith("/")) throw new Error("The endpoint must be a relative path.");
  if (!config.privacyUrl.startsWith("/")) throw new Error("The privacy URL must be a relative path.");

  for (const branch of config.branches) {
    if (branchValues.has(branch.value)) throw new Error(`Duplicate branch: ${branch.value}`);
    branchValues.add(branch.value);
  }
  for (const question of config.questions) {
    if (questionIds.has(question.id)) throw new Error(`Duplicate question: ${question.id}`);
    questionIds.add(question.id);
    if (
      (question.type === "single" || question.type === "multiple") &&
      !question.options?.length
    ) {
      throw new Error(`Choice question ${question.id} needs options.`);
    }
  }
  for (const branch of config.branches) {
    for (const id of branch.questionIds) {
      if (!questionIds.has(id)) throw new Error(`Unknown question ${id} in branch ${branch.value}.`);
    }
  }
  for (const id of config.commonQuestionIds ?? []) {
    if (!questionIds.has(id)) throw new Error(`Unknown common question: ${id}`);
  }

  return config;
}

export function createInquiryDraft(): InquiryDraft {
  return { answers: {}, customAnswers: {} };
}

export function getQuestion(config: InquiryKitConfig, id: string): InquiryQuestion {
  const question = config.questions.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`Unknown inquiry question: ${id}`);
  return question;
}

export function getVisibleQuestionIds(
  config: InquiryKitConfig,
  draft: InquiryDraft,
): string[] {
  if (!draft.branch) return [];
  const branch = config.branches.find((candidate) => candidate.value === draft.branch);
  if (!branch) return [];

  return [...branch.questionIds, ...(config.commonQuestionIds ?? [])].filter((id) => {
    const condition = getQuestion(config, id).visibleWhen;
    if (!condition) return true;
    const answer = draft.answers[condition.questionId];
    if (condition.equals !== undefined) return answer === condition.equals;
    if (condition.includes !== undefined) {
      return Array.isArray(answer) && answer.includes(condition.includes);
    }
    return false;
  });
}

export function applyInquiryChoice(
  question: InquiryQuestion,
  currentAnswer: InquiryAnswer | undefined,
  nextValue: string,
): InquiryAnswer {
  if (!question.options?.some((option) => option.value === nextValue)) {
    throw new Error(`Unknown option ${nextValue} for ${question.id}.`);
  }
  if (question.type === "single") return nextValue;
  if (question.type !== "multiple") throw new Error(`${question.id} is not a choice question.`);

  const current = Array.isArray(currentAnswer) ? currentAnswer : [];
  if (current.includes(nextValue)) return current.filter((value) => value !== nextValue);
  const selectedOption = question.options.find((option) => option.value === nextValue);
  if (selectedOption?.exclusive) return [nextValue];
  const exclusiveValues = new Set(
    question.options.filter((option) => option.exclusive).map((option) => option.value),
  );
  return [...current.filter((value) => !exclusiveValues.has(value)), nextValue];
}

export function validateInquiryAnswer(
  question: InquiryQuestion,
  answer: InquiryAnswer | undefined,
  customAnswer?: string,
): InquiryValidationResult {
  if (question.optional && (answer === undefined || answer === "")) return { valid: true };
  if (question.type === "multiple" && (!Array.isArray(answer) || answer.length === 0)) {
    return { valid: false, message: "Bitte wählen Sie mindestens eine Antwort." };
  }
  if (question.type !== "multiple" && (typeof answer !== "string" || !answer.trim())) {
    return { valid: false, message: "Bitte ergänzen Sie eine Antwort." };
  }

  const values: string[] = Array.isArray(answer)
    ? answer
    : typeof answer === "string"
      ? [answer]
      : [];
  if (question.type === "single" || question.type === "multiple") {
    const allowed = new Set(question.options?.map((option) => option.value) ?? []);
    if (values.some((value) => !allowed.has(value))) {
      return { valid: false, message: "Die Auswahl ist nicht gültig." };
    }
    const exclusive = new Set(
      question.options?.filter((option) => option.exclusive).map((option) => option.value) ?? [],
    );
    if (values.length > 1 && values.some((value) => exclusive.has(value))) {
      return { valid: false, message: "Diese Auswahl kann nicht kombiniert werden." };
    }
  }

  const otherValue = question.otherValue ?? "other";
  if (question.allowOther && values.includes(otherValue) && !customAnswer?.trim()) {
    return { valid: false, message: "Bitte ergänzen Sie die Auswahl Sonstiges." };
  }
  if (question.maxLength && typeof answer === "string" && answer.length > question.maxLength) {
    return { valid: false, message: `Bitte verwenden Sie höchstens ${question.maxLength} Zeichen.` };
  }
  if (question.type === "url" && typeof answer === "string" && answer) {
    try {
      const url = new URL(/^https?:\/\//iu.test(answer) ? answer : `https://${answer}`);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocol");
    } catch {
      return { valid: false, message: "Bitte geben Sie eine gültige Webadresse ein." };
    }
  }
  return { valid: true };
}

export function buildInquiryPayload(input: {
  config: InquiryKitConfig;
  draft: InquiryDraft;
  contact: InquiryContact;
  privacyAccepted: boolean;
}): InquiryPayload | null {
  const { config, draft, contact, privacyAccepted } = input;
  if (!draft.branch || !privacyAccepted) return null;
  if (!config.branches.some((branch) => branch.value === draft.branch)) return null;

  const answers: Record<string, InquiryAnswer> = {};
  const customAnswers: Record<string, string> = {};
  for (const id of getVisibleQuestionIds(config, draft)) {
    const answer = draft.answers[id];
    const validation = validateInquiryAnswer(getQuestion(config, id), answer, draft.customAnswers[id]);
    if (!validation.valid) return null;
    if (answer !== undefined && answer !== "") answers[id] = answer;
    const custom = draft.customAnswers[id]?.trim();
    if (custom) customAnswers[id] = custom;
  }

  if (!contact.name.trim() || !contact.email.trim()) return null;
  if ((contact.preferredContact === "phone" || contact.preferredContact === "both") && !contact.phone?.trim()) {
    return null;
  }

  return {
    formId: config.id,
    branch: draft.branch,
    answers,
    customAnswers,
    contact: {
      name: contact.name.trim(),
      ...(contact.company?.trim() ? { company: contact.company.trim() } : {}),
      email: contact.email.trim().toLowerCase(),
      ...(contact.phone?.trim() ? { phone: contact.phone.trim() } : {}),
      preferredContact: contact.preferredContact,
    },
    privacyAccepted: true,
  };
}
