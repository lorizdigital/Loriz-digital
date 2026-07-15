"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChoiceQuestion } from "./ChoiceQuestion";
import {
  ContactDetailsStep,
  type InquiryContactDraft,
} from "./ContactDetailsStep";
import { InquirySummary, type InquirySummarySection } from "./InquirySummary";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "./TurnstileWidget";
import {
  PROJECT_TYPE_OPTIONS,
  QUESTION_CATALOG,
  getOptionLabel,
  getProjectTypeLabel,
} from "@/lib/inquiry/catalog";
import {
  applyChoiceSelection,
  getVisibleQuestionIds,
} from "@/lib/inquiry/flow";
import { buildInquirySubmission } from "@/lib/inquiry/normalize";
import { safeParseInquirySubmission } from "@/lib/inquiry/schema";
import type {
  InquiryDraft,
  ProjectType,
  QuestionId,
} from "@/lib/inquiry/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easeGlass } from "@/lib/motion";
import { LorizMark } from "@/components/icons/LorizMark";

type Stage = "project-type" | "questions" | "contact" | "summary" | "success";
type EditSection = "project" | "common" | "contact" | null;
type EditSnapshot = {
  draft: InquiryDraft;
  completedQuestionIds: QuestionId[];
  contact: InquiryContactDraft;
  privacyAccepted: boolean;
};

type ApiError = {
  ok?: false;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const EMPTY_CONTACT: InquiryContactDraft = {
  name: "",
  company: "",
  email: "",
  phone: "",
  preferredContact: "email",
};

const COMMON_QUESTION_IDS = new Set<QuestionId>([
  "timeline",
  "project_stage",
  "additional_choice",
  "additional_message",
]);

const PROJECT_TYPE_TRANSITIONS: Record<ProjectType, string> = {
  new_website:
    "Dann schauen wir gemeinsam, was Ihre neue Webseite erreichen und für Sie übernehmen soll.",
  website_redesign:
    "Dann sehen wir uns kurz an, wo Ihre bestehende Webseite heute noch nicht überzeugt.",
  digital_processes:
    "Dann schauen wir darauf, welcher Ablauf heute unnötig Zeit kostet oder kompliziert ist.",
  custom_software:
    "Dann grenzen wir gemeinsam ein, welche Aufgabe die Anwendung für Sie übernehmen soll.",
  not_sure:
    "Das ist völlig in Ordnung. Mit ein paar kurzen Fragen lässt sich meist schnell erkennen, welche Lösung sinnvoll ist.",
};

function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function PersonalInquiryChat() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<Stage>("project-type");
  const [draft, setDraft] = useState<InquiryDraft>({ answers: {}, customAnswers: {} });
  const [completedQuestionIds, setCompletedQuestionIds] = useState<QuestionId[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<QuestionId | null>(null);
  const [contact, setContact] = useState<InquiryContactDraft>(EMPTY_CONTACT);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [questionError, setQuestionError] = useState<string>();
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [startToken, setStartToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submissionError, setSubmissionError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileError, setTurnstileError] = useState<string>();
  const [requestId, setRequestId] = useState(() => newRequestId());
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);
  const currentPanelRef = useRef<HTMLDivElement>(null);
  const submissionErrorRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const hasInteractedRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const editSnapshotRef = useRef<EditSnapshot | null>(null);

  const fetchStartToken = useCallback(async () => {
    try {
      const response = await fetch("/api/project-inquiries", {
        method: "GET",
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return "";
      const result = (await response.json()) as { startToken?: string };
      const token = result.startToken ?? "";
      setStartToken(token);
      return token;
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void fetchStartToken(), 0);
    return () => window.clearTimeout(timeout);
  }, [fetchStartToken]);

  useEffect(() => {
    const panel = currentPanelRef.current;
    if (!panel || !hasInteractedRef.current) return;
    const frame = requestAnimationFrame(() => {
      panel.scrollIntoView({
        block: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      if (hasInteractedRef.current) panel.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentQuestionId, prefersReducedMotion, stage]);

  useEffect(() => {
    if (!submissionError) return;
    submissionErrorRef.current?.focus({ preventScroll: false });
  }, [submissionError]);

  const visibleQuestionIds = useMemo(() => getVisibleQuestionIds(draft), [draft]);
  const visibleQuestionSet = useMemo(() => new Set(visibleQuestionIds), [visibleQuestionIds]);
  const visibleCompletedIds = completedQuestionIds.filter((id) => visibleQuestionSet.has(id));
  const transcriptCompletedIds = visibleCompletedIds.filter((id) => id !== currentQuestionId);
  const recentCompletedIds = transcriptCompletedIds.slice(-4);
  const hiddenAnswerCount = Math.max(0, transcriptCompletedIds.length - recentCompletedIds.length);

  const cancelPendingTransition = useCallback(() => {
    if (transitionTimeoutRef.current === null) return;
    window.clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = null;
  }, []);

  const scheduleTransition = useCallback(
    (action: () => void) => {
      cancelPendingTransition();
      if (prefersReducedMotion) {
        action();
        return;
      }
      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null;
        action();
      }, 140);
    },
    [cancelPendingTransition, prefersReducedMotion],
  );

  useEffect(() => cancelPendingTransition, [cancelPendingTransition]);

  function branchQuestionIds(nextDraft = draft) {
    return getVisibleQuestionIds(nextDraft).filter((id) => !COMMON_QUESTION_IDS.has(id));
  }

  function chooseProjectType(projectType: ProjectType) {
    hasInteractedRef.current = true;
    const changingBranch = draft.projectType && draft.projectType !== projectType;
    const preservedAnswers = changingBranch
      ? Object.fromEntries(
          Object.entries(draft.answers).filter(([id]) => COMMON_QUESTION_IDS.has(id as QuestionId)),
        )
      : draft.answers;
    const nextDraft: InquiryDraft = {
      projectType,
      answers: preservedAnswers,
      customAnswers: changingBranch ? {} : draft.customAnswers,
    };

    setDraft(nextDraft);
    if (changingBranch) {
      setCompletedQuestionIds((current) => current.filter((id) => COMMON_QUESTION_IDS.has(id)));
    }
    setQuestionError(undefined);
    scheduleTransition(() => {
      setStage("questions");
      setCurrentQuestionId(branchQuestionIds(nextDraft)[0] ?? "timeline");
    });
  }

  function completeQuestion(id: QuestionId, nextDraft: InquiryDraft, advanceImmediately = false) {
    hasInteractedRef.current = true;
    setDraft(nextDraft);
    setQuestionError(undefined);
    setCompletedQuestionIds((current) => (current.includes(id) ? current : [...current, id]));

    const advance = () => {
      const visible = getVisibleQuestionIds(nextDraft);
      const currentIndex = visible.indexOf(id);
      const nextQuestion = visible[currentIndex + 1];

      if (editSection === "project") {
        if (!nextQuestion || COMMON_QUESTION_IDS.has(nextQuestion)) {
          setEditSection(null);
          editSnapshotRef.current = null;
          setCurrentQuestionId(null);
          setStage("summary");
          return;
        }
      }

      if (editSection === "common" && !nextQuestion) {
        setEditSection(null);
        editSnapshotRef.current = null;
        setCurrentQuestionId(null);
        setStage("summary");
        return;
      }

      if (nextQuestion) {
        setCurrentQuestionId(nextQuestion);
      } else {
        setCurrentQuestionId(null);
        setStage("contact");
      }
    };

    if (advanceImmediately || prefersReducedMotion) {
      cancelPendingTransition();
      advance();
    } else {
      scheduleTransition(advance);
    }
  }

  function selectChoice(value: string) {
    if (!currentQuestionId) return;
    const question = QUESTION_CATALOG[currentQuestionId];
    const currentAnswer = draft.answers[currentQuestionId];
    const currentValues = Array.isArray(currentAnswer)
      ? currentAnswer
      : typeof currentAnswer === "string" && currentAnswer
        ? [currentAnswer]
        : [];
    const selected = applyChoiceSelection(currentQuestionId, currentValues, value);
    const answer = question.type === "single" ? selected[0] : selected;
    const nextAnswers = { ...draft.answers, [currentQuestionId]: answer };
    if (currentQuestionId === "additional_choice" && answer === "no") {
      delete nextAnswers.additional_message;
    }
    if (
      currentQuestionId === "software_existing_relation" &&
      answer !== "replace" &&
      answer !== "integrate"
    ) {
      delete nextAnswers.software_existing_system_name;
    }

    const nextDraft: InquiryDraft = {
      ...draft,
      answers: nextAnswers,
      customAnswers:
        value === "other" && selected.includes("other")
          ? draft.customAnswers
          : selected.includes("other")
            ? draft.customAnswers
            : { ...draft.customAnswers, [currentQuestionId]: undefined },
    };
    setDraft(nextDraft);
    setQuestionError(undefined);

    if (question.type === "single") completeQuestion(currentQuestionId, nextDraft);
  }

  function updateOther(value: string) {
    if (!currentQuestionId) return;
    setDraft((current) => ({
      ...current,
      customAnswers: { ...current.customAnswers, [currentQuestionId]: value },
    }));
  }

  function continueMultiple() {
    if (!currentQuestionId) return;
    const selected = draft.answers[currentQuestionId];
    if (!Array.isArray(selected) || selected.length === 0) {
      setQuestionError("Bitte wählen Sie mindestens eine Antwort.");
      return;
    }
    if (selected.includes("other") && !draft.customAnswers[currentQuestionId]?.trim()) {
      setQuestionError("Bitte ergänzen Sie kurz die Auswahl Sonstiges.");
      return;
    }
    completeQuestion(currentQuestionId, draft, true);
  }

  function continueInput() {
    if (!currentQuestionId) return;
    const question = QUESTION_CATALOG[currentQuestionId];
    const raw = draft.answers[currentQuestionId];
    let value = typeof raw === "string" ? raw.trim() : "";

    if (question.type === "url" && value) {
      if (!/^https?:\/\//iu.test(value)) value = `https://${value}`;
      try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocol");
      } catch {
        setQuestionError("Bitte geben Sie eine vollständige Webadresse ein.");
        return;
      }
    }

    if (!question.optional && !value) {
      setQuestionError("Bitte ergänzen Sie eine kurze Antwort.");
      return;
    }

    const nextDraft: InquiryDraft = {
      ...draft,
      answers: { ...draft.answers, [currentQuestionId]: value },
    };
    completeQuestion(currentQuestionId, nextDraft, true);
  }

  function validateContact(): boolean {
    const errors: Record<string, string> = {};
    if (contact.name.trim().length < 2) errors.name = "Bitte geben Sie Ihren Namen ein.";
    if (!/^\S+@\S+\.\S+$/u.test(contact.email.trim())) {
      errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    }
    const phone = contact.phone.trim();
    if (phone && (!/^[+()\d\s./-]+$/u.test(phone) || phone.length < 5)) {
      errors.phone = "Bitte geben Sie eine gültige Telefonnummer ein.";
    } else if ((contact.preferredContact === "phone" || contact.preferredContact === "both") && !phone) {
      errors.phone = "Für diesen Kontaktweg wird eine Telefonnummer benötigt.";
    }
    if (!privacyAccepted) {
      errors.privacyAccepted = "Bitte bestätigen Sie die Kenntnisnahme der Datenschutzhinweise.";
    }
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function continueContact() {
    hasInteractedRef.current = true;
    if (!validateContact()) return;
    cancelPendingTransition();
    if (editSection === "contact") {
      setEditSection(null);
      editSnapshotRef.current = null;
    }
    setSubmissionError(undefined);
    setStage("summary");
  }

  function editSummarySection(sectionId: string) {
    hasInteractedRef.current = true;
    cancelPendingTransition();
    editSnapshotRef.current = {
      draft,
      completedQuestionIds,
      contact,
      privacyAccepted,
    };
    setSubmissionError(undefined);
    if (sectionId === "project") {
      setEditSection("project");
      setStage("project-type");
      setCurrentQuestionId(null);
      return;
    }
    if (sectionId === "common") {
      setEditSection("common");
      setStage("questions");
      setCurrentQuestionId("timeline");
      return;
    }
    setEditSection("contact");
    setStage("contact");
  }

  function goBack() {
    if (isSubmitting || (stage === "project-type" && !editSection) || stage === "success") return;
    hasInteractedRef.current = true;
    cancelPendingTransition();
    setShowRestartConfirmation(false);
    setQuestionError(undefined);
    setSubmissionError(undefined);

    if (editSection) {
      const snapshot = editSnapshotRef.current;
      if (snapshot) {
        setDraft(snapshot.draft);
        setCompletedQuestionIds(snapshot.completedQuestionIds);
        setContact(snapshot.contact);
        setPrivacyAccepted(snapshot.privacyAccepted);
      }
      editSnapshotRef.current = null;
      setEditSection(null);
      setCurrentQuestionId(null);
      setStage("summary");
      return;
    }

    if (stage === "summary") {
      setStage("contact");
      return;
    }

    if (stage === "contact") {
      const visible = getVisibleQuestionIds(draft);
      const previousQuestion = visible.at(-1);
      if (previousQuestion) {
        const targetIndex = visible.indexOf(previousQuestion);
        setCompletedQuestionIds((current) =>
          current.filter((id) => {
            const index = visible.indexOf(id);
            return index === -1 || index < targetIndex;
          }),
        );
        setStage("questions");
        setCurrentQuestionId(previousQuestion);
      } else {
        setStage("project-type");
      }
      return;
    }

    const visible = getVisibleQuestionIds(draft);
    const currentIndex = currentQuestionId ? visible.indexOf(currentQuestionId) : -1;
    if (currentIndex > 0) {
      const targetIndex = currentIndex - 1;
      setCompletedQuestionIds((current) =>
        current.filter((id) => {
          const index = visible.indexOf(id);
          return index === -1 || index < targetIndex;
        }),
      );
      setCurrentQuestionId(visible[targetIndex]);
    } else {
      setCurrentQuestionId(null);
      setStage("project-type");
    }
  }

  function formatAnswer(id: QuestionId): string[] {
    const value = draft.answers[id];
    const values = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
    return values.map((item) =>
      item === "other"
        ? `Sonstiges: ${draft.customAnswers[id] ?? ""}`
        : QUESTION_CATALOG[id].options
          ? getOptionLabel(id, item)
          : item,
    );
  }

  const summarySections: InquirySummarySection[] = (() => {
    const projectRows = branchQuestionIds()
      .map((id) => ({ label: QUESTION_CATALOG[id].prompt, value: formatAnswer(id) }))
      .filter((row) => row.value.length > 0 && row.value.some(Boolean));
    const commonRows = (["timeline", "project_stage", "additional_message"] as QuestionId[])
      .map((id) => ({ label: QUESTION_CATALOG[id].prompt, value: formatAnswer(id) }))
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
  })();

  async function submitInquiry() {
    if (isSubmitting) return;
    const submission = buildInquirySubmission(draft, contact, privacyAccepted);
    const parsed = safeParseInquirySubmission(submission);
    if (!submission || !parsed.success) {
      if (parsed && !parsed.success) {
        const errors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          if (issue.path[0] === "contact" && typeof issue.path[1] === "string") {
            errors[issue.path[1]] = issue.message;
          }
        }
        if (Object.keys(errors).length > 0) {
          setContactErrors(errors);
          setStage("contact");
        }
      }
      setSubmissionError("Bitte prüfen Sie Ihre Angaben. Mindestens eine Antwort ist noch unvollständig.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(undefined);

    try {
      const token = startToken || (await fetchStartToken());
      if (!token) throw new Error("Das Anfrageformular ist noch nicht vollständig konfiguriert.");
      const turnstileToken = await turnstileRef.current?.execute();
      if (!turnstileToken) throw new Error("Die Sicherheitsprüfung konnte nicht abgeschlossen werden.");

      const response = await fetch("/api/project-inquiries", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          submission: parsed.data,
          startToken: token,
          turnstileToken,
          honeypot,
          idempotencyKey: requestId,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiError & {
        ok?: true;
        requestId?: string;
      };

      if (!response.ok || !result.ok) {
        if (result.code === "start_token_expired") {
          setStartToken("");
          void fetchStartToken();
        }
        if (result.fieldErrors) {
          const errors: Record<string, string> = {};
          for (const [path, messages] of Object.entries(result.fieldErrors)) {
            const match = /^contact\.([^.]+)$/u.exec(path);
            if (match?.[1] && messages[0]) errors[match[1]] = messages[0];
          }
          if (Object.keys(errors).length > 0) {
            setContactErrors(errors);
            setStage("contact");
          }
        }
        throw new Error(result.message || "Ihre Anfrage konnte noch nicht gesendet werden.");
      }

      setStage("success");
    } catch (error) {
      turnstileRef.current?.reset();
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Ihre Anfrage konnte noch nicht gesendet werden. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetInquiry() {
    cancelPendingTransition();
    setStage("project-type");
    setDraft({ answers: {}, customAnswers: {} });
    setCompletedQuestionIds([]);
    setCurrentQuestionId(null);
    setContact(EMPTY_CONTACT);
    setPrivacyAccepted(false);
    setContactErrors({});
    setQuestionError(undefined);
    setEditSection(null);
    setSubmissionError(undefined);
    setHoneypot("");
    setTurnstileReady(false);
    setTurnstileError(undefined);
    setShowRestartConfirmation(false);
    setRequestId(newRequestId());
    editSnapshotRef.current = null;
    hasInteractedRef.current = true;
    setStartToken("");
    turnstileRef.current?.reset();
    void fetchStartToken();
  }

  const totalSteps = visibleQuestionIds.length + 3;
  const completedSteps =
    (draft.projectType ? 1 : 0) +
    visibleCompletedIds.length +
    (stage === "summary" || stage === "success" ? 1 : 0) +
    (stage === "success" ? 1 : 0);
  const currentStep = Math.min(totalSteps, completedSteps + (stage === "success" ? 0 : 1));
  const phaseIndex = stage === "project-type" ? 0 : stage === "questions" ? 1 : stage === "contact" ? 2 : 3;
  const phaseLabel =
    stage === "project-type"
      ? "Orientierung"
      : stage === "questions"
        ? "Ihr Vorhaben"
        : stage === "contact"
          ? "Kontakt"
            : stage === "summary"
              ? "Prüfen"
              : "Übermittelt";
  const stepLabel = stage === "project-type" ? "Kurzer Einstieg" : `Schritt ${currentStep} von ${totalSteps}`;
  const canGoBack = (stage !== "project-type" || Boolean(editSection)) && stage !== "success" && !isSubmitting;
  const canRestart =
    stage !== "success" &&
    !isSubmitting &&
    (stage !== "project-type" || Boolean(draft.projectType));

  const currentQuestion = currentQuestionId ? QUESTION_CATALOG[currentQuestionId] : null;
  const currentAnswer = currentQuestionId ? draft.answers[currentQuestionId] : undefined;
  const currentSelectedValues = Array.isArray(currentAnswer)
    ? currentAnswer
    : typeof currentAnswer === "string" && currentAnswer
      ? [currentAnswer]
      : [];
  const currentPanelLabel =
    currentQuestion?.prompt ??
    (stage === "project-type"
      ? "Wobei darf ich Sie unterstützen?"
      : stage === "contact"
        ? "Kontaktdaten"
        : stage === "summary"
          ? "Zusammenfassung prüfen"
          : stage === "success"
            ? "Anfrage erfolgreich übermittelt"
            : "Aktueller Schritt der Projektanfrage");

  return (
    <div className="bg-surface-muted/70 p-2 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-glass-md">
        <div className="border-b border-border/80 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
            <div>
              <p className="text-sm font-medium tracking-tight text-foreground">
                Erzählen Sie mir von Ihrem Projekt
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Ein paar kurze Fragen helfen mir, Ihr Vorhaben besser zu verstehen.
              </p>
            </div>
            <div className="flex items-center gap-3" aria-label={`Fortschritt: ${phaseLabel}, ${stepLabel}`}>
              <span className="text-right text-[0.68rem] leading-tight text-muted-foreground">
                <span className="block font-medium text-foreground/80">{phaseLabel}</span>
                <span className="tabular-nums">{stepLabel}</span>
              </span>
              <span className="flex items-center gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((phase) => (
                  <motion.span
                    key={phase}
                    animate={{
                      width: phase === phaseIndex ? 16 : 5,
                      opacity: phase <= phaseIndex ? 1 : 0.28,
                    }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: easeGlass }}
                    className={phase <= phaseIndex ? "h-[5px] rounded-full bg-clay" : "h-[5px] rounded-full bg-muted-foreground"}
                  />
                ))}
              </span>
            </div>
          </div>
          {canRestart && (
            <div className="mt-4 flex justify-end border-t border-border/70 pt-3.5">
              <button
                type="button"
                onClick={() => setShowRestartConfirmation((current) => !current)}
                aria-expanded={showRestartConfirmation}
                aria-controls="inquiry-restart-confirmation"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-medium text-muted-foreground transition-[background-color,color] hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
                Neu starten
              </button>
            </div>
          )}
          <AnimatePresence initial={false}>
            {showRestartConfirmation && canRestart && (
              <motion.div
                id="inquiry-restart-confirmation"
                initial={prefersReducedMotion ? false : { opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0, y: -4 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: easeGlass }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-xl border border-border bg-surface-muted/55 p-3.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Möchten Sie alle bisherigen Antworten verwerfen?
                  </p>
                  <div className="mt-3 flex items-center gap-2 sm:mt-0 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowRestartConfirmation(false)}
                      className="min-h-10 rounded-full px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={resetInquiry}
                      className="min-h-10 rounded-full bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glass-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted motion-reduce:hover:translate-y-0"
                    >
                      Neu starten
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 py-6 sm:px-6 sm:py-9">
          <div aria-label="Bisheriger Gesprächsverlauf" className="space-y-4">
            <AssistantMessage reducedMotion={prefersReducedMotion}>
              <span className="block font-medium">Schön, dass Sie da sind.</span>
              <span className="mt-1.5 block">
                Ich schaue mir jede Anfrage persönlich an. Damit ich Ihr Vorhaben besser
                einschätzen kann, stelle ich Ihnen zunächst ein paar kurze Fragen.
              </span>
            </AssistantMessage>
            <AssistantMessage reducedMotion={prefersReducedMotion}>Wobei darf ich Sie unterstützen?</AssistantMessage>
            {draft.projectType && (
              <>
                <UserMessage reducedMotion={prefersReducedMotion}>
                  {getProjectTypeLabel(draft.projectType)}
                </UserMessage>
                <AssistantMessage reducedMotion={prefersReducedMotion}>
                  {PROJECT_TYPE_TRANSITIONS[draft.projectType]}
                </AssistantMessage>
              </>
            )}
            {hiddenAnswerCount > 0 && (
              <p className="py-1 text-center text-xs text-muted-foreground">
                {hiddenAnswerCount} frühere Antworten erscheinen später vollständig in der Zusammenfassung.
              </p>
            )}
            {recentCompletedIds.map((id) => (
              <div key={id} className="space-y-3">
                <AssistantMessage reducedMotion={prefersReducedMotion}>{QUESTION_CATALOG[id].prompt}</AssistantMessage>
                <UserMessage reducedMotion={prefersReducedMotion}>{formatAnswer(id).join(", ") || "Übersprungen"}</UserMessage>
                {draft.projectType === "not_sure" && id === "unsure_challenges" && (
                  <AssistantMessage reducedMotion={prefersReducedMotion}>
                    Danke, damit kann ich bereits gut einschätzen, in welche Richtung eine sinnvolle
                    Lösung gehen könnte.
                  </AssistantMessage>
                )}
              </div>
            ))}
          </div>

          <motion.div
            ref={currentPanelRef}
            tabIndex={-1}
            role="region"
            aria-label={currentPanelLabel}
            key={`${stage}-${currentQuestionId ?? "panel"}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: easeGlass }}
            className="mt-8 scroll-mt-28 border-t border-border/80 pt-8 outline-none sm:mt-10 sm:scroll-mt-32 sm:pt-9"
          >
            {stage === "project-type" && (
              <ChoiceQuestion
                id="project-type"
                prompt="Wobei darf ich Sie unterstützen?"
                type="single"
                options={PROJECT_TYPE_OPTIONS}
                selectedValues={draft.projectType ? [draft.projectType] : []}
                onSelect={(value) => chooseProjectType(value as ProjectType)}
                reducedMotion={prefersReducedMotion}
                hidePromptVisually
              />
            )}

            {stage === "questions" && currentQuestion && currentQuestionId && (
              currentQuestion.type === "single" || currentQuestion.type === "multiple" ? (
                <ChoiceQuestion
                  id={currentQuestionId}
                  prompt={currentQuestion.prompt}
                  type={currentQuestion.type}
                  options={currentQuestion.options ?? []}
                  selectedValues={currentSelectedValues}
                  otherValue={draft.customAnswers[currentQuestionId]}
                  otherMaxLength={currentQuestion.otherMaxLength}
                  optional={currentQuestion.optional}
                  error={questionError}
                  onSelect={selectChoice}
                  onOtherChange={currentQuestion.allowOther ? updateOther : undefined}
                  onContinue={currentQuestion.type === "multiple" ? continueMultiple : undefined}
                  reducedMotion={prefersReducedMotion}
                />
              ) : (
                <InputQuestion
                  id={currentQuestionId}
                  prompt={currentQuestion.prompt}
                  type={currentQuestion.type}
                  value={typeof currentAnswer === "string" ? currentAnswer : ""}
                  placeholder={currentQuestion.placeholder}
                  maxLength={currentQuestion.maxLength ?? 200}
                  optional={currentQuestion.optional}
                  error={questionError}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      answers: { ...current.answers, [currentQuestionId]: value },
                    }))
                  }
                  onContinue={continueInput}
                />
              )
            )}

            {stage === "contact" && (
              <div>
                <AssistantMessage reducedMotion={prefersReducedMotion}>
                  <span className="block font-medium">
                    Perfekt. Ich habe jetzt einen guten ersten Eindruck von Ihrem Vorhaben.
                  </span>
                  <span className="mt-1.5 block">
                    Zum Schluss benötige ich nur noch Ihre Kontaktdaten, damit ich mich persönlich
                    bei Ihnen melden kann.
                  </span>
                </AssistantMessage>
                <div className="mt-8 border-t border-border/80 pt-8">
                  <ContactDetailsStep
                    value={contact}
                    privacyAccepted={privacyAccepted}
                    errors={contactErrors}
                    onChange={setContact}
                    onPrivacyChange={setPrivacyAccepted}
                    onContinue={continueContact}
                  />
                </div>
              </div>
            )}

            {stage === "summary" && (
              <div>
                <InquirySummary sections={summarySections} onEdit={editSummarySection} />
                <div className="mt-7">
                  <div className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="inquiry-website-confirm">Webseite bestätigen</label>
                    <input
                      id="inquiry-website-confirm"
                      name="website_confirm"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                    />
                  </div>
                  <TurnstileWidget
                    ref={turnstileRef}
                    onReadyChange={setTurnstileReady}
                    onErrorChange={setTurnstileError}
                  />
                  {turnstileError && (
                    <div
                      role="alert"
                      className="mb-5 rounded-[1.1rem] border border-red-700/25 bg-red-50 p-4 text-sm leading-relaxed text-red-800 dark:border-red-300/25 dark:bg-red-950/25 dark:text-red-200"
                    >
                      <p>{turnstileError} Ihre Eingaben bleiben erhalten.</p>
                      <button
                        type="button"
                        onClick={() => turnstileRef.current?.retry()}
                        className="mt-3 min-h-10 rounded-full border border-current/20 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-current/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/35"
                      >
                        Sicherheitsprüfung erneut laden
                      </button>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {isSubmitting && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: easeGlass }}
                        className="mb-5 flex items-center gap-4 rounded-[1.1rem] border border-clay/20 bg-accent-soft/70 p-4 sm:p-5"
                      >
                        <SendingGlyph reducedMotion={prefersReducedMotion} />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Ihre Anfrage wird übermittelt.
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Einen kleinen Moment – Ihre Angaben werden jetzt sicher an mich übertragen.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {submissionError && (
                    <div
                      ref={submissionErrorRef}
                      tabIndex={-1}
                      role="alert"
                      className="mb-5 rounded-[1.1rem] border border-red-700/25 bg-red-50 p-4 text-sm leading-relaxed text-red-800 outline-none dark:border-red-300/25 dark:bg-red-950/25 dark:text-red-200"
                    >
                      {submissionError} Ihre bisherigen Eingaben bleiben vollständig erhalten.
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isSubmitting || !turnstileReady}
                    onClick={() => void submitInquiry()}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow,opacity] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:hover:translate-y-0 sm:w-auto sm:px-7"
                  >
                    {isSubmitting
                      ? "Anfrage wird übermittelt"
                      : turnstileReady
                        ? "Projektanfrage senden"
                        : turnstileError
                          ? "Sicherheitsprüfung nicht verfügbar"
                          : "Sicherheitsprüfung wird geladen"}
                  </button>
                </div>
              </div>
            )}

            {stage === "success" && (
              <div className="py-4 sm:py-6">
                <SuccessGlyph reducedMotion={prefersReducedMotion} />
                <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Anfrage übermittelt</p>
                <h3 className="mt-3 max-w-xl text-2xl font-medium tracking-[-0.025em] text-foreground sm:text-3xl">
                  Vielen Dank – Ihre Anfrage ist angekommen.
                </h3>
                <p className="mt-3 max-w-xl text-[0.96rem] leading-relaxed text-muted-foreground">
                  Ich sehe mir Ihre Angaben persönlich an und melde mich zeitnah bei Ihnen.
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Eine kurze Eingangsbestätigung wurde an Ihre E-Mail-Adresse gesendet.
                </p>
                <button
                  type="button"
                  onClick={resetInquiry}
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-300 hover:border-clay/30 hover:bg-surface-muted/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 sm:w-auto"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  Neue Anfrage beginnen
                </button>
              </div>
            )}

            {canGoBack && (
              <div className="mt-7 border-t border-border/80 pt-5">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:border-clay/30 hover:bg-surface-muted/45 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:hover:translate-y-0"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                  Zurück
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AssistantMessage({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.34, ease: easeGlass }}
      className="flex items-start gap-2.5"
    >
      <span aria-hidden="true" className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-soft">
        <LorizMark className="h-4 w-4 text-foreground" />
      </span>
      <p className="max-w-[calc(100%_-_2.4rem)] break-words rounded-[1.1rem] border border-border/70 bg-surface-muted/65 px-4 py-3 text-sm leading-relaxed text-foreground shadow-soft [overflow-wrap:anywhere] sm:max-w-[85%]">
        <span className="sr-only">Loriz Digital: </span>
        {children}
      </p>
    </motion.div>
  );
}

function UserMessage({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.34, ease: easeGlass }}
      className="flex justify-end"
    >
      <p className="max-w-[92%] break-words rounded-[1.1rem] border border-clay/20 bg-accent-soft px-4 py-3 text-sm font-medium leading-relaxed text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] [overflow-wrap:anywhere] sm:max-w-[82%]">
        {children}
      </p>
    </motion.div>
  );
}

function SendingGlyph({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay/20 bg-surface">
      <motion.span
        animate={reducedMotion ? undefined : { opacity: [0.55, 1, 0.55], scale: [0.96, 1, 0.96] }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        className="flex items-center justify-center"
      >
        <LorizMark className="h-5 w-5 text-foreground" />
      </motion.span>
    </span>
  );
}

function SuccessGlyph({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, ease: easeGlass }}
      className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-clay/20 bg-accent-soft shadow-soft"
    >
      <motion.span
        initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.08, ease: easeGlass }}
        className="flex items-center justify-center"
      >
        <LorizMark className="h-7 w-7 text-foreground" />
      </motion.span>
    </motion.div>
  );
}

function InputQuestion({
  id,
  prompt,
  type,
  value,
  placeholder,
  maxLength,
  optional,
  error,
  onChange,
  onContinue,
}: {
  id: string;
  prompt: string;
  type: "url" | "text";
  value: string;
  placeholder?: string;
  maxLength: number;
  optional?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="max-w-2xl text-xl font-medium leading-[1.3] tracking-[-0.02em] text-foreground sm:text-2xl">
        {prompt}
      </label>
      {optional && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">Diese Angabe ist freiwillig.</p>}
      {maxLength > 300 ? (
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          rows={4}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="mt-5 w-full resize-y rounded-[1.1rem] border border-border bg-surface-muted/30 px-4 py-3.5 text-base leading-relaxed text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-muted-foreground/55 hover:border-clay/25 focus:border-clay/45 focus:bg-surface focus:ring-2 focus:ring-clay/15"
        />
      ) : (
        <input
          id={id}
          type={type === "url" ? "url" : "text"}
          inputMode={type === "url" ? "url" : "text"}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="mt-5 min-h-12 w-full rounded-[1.1rem] border border-border bg-surface-muted/30 px-4 py-3 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-muted-foreground/55 hover:border-clay/25 focus:border-clay/45 focus:bg-surface focus:ring-2 focus:ring-clay/15"
        />
      )}
      <div className="mt-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{optional && !value ? "Kann übersprungen werden" : ""}</span>
        <span className="tabular-nums">{value.length}/{maxLength}</span>
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:hover:translate-y-0 sm:w-auto"
      >
        {optional && !value ? "Überspringen" : "Weiter"}
        <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
