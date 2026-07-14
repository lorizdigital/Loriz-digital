import { OTHER_VALUE, QUESTION_CATALOG } from "./catalog";
import type { InquiryDraft, ProjectType, QuestionId } from "./types";

const BRANCH_FLOWS: Record<ProjectType, QuestionId[]> = {
  new_website: [
    "new_website_goals",
    "new_website_pages",
    "new_website_features",
    "new_website_content_status",
  ],
  website_redesign: [
    "redesign_improvements",
    "redesign_current_situation",
    "redesign_current_url",
    "redesign_scope",
  ],
  digital_processes: [
    "process_area",
    "process_current_workflow",
    "process_outcomes",
    "process_users",
  ],
  custom_software: [
    "software_solution_type",
    "software_tasks",
    "software_access",
    "software_existing_relation",
    "software_existing_system_name",
  ],
  not_sure: ["unsure_improvements", "unsure_challenges"],
};

const COMMON_FLOW: QuestionId[] = [
  "timeline",
  "project_stage",
  "additional_choice",
  "additional_message",
];

export function getFlowQuestionIds(projectType: ProjectType): QuestionId[] {
  return [...BRANCH_FLOWS[projectType], ...COMMON_FLOW];
}

export function getVisibleQuestionIds(draft: InquiryDraft): QuestionId[] {
  if (!draft.projectType) return [];

  return getFlowQuestionIds(draft.projectType).filter((questionId) => {
    if (questionId === "software_existing_system_name") {
      const relation = draft.answers.software_existing_relation;
      return relation === "replace" || relation === "integrate";
    }
    if (questionId === "additional_message") {
      return draft.answers.additional_choice === "yes";
    }
    return true;
  });
}

export function isExclusiveOption(questionId: QuestionId, value: string): boolean {
  return Boolean(
    QUESTION_CATALOG[questionId].options?.find((option) => option.value === value)?.exclusive,
  );
}

export function applyChoiceSelection(
  questionId: QuestionId,
  currentValues: string[],
  nextValue: string,
): string[] {
  const question = QUESTION_CATALOG[questionId];
  if (question.type === "single") return [nextValue];

  if (currentValues.includes(nextValue)) {
    return currentValues.filter((value) => value !== nextValue);
  }

  if (isExclusiveOption(questionId, nextValue)) return [nextValue];

  const withoutExclusive = currentValues.filter(
    (value) => !isExclusiveOption(questionId, value),
  );
  return [...withoutExclusive, nextValue];
}

export function answerHasOther(value: string | string[] | undefined): boolean {
  return Array.isArray(value) ? value.includes(OTHER_VALUE) : value === OTHER_VALUE;
}
