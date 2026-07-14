export const PROJECT_TYPES = [
  "new_website",
  "website_redesign",
  "digital_processes",
  "custom_software",
  "not_sure",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const QUESTION_IDS = [
  "new_website_goals",
  "new_website_pages",
  "new_website_features",
  "new_website_content_status",
  "redesign_improvements",
  "redesign_current_situation",
  "redesign_current_url",
  "redesign_scope",
  "process_area",
  "process_current_workflow",
  "process_outcomes",
  "process_users",
  "software_solution_type",
  "software_tasks",
  "software_access",
  "software_existing_relation",
  "software_existing_system_name",
  "unsure_improvements",
  "unsure_challenges",
  "timeline",
  "project_stage",
  "additional_choice",
  "additional_message",
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];
export type DraftAnswer = string | string[];

export type InquiryDraft = {
  projectType?: ProjectType;
  answers: Partial<Record<QuestionId, DraftAnswer>>;
  customAnswers: Partial<Record<QuestionId, string>>;
};

export type ContactDetails = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  preferredContact: "email" | "phone" | "both";
};

type SharedSubmission = {
  timeline: string;
  projectStage: string;
  additionalChoice: "yes" | "no";
  additionalMessage?: string;
  customAnswers: Partial<Record<QuestionId, string>>;
  contact: ContactDetails;
  privacyAccepted: true;
};

export type NewWebsiteSubmission = SharedSubmission & {
  projectType: "new_website";
  answers: {
    goals: string[];
    requestedPages: string[];
    requestedFeatures: string[];
    contentStatus: string;
  };
};

export type WebsiteRedesignSubmission = SharedSubmission & {
  projectType: "website_redesign";
  answers: {
    improvements: string[];
    currentSituation: string[];
    currentWebsite?: string;
    scope: string;
  };
};

export type DigitalProcessesSubmission = SharedSubmission & {
  projectType: "digital_processes";
  answers: {
    area: string[];
    currentWorkflow: string[];
    desiredOutcomes: string[];
    users: string[];
  };
};

export type CustomSoftwareSubmission = SharedSubmission & {
  projectType: "custom_software";
  answers: {
    solutionType: string[];
    tasks: string[];
    access: string[];
    existingSystemRelation: string;
    existingSystemName?: string;
  };
};

export type NotSureSubmission = SharedSubmission & {
  projectType: "not_sure";
  answers: {
    improvements: string[];
    challenges: string[];
  };
};

export type InquirySubmission =
  | NewWebsiteSubmission
  | WebsiteRedesignSubmission
  | DigitalProcessesSubmission
  | CustomSoftwareSubmission
  | NotSureSubmission;
