import type { ProjectType, QuestionId } from "./types";

export const OTHER_VALUE = "other";

export type QuestionOption = {
  value: string;
  label: string;
  exclusive?: boolean;
};

export type QuestionDefinition = {
  id: QuestionId;
  prompt: string;
  type: "single" | "multiple" | "url" | "text";
  options?: QuestionOption[];
  optional?: boolean;
  allowOther?: boolean;
  otherMaxLength?: number;
  maxLength?: number;
  placeholder?: string;
};

export const PROJECT_TYPE_OPTIONS: Array<QuestionOption & { value: ProjectType }> = [
  { value: "new_website", label: "Neue Webseite erstellen" },
  { value: "website_redesign", label: "Bestehende Webseite überarbeiten" },
  { value: "digital_processes", label: "Digitale Abläufe vereinfachen" },
  { value: "custom_software", label: "Individuelle Software oder Anwendung" },
  { value: "not_sure", label: "Ich bin noch nicht sicher" },
];

const other: QuestionOption = { value: OTHER_VALUE, label: "Sonstiges" };

export const QUESTION_CATALOG: Record<QuestionId, QuestionDefinition> = {
  new_website_goals: {
    id: "new_website_goals",
    prompt: "Woran würden Sie merken, dass Ihre neue Webseite erfolgreich für Sie arbeitet?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "more_inquiries", label: "Mehr Anfragen gewinnen" },
      { value: "explain_services", label: "Leistungen verständlich präsentieren" },
      { value: "professional_presence", label: "Professioneller auftreten" },
      { value: "recruiting", label: "Neue Mitarbeiter ansprechen" },
      { value: "show_offers", label: "Produkte oder Angebote zeigen" },
      { value: "accessible_information", label: "Informationen leichter zugänglich machen" },
      other,
    ],
  },
  new_website_pages: {
    id: "new_website_pages",
    prompt: "Welche Bereiche möchten Sie Ihren Besuchern voraussichtlich anbieten?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "home", label: "Startseite" },
      { value: "services", label: "Leistungen" },
      { value: "about", label: "Über uns" },
      { value: "references", label: "Referenzen oder Projekte" },
      { value: "contact_form", label: "Kontaktformular" },
      { value: "jobs", label: "Stellenangebote" },
      { value: "news", label: "Blog oder Neuigkeiten" },
      { value: "location", label: "Standort oder Anfahrt" },
      { value: "not_sure", label: "Noch nicht sicher", exclusive: true },
      other,
    ],
  },
  new_website_features: {
    id: "new_website_features",
    prompt: "Gibt es Funktionen, die Ihre Webseite für Sie oder Ihre Kunden übernehmen soll?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "contact_requests", label: "Kontaktanfragen" },
      { value: "booking", label: "Terminbuchung" },
      { value: "gallery", label: "Galerie oder Referenzen" },
      { value: "downloads", label: "Dokumente oder Downloads bereitstellen" },
      { value: "multilingual", label: "Inhalte in mehreren Sprachen" },
      { value: "newsletter", label: "Newsletter" },
      { value: "customer_area", label: "Geschützter Bereich für Kunden" },
      { value: "none", label: "Keine besonderen Funktionen", exclusive: true },
      { value: "not_sure", label: "Noch nicht sicher", exclusive: true },
      other,
    ],
  },
  new_website_content_status: {
    id: "new_website_content_status",
    prompt: "Gibt es bereits Inhalte oder ein Erscheinungsbild?",
    type: "single",
    options: [
      { value: "content_available", label: "Texte und Bilder sind weitgehend vorhanden" },
      { value: "partly_available", label: "Teilweise vorhanden" },
      { value: "brand_available", label: "Es gibt bereits Logo und Farben" },
      { value: "nothing_available", label: "Noch nichts vorhanden" },
      { value: "not_sure", label: "Weiß ich noch nicht" },
    ],
  },
  redesign_improvements: {
    id: "redesign_improvements",
    prompt: "Was soll an Ihrer bestehenden Webseite besser werden?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "design", label: "Design und Außenwirkung" },
      { value: "mobile", label: "Mobile Darstellung" },
      { value: "content_structure", label: "Inhalte und Struktur" },
      { value: "performance", label: "Ladegeschwindigkeit" },
      { value: "seo", label: "Auffindbarkeit bei Google" },
      { value: "contact", label: "Kontaktmöglichkeiten" },
      { value: "features", label: "Funktionen" },
      { value: "maintenance", label: "Pflege und Aktualisierung" },
      other,
    ],
  },
  redesign_current_situation: {
    id: "redesign_current_situation",
    prompt: "Was funktioniert aus Ihrer Sicht aktuell noch nicht gut?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "outdated", label: "Wirkt veraltet" },
      { value: "mobile_confusing", label: "Ist auf dem Smartphone unübersichtlich" },
      { value: "hard_to_maintain", label: "Lässt sich schwer pflegen" },
      { value: "few_inquiries", label: "Bringt zu wenige Anfragen" },
      { value: "unclear_content", label: "Inhalte sind unklar" },
      { value: "technical_errors", label: "Technisch fehlerhaft" },
      { value: "slow", label: "Sehr langsam" },
      other,
    ],
  },
  redesign_current_url: {
    id: "redesign_current_url",
    prompt: "Wie lautet die Adresse Ihrer aktuellen Webseite?",
    type: "url",
    optional: true,
    maxLength: 500,
    placeholder: "https://beispiel.de",
  },
  redesign_scope: {
    id: "redesign_scope",
    prompt: "Wie weit möchten Sie bei der Überarbeitung gehen?",
    type: "single",
    options: [
      { value: "design_only", label: "Nur Design modernisieren" },
      { value: "structure_content", label: "Struktur und Inhalte überarbeiten" },
      { value: "technical_rebuild", label: "Technisch neu aufbauen" },
      { value: "incremental", label: "Bestehende Seite schrittweise verbessern" },
      { value: "not_sure", label: "Noch nicht sicher" },
    ],
  },
  process_area: {
    id: "process_area",
    prompt: "Welcher Ablauf kostet Sie heute besonders viel Zeit oder Aufwand?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "appointments", label: "Terminvereinbarung" },
      { value: "customer_requests", label: "Kundenanfragen" },
      { value: "quotes", label: "Angebotserstellung" },
      { value: "orders", label: "Auftragsverwaltung" },
      { value: "organization", label: "Interne Organisation" },
      { value: "documents", label: "Dokumente und Freigaben" },
      { value: "data_entry", label: "Datenerfassung" },
      { value: "recurring_tasks", label: "Wiederkehrende Aufgaben" },
      other,
    ],
  },
  process_current_workflow: {
    id: "process_current_workflow",
    prompt: "Wie bearbeiten Sie diesen Vorgang heute überwiegend?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "email", label: "Per E-Mail" },
      { value: "phone", label: "Telefonisch" },
      { value: "paper", label: "Mit Papier oder Formularen" },
      { value: "excel", label: "Über Excel" },
      { value: "multiple_programs", label: "Über mehrere Programme" },
      { value: "manual", label: "Überwiegend manuell" },
      { value: "unstructured", label: "Noch nicht klar strukturiert" },
      other,
    ],
  },
  process_outcomes: {
    id: "process_outcomes",
    prompt: "Was möchten Sie mit der neuen Lösung verbessern?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "less_time", label: "Weniger Zeitaufwand" },
      { value: "fewer_errors", label: "Weniger Fehler" },
      { value: "overview", label: "Bessere Übersicht" },
      { value: "faster_processing", label: "Schnellere Bearbeitung" },
      { value: "customer_contact", label: "Leichterer Kundenkontakt" },
      { value: "fewer_questions", label: "Weniger Rückfragen" },
      { value: "automation", label: "Automatisierte Abläufe" },
      other,
    ],
  },
  process_users: {
    id: "process_users",
    prompt: "Wer soll später mit der Lösung arbeiten?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "only_me", label: "Nur ich", exclusive: true },
      { value: "team", label: "Mein Team" },
      { value: "customers", label: "Kunden" },
      { value: "employees_customers", label: "Mitarbeiter und Kunden" },
      { value: "partners", label: "Externe Partner" },
      { value: "not_sure", label: "Noch nicht sicher", exclusive: true },
      other,
    ],
  },
  software_solution_type: {
    id: "software_solution_type",
    prompt: "Welche Form könnte die Lösung aus Ihrer Sicht haben?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "internal_web_app", label: "Interne Webanwendung" },
      { value: "customer_portal", label: "Kundenportal" },
      { value: "admin_interface", label: "Verwaltungsoberfläche" },
      { value: "booking_platform", label: "Buchungs- oder Anfrageplattform" },
      { value: "dashboard", label: "Dashboard" },
      { value: "automation_ui", label: "Automatisierung mit Benutzeroberfläche" },
      { value: "mobile", label: "Mobile Nutzung" },
      { value: "not_sure", label: "Noch nicht sicher", exclusive: true },
      other,
    ],
  },
  software_tasks: {
    id: "software_tasks",
    prompt: "Welche Aufgaben soll Ihnen die Anwendung abnehmen oder erleichtern?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "capture_data", label: "Daten erfassen" },
      { value: "manage_data", label: "Daten verwalten" },
      { value: "organize", label: "Termine oder Aufträge organisieren" },
      { value: "documents", label: "Dokumente bereitstellen" },
      { value: "status", label: "Status und Fortschritt anzeigen" },
      { value: "communication", label: "Kommunikation vereinfachen" },
      { value: "analytics", label: "Auswertungen darstellen" },
      { value: "automation", label: "Wiederkehrende Schritte automatisieren" },
      other,
    ],
  },
  software_access: {
    id: "software_access",
    prompt: "Wer soll die Anwendung später nutzen können?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "only_me", label: "Nur ich", exclusive: true },
      { value: "selected_employees", label: "Ausgewählte Mitarbeiter" },
      { value: "whole_team", label: "Das gesamte Team" },
      { value: "customers", label: "Kunden" },
      { value: "user_groups", label: "Verschiedene Benutzergruppen" },
      { value: "not_sure", label: "Noch nicht sicher", exclusive: true },
      other,
    ],
  },
  software_existing_relation: {
    id: "software_existing_relation",
    prompt: "Gibt es bereits ein System, das die neue Lösung ersetzen oder ergänzen soll?",
    type: "single",
    options: [
      { value: "replace", label: "Ja, soll ersetzt werden" },
      { value: "integrate", label: "Ja, soll angebunden oder ergänzt werden" },
      { value: "none", label: "Nein" },
      { value: "not_sure", label: "Noch nicht sicher" },
    ],
  },
  software_existing_system_name: {
    id: "software_existing_system_name",
    prompt: "Wie heißt das bestehende System?",
    type: "text",
    optional: true,
    maxLength: 120,
    placeholder: "Name des Systems (optional)",
  },
  unsure_improvements: {
    id: "unsure_improvements",
    prompt: "Was möchten Sie in Ihrem Unternehmen aktuell am liebsten verbessern?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "professional_presence", label: "Professioneller Außenauftritt" },
      { value: "more_inquiries", label: "Mehr Anfragen" },
      { value: "less_manual_work", label: "Weniger manueller Aufwand" },
      { value: "organization", label: "Bessere Organisation" },
      { value: "modern_customer_contact", label: "Moderner Kundenkontakt" },
      { value: "new_digital_feature", label: "Neue digitale Funktion" },
      { value: "improve_existing", label: "Vorhandene Lösung verbessern" },
      other,
    ],
  },
  unsure_challenges: {
    id: "unsure_challenges",
    prompt: "Wo spüren Sie diese Herausforderung im Alltag am stärksten?",
    type: "multiple",
    allowOther: true,
    otherMaxLength: 200,
    options: [
      { value: "website", label: "Webseite" },
      { value: "customer_communication", label: "Kundenkommunikation" },
      { value: "appointments", label: "Terminplanung" },
      { value: "internal_processes", label: "Interne Abläufe" },
      { value: "administration", label: "Verwaltung" },
      { value: "recurring_tasks", label: "Wiederkehrende Aufgaben" },
      { value: "overview", label: "Fehlende Übersicht" },
      { value: "not_clear", label: "Noch nicht klar", exclusive: true },
      other,
    ],
  },
  timeline: {
    id: "timeline",
    prompt: "Wann möchten Sie Ihr Vorhaben ungefähr angehen?",
    type: "single",
    options: [
      { value: "asap", label: "So bald wie möglich" },
      { value: "within_4_weeks", label: "Innerhalb der nächsten 4 Wochen" },
      { value: "one_to_three_months", label: "In 1 bis 3 Monaten" },
      { value: "later", label: "Später" },
      { value: "open", label: "Noch offen" },
    ],
  },
  project_stage: {
    id: "project_stage",
    prompt: "Wie konkret ist Ihr Vorhaben aktuell schon?",
    type: "single",
    options: [
      { value: "first_idea", label: "Erste Idee" },
      { value: "rough_requirements", label: "Anforderungen grob bekannt" },
      { value: "materials_available", label: "Inhalte oder Unterlagen vorhanden" },
      { value: "concrete_project", label: "Konkretes Projekt geplant" },
      { value: "implementation_started", label: "Bereits mit der Umsetzung begonnen" },
    ],
  },
  additional_choice: {
    id: "additional_choice",
    prompt: "Möchten Sie noch etwas ergänzen?",
    type: "single",
    options: [
      { value: "no", label: "Nein, die Angaben reichen zunächst" },
      { value: "yes", label: "Ja, ich möchte noch etwas ergänzen" },
    ],
  },
  additional_message: {
    id: "additional_message",
    prompt: "Was möchten Sie noch ergänzen?",
    type: "text",
    optional: true,
    maxLength: 1000,
    placeholder: "Ihre kurze Ergänzung",
  },
};

export function getQuestion(id: QuestionId): QuestionDefinition {
  return QUESTION_CATALOG[id];
}

export function getProjectTypeLabel(value: ProjectType): string {
  return PROJECT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getOptionLabel(questionId: QuestionId, value: string): string {
  return QUESTION_CATALOG[questionId].options?.find((option) => option.value === value)?.label ?? value;
}
