import { z } from "zod";
import { OTHER_VALUE, QUESTION_CATALOG } from "./catalog";
import { QUESTION_IDS, type InquirySubmission, type QuestionId } from "./types";

const shortText = z.string().trim().min(1).max(200);

function allowedValues(id: QuestionId): string[] {
  return QUESTION_CATALOG[id].options?.map((option) => option.value) ?? [];
}

function singleChoice(id: QuestionId) {
  const values = allowedValues(id);
  return z.string().refine((value) => values.includes(value), "Unbekannter Auswahlwert.");
}

function multipleChoice(id: QuestionId) {
  const values = allowedValues(id);
  const exclusive = new Set(
    QUESTION_CATALOG[id].options
      ?.filter((option) => option.exclusive)
      .map((option) => option.value) ?? [],
  );

  return z
    .array(z.string().refine((value) => values.includes(value), "Unbekannter Auswahlwert."))
    .min(1, "Bitte wählen Sie mindestens eine Antwort.")
    .max(values.length)
    .superRefine((selected, context) => {
      if (new Set(selected).size !== selected.length) {
        context.addIssue({ code: "custom", message: "Auswahlwerte dürfen nicht doppelt vorkommen." });
      }
      if (selected.length > 1 && selected.some((value) => exclusive.has(value))) {
        context.addIssue({ code: "custom", message: "Diese Auswahl kann nicht kombiniert werden." });
      }
    });
}

const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    company: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().max(254).email(),
    phone: z
      .string()
      .trim()
      .min(5)
      .max(30)
      .regex(/^[+()\d\s./-]+$/u, "Ungültige Telefonnummer.")
      .optional(),
    preferredContact: z.enum(["email", "phone", "both"]),
  })
  .strict()
  .superRefine((contact, context) => {
    if ((contact.preferredContact === "phone" || contact.preferredContact === "both") && !contact.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Für diesen Kontaktweg wird eine Telefonnummer benötigt.",
      });
    }
  });

const customAnswersSchema = z.partialRecord(z.enum(QUESTION_IDS), shortText);

const sharedFields = {
  timeline: singleChoice("timeline"),
  projectStage: singleChoice("project_stage"),
  additionalChoice: z.enum(["yes", "no"]),
  additionalMessage: z.string().trim().min(1).max(1000).optional(),
  customAnswers: customAnswersSchema,
  contact: contactSchema,
  privacyAccepted: z.literal(true),
};

const newWebsiteSchema = z
  .object({
    ...sharedFields,
    projectType: z.literal("new_website"),
    answers: z
      .object({
        goals: multipleChoice("new_website_goals"),
        requestedPages: multipleChoice("new_website_pages"),
        requestedFeatures: multipleChoice("new_website_features"),
        contentStatus: singleChoice("new_website_content_status"),
      })
      .strict(),
  })
  .strict();

const websiteRedesignSchema = z
  .object({
    ...sharedFields,
    projectType: z.literal("website_redesign"),
    answers: z
      .object({
        improvements: multipleChoice("redesign_improvements"),
        currentSituation: multipleChoice("redesign_current_situation"),
        currentWebsite: z
          .string()
          .trim()
          .max(500)
          .refine((value) => {
            try {
              return ["http:", "https:"].includes(new URL(value).protocol);
            } catch {
              return false;
            }
          }, "Bitte geben Sie eine gültige HTTP- oder HTTPS-Adresse ein.")
          .optional(),
        scope: singleChoice("redesign_scope"),
      })
      .strict(),
  })
  .strict();

const digitalProcessesSchema = z
  .object({
    ...sharedFields,
    projectType: z.literal("digital_processes"),
    answers: z
      .object({
        area: multipleChoice("process_area"),
        currentWorkflow: multipleChoice("process_current_workflow"),
        desiredOutcomes: multipleChoice("process_outcomes"),
        users: multipleChoice("process_users"),
      })
      .strict(),
  })
  .strict();

const customSoftwareSchema = z
  .object({
    ...sharedFields,
    projectType: z.literal("custom_software"),
    answers: z
      .object({
        solutionType: multipleChoice("software_solution_type"),
        tasks: multipleChoice("software_tasks"),
        access: multipleChoice("software_access"),
        existingSystemRelation: singleChoice("software_existing_relation"),
        existingSystemName: z.string().trim().min(1).max(120).optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine((submission, context) => {
    if (
      submission.answers.existingSystemName &&
      !["replace", "integrate"].includes(submission.answers.existingSystemRelation)
    ) {
      context.addIssue({
        code: "custom",
        path: ["answers", "existingSystemName"],
        message: "Ein Systemname ist für diese Auswahl nicht vorgesehen.",
      });
    }
  });

const notSureSchema = z
  .object({
    ...sharedFields,
    projectType: z.literal("not_sure"),
    answers: z
      .object({
        improvements: multipleChoice("unsure_improvements"),
        challenges: multipleChoice("unsure_challenges"),
      })
      .strict(),
  })
  .strict();

const baseInquirySubmissionSchema = z.discriminatedUnion("projectType", [
  newWebsiteSchema,
  websiteRedesignSchema,
  digitalProcessesSchema,
  customSoftwareSchema,
  notSureSchema,
]);

function selectedValuesForQuestion(
  submission: InquirySubmission,
  questionId: QuestionId,
): string[] {
  let mappings: Partial<Record<QuestionId, unknown>>;
  switch (submission.projectType) {
    case "new_website":
      mappings = {
        new_website_goals: submission.answers.goals,
        new_website_pages: submission.answers.requestedPages,
        new_website_features: submission.answers.requestedFeatures,
        new_website_content_status: submission.answers.contentStatus,
      };
      break;
    case "website_redesign":
      mappings = {
        redesign_improvements: submission.answers.improvements,
        redesign_current_situation: submission.answers.currentSituation,
        redesign_current_url: submission.answers.currentWebsite,
        redesign_scope: submission.answers.scope,
      };
      break;
    case "digital_processes":
      mappings = {
        process_area: submission.answers.area,
        process_current_workflow: submission.answers.currentWorkflow,
        process_outcomes: submission.answers.desiredOutcomes,
        process_users: submission.answers.users,
      };
      break;
    case "custom_software":
      mappings = {
        software_solution_type: submission.answers.solutionType,
        software_tasks: submission.answers.tasks,
        software_access: submission.answers.access,
        software_existing_relation: submission.answers.existingSystemRelation,
        software_existing_system_name: submission.answers.existingSystemName,
      };
      break;
    case "not_sure":
      mappings = {
        unsure_improvements: submission.answers.improvements,
        unsure_challenges: submission.answers.challenges,
      };
      break;
  }
  const value = mappings[questionId];
  return Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
}

export const inquirySubmissionSchema = baseInquirySubmissionSchema.superRefine(
  (submission, context) => {
    if (submission.additionalChoice === "yes" && !submission.additionalMessage) {
      context.addIssue({
        code: "custom",
        path: ["additionalMessage"],
        message: "Bitte ergänzen Sie Ihre zusätzliche Angabe.",
      });
    }
    if (submission.additionalChoice === "no" && submission.additionalMessage) {
      context.addIssue({
        code: "custom",
        path: ["additionalMessage"],
        message: "Für diese Auswahl ist keine zusätzliche Angabe vorgesehen.",
      });
    }

    for (const [questionId, answer] of Object.entries(submission.customAnswers)) {
      const id = questionId as QuestionId;
      if (!QUESTION_CATALOG[id]?.allowOther || !selectedValuesForQuestion(submission, id).includes(OTHER_VALUE)) {
        context.addIssue({
          code: "custom",
          path: ["customAnswers", questionId],
          message: "Für diese Frage ist keine eigene Ergänzung vorgesehen.",
        });
      }
      if (!answer?.trim()) {
        context.addIssue({
          code: "custom",
          path: ["customAnswers", questionId],
          message: "Bitte ergänzen Sie Ihre Auswahl.",
        });
      }
    }

    for (const id of QUESTION_IDS) {
      if (
        QUESTION_CATALOG[id].allowOther &&
        selectedValuesForQuestion(submission, id).includes(OTHER_VALUE) &&
        !submission.customAnswers[id]
      ) {
        context.addIssue({
          code: "custom",
          path: ["customAnswers", id],
          message: "Bitte ergänzen Sie die Auswahl Sonstiges.",
        });
      }
    }
  },
);

export function parseInquirySubmission(input: unknown): InquirySubmission {
  return inquirySubmissionSchema.parse(input) as InquirySubmission;
}

export function safeParseInquirySubmission(input: unknown) {
  return inquirySubmissionSchema.safeParse(input);
}
