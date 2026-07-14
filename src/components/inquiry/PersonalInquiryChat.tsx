"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, LoaderCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
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

type Stage = "project-type" | "questions" | "contact" | "summary" | "success";
type EditSection = "project" | "common" | "contact" | null;

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
  const [requestId, setRequestId] = useState(() => newRequestId());
  const currentPanelRef = useRef<HTMLDivElement>(null);
  const submissionErrorRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const hasInteractedRef = useRef(false);

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
  const recentCompletedIds = completedQuestionIds.slice(-4);
  const hiddenAnswerCount = Math.max(0, completedQuestionIds.length - recentCompletedIds.length);

  function delay(action: () => void) {
    window.setTimeout(action, prefersReducedMotion ? 0 : 320);
  }

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
    delay(() => {
      setStage("questions");
      setCurrentQuestionId(branchQuestionIds(nextDraft)[0] ?? "timeline");
    });
  }

  function completeQuestion(id: QuestionId, nextDraft: InquiryDraft) {
    hasInteractedRef.current = true;
    setDraft(nextDraft);
    setQuestionError(undefined);
    setCompletedQuestionIds((current) => (current.includes(id) ? current : [...current, id]));

    delay(() => {
      const visible = getVisibleQuestionIds(nextDraft);
      const currentIndex = visible.indexOf(id);
      const nextQuestion = visible[currentIndex + 1];

      if (editSection === "project") {
        if (!nextQuestion || COMMON_QUESTION_IDS.has(nextQuestion)) {
          setEditSection(null);
          setCurrentQuestionId(null);
          setStage("summary");
          return;
        }
      }

      if (editSection === "common" && !nextQuestion) {
        setEditSection(null);
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
    });
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
    completeQuestion(currentQuestionId, draft);
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
    completeQuestion(currentQuestionId, nextDraft);
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
    if (editSection === "contact") setEditSection(null);
    setSubmissionError(undefined);
    setStage("summary");
  }

  function editSummarySection(sectionId: string) {
    hasInteractedRef.current = true;
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

  const summarySections = useMemo<InquirySummarySection[]>(() => {
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
    // The memo intentionally follows all draft/contact changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact, draft]);

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
    setStage("project-type");
    setDraft({ answers: {}, customAnswers: {} });
    setCompletedQuestionIds([]);
    setCurrentQuestionId(null);
    setContact(EMPTY_CONTACT);
    setPrivacyAccepted(false);
    setContactErrors({});
    setSubmissionError(undefined);
    setRequestId(newRequestId());
    hasInteractedRef.current = true;
    setStartToken("");
    turnstileRef.current?.reset();
    void fetchStartToken();
  }

  const progress = stage === "success"
    ? 100
    : Math.min(
        96,
        Math.round(
          ((completedQuestionIds.length + (draft.projectType ? 1 : 0) + (stage === "summary" ? 1 : 0)) /
            Math.max(1, visibleQuestionIds.length + 3)) *
            100,
        ),
      );

  const currentQuestion = currentQuestionId ? QUESTION_CATALOG[currentQuestionId] : null;
  const currentAnswer = currentQuestionId ? draft.answers[currentQuestionId] : undefined;
  const currentSelectedValues = Array.isArray(currentAnswer)
    ? currentAnswer
    : typeof currentAnswer === "string" && currentAnswer
      ? [currentAnswer]
      : [];

  return (
    <div className="bg-surface-muted/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-glass-md">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Persönliche Projektanfrage</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Geführt, unverbindlich und direkt bei Loriz Digital</p>
            </div>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-[#7aa184]" aria-hidden="true" />
              Anfrage
            </span>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-clay transition-[width] duration-500 ease-[var(--ease-glass)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="px-5 py-6 sm:px-6 sm:py-8">
          <div aria-label="Bisheriger Gesprächsverlauf" className="space-y-3">
            <AssistantMessage>Wobei darf ich Sie unterstützen?</AssistantMessage>
            {draft.projectType && <UserMessage>{getProjectTypeLabel(draft.projectType)}</UserMessage>}
            {hiddenAnswerCount > 0 && (
              <p className="py-1 text-center text-xs text-muted-foreground">
                {hiddenAnswerCount} frühere Antworten erscheinen später vollständig in der Zusammenfassung.
              </p>
            )}
            {recentCompletedIds.map((id) => (
              <div key={id} className="space-y-2">
                <AssistantMessage>{QUESTION_CATALOG[id].prompt}</AssistantMessage>
                <UserMessage>{formatAnswer(id).join(", ") || "Übersprungen"}</UserMessage>
                {draft.projectType === "not_sure" && id === "unsure_challenges" && (
                  <AssistantMessage>
                    Auf Basis Ihrer Auswahl können wir gemeinsam klären, welche Lösung sinnvoll ist.
                  </AssistantMessage>
                )}
              </div>
            ))}
          </div>

          <motion.div
            ref={currentPanelRef}
            tabIndex={-1}
            aria-label="Aktueller Schritt der Projektanfrage"
            key={`${stage}-${currentQuestionId ?? "panel"}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 border-t border-border pt-7 outline-none"
          >
            {stage === "project-type" && (
              <ChoiceQuestion
                id="project-type"
                prompt="Wobei darf ich Sie unterstützen?"
                type="single"
                options={PROJECT_TYPE_OPTIONS}
                selectedValues={draft.projectType ? [draft.projectType] : []}
                onSelect={(value) => chooseProjectType(value as ProjectType)}
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
              <ContactDetailsStep
                value={contact}
                privacyAccepted={privacyAccepted}
                errors={contactErrors}
                onChange={setContact}
                onPrivacyChange={setPrivacyAccepted}
                onContinue={continueContact}
              />
            )}

            {stage === "summary" && (
              <div>
                <InquirySummary sections={summarySections} onEdit={editSummarySection} />
                <div className="mt-6">
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
                  <TurnstileWidget ref={turnstileRef} onReadyChange={setTurnstileReady} />
                  {submissionError && (
                    <div
                      ref={submissionErrorRef}
                      tabIndex={-1}
                      role="alert"
                      className="mb-4 rounded-xl border border-red-700/25 bg-red-50 p-4 text-sm leading-relaxed text-red-800 outline-none dark:border-red-300/25 dark:bg-red-950/25 dark:text-red-200"
                    >
                      {submissionError} Ihre bisherigen Eingaben bleiben vollständig erhalten.
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isSubmitting || !turnstileReady}
                    onClick={() => void submitInquiry()}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
                    {isSubmitting
                      ? "Anfrage wird gesendet"
                      : turnstileReady
                        ? "Projektanfrage senden"
                        : "Sicherheitsprüfung wird geladen"}
                  </button>
                </div>
              </div>
            )}

            {stage === "success" && (
              <div className="py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-clay">
                  <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-xl font-medium tracking-tight text-foreground">
                  Vielen Dank für Ihre Anfrage.
                </h3>
                <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                  Ich sehe mir Ihre Angaben persönlich an und melde mich zeitnah bei Ihnen.
                </p>
                <button
                  type="button"
                  onClick={resetInquiry}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-clay/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  Neue Anfrage beginnen
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2.5">
      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a25] to-accent text-[0.58rem] font-medium text-accent-foreground">
        LL
      </span>
      <p className="max-w-[85%] break-words rounded-2xl rounded-bl-sm bg-surface-muted px-4 py-2.5 text-sm leading-relaxed text-foreground shadow-soft [overflow-wrap:anywhere]">
        <span className="sr-only">Loriz Digital: </span>
        {children}
      </p>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] break-words rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm leading-relaxed text-accent-foreground [overflow-wrap:anywhere]">
        {children}
      </p>
    </div>
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
      <label htmlFor={id} className="text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
        {prompt}
      </label>
      {optional && <p className="mt-2 text-sm text-muted-foreground">Diese Angabe ist freiwillig.</p>}
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
          className="mt-4 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-base leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/55 focus:border-clay/45 focus:ring-2 focus:ring-accent/20"
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
          className="mt-4 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/55 focus:border-clay/45 focus:ring-2 focus:ring-accent/20"
        />
      )}
      <div className="mt-1.5 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{optional && !value ? "Kann übersprungen werden" : ""}</span>
        <span>{value.length}/{maxLength}</span>
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button
        type="button"
        onClick={onContinue}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        {optional && !value ? "Überspringen" : "Weiter"}
      </button>
    </div>
  );
}
