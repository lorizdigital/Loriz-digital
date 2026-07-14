import {
  getOptionLabel,
  getProjectTypeLabel,
  getQuestion,
  OTHER_VALUE,
} from "../catalog";
import type { InquirySubmission, QuestionId } from "../types";
import type { InquiryEmailData, InquiryEmailSection } from "./emailFormat";

function questionLabel(id: QuestionId): string {
  return getQuestion(id).prompt.replace(/\?$/u, "");
}

function choice(
  questionId: QuestionId,
  value: string,
  customAnswers: InquirySubmission["customAnswers"],
): string {
  if (value === OTHER_VALUE) {
    const custom = customAnswers[questionId];
    return custom ? `Sonstiges: ${custom}` : "Sonstiges";
  }
  return getOptionLabel(questionId, value);
}

function choices(
  questionId: QuestionId,
  values: string[],
  customAnswers: InquirySubmission["customAnswers"],
): string[] {
  return values.map((value) => choice(questionId, value, customAnswers));
}

function item(labelId: QuestionId, value: string | string[]) {
  return { label: questionLabel(labelId), value };
}

function branchSection(submission: InquirySubmission): InquiryEmailSection {
  const custom = submission.customAnswers;

  switch (submission.projectType) {
    case "new_website":
      return {
        heading: "Neue Webseite",
        items: [
          item(
            "new_website_goals",
            choices("new_website_goals", submission.answers.goals, custom),
          ),
          item(
            "new_website_pages",
            choices("new_website_pages", submission.answers.requestedPages, custom),
          ),
          item(
            "new_website_features",
            choices(
              "new_website_features",
              submission.answers.requestedFeatures,
              custom,
            ),
          ),
          item(
            "new_website_content_status",
            choice(
              "new_website_content_status",
              submission.answers.contentStatus,
              custom,
            ),
          ),
        ],
      };
    case "website_redesign":
      return {
        heading: "Bestehende Webseite",
        items: [
          item(
            "redesign_improvements",
            choices("redesign_improvements", submission.answers.improvements, custom),
          ),
          item(
            "redesign_current_situation",
            choices(
              "redesign_current_situation",
              submission.answers.currentSituation,
              custom,
            ),
          ),
          item("redesign_current_url", submission.answers.currentWebsite ?? ""),
          item(
            "redesign_scope",
            choice("redesign_scope", submission.answers.scope, custom),
          ),
        ],
      };
    case "digital_processes":
      return {
        heading: "Digitale Abläufe",
        items: [
          item(
            "process_area",
            choices("process_area", submission.answers.area, custom),
          ),
          item(
            "process_current_workflow",
            choices(
              "process_current_workflow",
              submission.answers.currentWorkflow,
              custom,
            ),
          ),
          item(
            "process_outcomes",
            choices("process_outcomes", submission.answers.desiredOutcomes, custom),
          ),
          item(
            "process_users",
            choices("process_users", submission.answers.users, custom),
          ),
        ],
      };
    case "custom_software":
      return {
        heading: "Individuelle Software",
        items: [
          item(
            "software_solution_type",
            choices(
              "software_solution_type",
              submission.answers.solutionType,
              custom,
            ),
          ),
          item(
            "software_tasks",
            choices("software_tasks", submission.answers.tasks, custom),
          ),
          item(
            "software_access",
            choices("software_access", submission.answers.access, custom),
          ),
          item(
            "software_existing_relation",
            choice(
              "software_existing_relation",
              submission.answers.existingSystemRelation,
              custom,
            ),
          ),
          item(
            "software_existing_system_name",
            submission.answers.existingSystemName ?? "",
          ),
        ],
      };
    case "not_sure":
      return {
        heading: "Orientierung",
        items: [
          item(
            "unsure_improvements",
            choices("unsure_improvements", submission.answers.improvements, custom),
          ),
          item(
            "unsure_challenges",
            choices("unsure_challenges", submission.answers.challenges, custom),
          ),
        ],
      };
  }
}

export function presentInquiryForEmail(
  submission: InquirySubmission,
): InquiryEmailData {
  const sections: InquiryEmailSection[] = [
    branchSection(submission),
    {
      heading: "Projektstand",
      items: [
        item("timeline", getOptionLabel("timeline", submission.timeline)),
        item(
          "project_stage",
          getOptionLabel("project_stage", submission.projectStage),
        ),
      ],
    },
  ];

  if (submission.additionalMessage) {
    sections.push({
      heading: "Zusätzliche Angaben",
      items: [item("additional_message", submission.additionalMessage)],
    });
  }

  const contactLabel = {
    email: "E-Mail",
    phone: "Telefon",
    both: "E-Mail oder Telefon",
  }[submission.contact.preferredContact];

  return {
    projectType: getProjectTypeLabel(submission.projectType),
    contact: { ...submission.contact, preferredContact: contactLabel },
    sections,
  };
}
