import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { TurnstileWidgetHandle } from "./TurnstileWidget";
import type { InquiryContactDraft } from "./ContactDetailsStep";
import type {
  InquiryApiError,
  InquiryEditSection,
  InquiryEditSnapshot,
  InquiryStage,
} from "./chatTypes";
import {
  buildInquirySummarySections,
  formatInquiryAnswer,
  getBranchQuestionIds,
  isCommonQuestion,
  validateInquiryContact,
} from "./inquiryChatModel";
import { QUESTION_CATALOG } from "@/lib/inquiry/catalog";
import { applyChoiceSelection, getVisibleQuestionIds } from "@/lib/inquiry/flow";
import { buildInquirySubmission } from "@/lib/inquiry/normalize";
import { safeParseInquirySubmission } from "@/lib/inquiry/schema";
import type { InquiryDraft, ProjectType, QuestionId } from "@/lib/inquiry/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const EMPTY_CONTACT: InquiryContactDraft = {
  name: "",
  company: "",
  email: "",
  phone: "",
  preferredContact: "email",
};

function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

type InquiryChatRefs = {
  chatViewportRef: RefObject<HTMLDivElement | null>;
  currentPanelRef: RefObject<HTMLDivElement | null>;
  submissionErrorRef: RefObject<HTMLDivElement | null>;
  turnstileRef: RefObject<TurnstileWidgetHandle | null>;
};

export function useInquiryChatController({
  chatViewportRef,
  currentPanelRef,
  submissionErrorRef,
  turnstileRef,
}: InquiryChatRefs) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<InquiryStage>("project-type");
  const [draft, setDraft] = useState<InquiryDraft>({ answers: {}, customAnswers: {} });
  const [completedQuestionIds, setCompletedQuestionIds] = useState<QuestionId[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<QuestionId | null>(null);
  const [contact, setContact] = useState<InquiryContactDraft>(EMPTY_CONTACT);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [questionError, setQuestionError] = useState<string>();
  const [editSection, setEditSection] = useState<InquiryEditSection>(null);
  const [startToken, setStartToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submissionError, setSubmissionError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileError, setTurnstileError] = useState<string>();
  const [requestId, setRequestId] = useState(() => newRequestId());
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);

  const hasInteractedRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const editSnapshotRef = useRef<InquiryEditSnapshot | null>(null);

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

  useLayoutEffect(() => {
    const viewport = chatViewportRef.current;
    const panel = currentPanelRef.current;
    if (!viewport || !panel || !hasInteractedRef.current) return;

    // Der Chat besitzt einen eigenen stabilen Scrollbereich. Dadurch bewegt
    // ein neuer Turn nicht mehr die gesamte Webseite. Die kleine Vorlaufzone
    // hält die neue Assistant-Blase oberhalb der Antwortoptionen sichtbar.
    viewport.scrollTo({
      top: Math.max(0, panel.offsetTop - 96),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    panel.focus({ preventScroll: true });
  }, [
    chatViewportRef,
    currentPanelRef,
    currentQuestionId,
    prefersReducedMotion,
    stage,
  ]);

  useEffect(() => {
    if (!submissionError) return;
    submissionErrorRef.current?.focus({ preventScroll: false });
  }, [submissionError, submissionErrorRef]);

  const visibleQuestionIds = useMemo(() => getVisibleQuestionIds(draft), [draft]);
  const visibleQuestionSet = useMemo(() => new Set(visibleQuestionIds), [visibleQuestionIds]);
  const visibleCompletedIds = completedQuestionIds.filter((id) => visibleQuestionSet.has(id));
  // Append-only: Abgeschlossene Turns bleiben im DOM. So wird beim naechsten
  // Schritt kein variabel hoher alter Nachrichtenblock oben entfernt.
  const transcriptQuestionIds = visibleCompletedIds;

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

  function chooseProjectType(projectType: ProjectType) {
    hasInteractedRef.current = true;
    const changingBranch = draft.projectType && draft.projectType !== projectType;
    const preservedAnswers = changingBranch
      ? Object.fromEntries(
          Object.entries(draft.answers).filter(([id]) =>
            isCommonQuestion(id as QuestionId),
          ),
        )
      : draft.answers;
    const nextDraft: InquiryDraft = {
      projectType,
      answers: preservedAnswers,
      customAnswers: changingBranch ? {} : draft.customAnswers,
    };

    setDraft(nextDraft);
    if (changingBranch) {
      setCompletedQuestionIds((current) =>
        current.filter(isCommonQuestion),
      );
    }
    setQuestionError(undefined);
    scheduleTransition(() => {
      setStage("questions");
      setCurrentQuestionId(getBranchQuestionIds(nextDraft)[0] ?? "timeline");
    });
  }

  function completeQuestion(
    id: QuestionId,
    nextDraft: InquiryDraft,
  ) {
    hasInteractedRef.current = true;
    setDraft(nextDraft);
    setQuestionError(undefined);
    setCompletedQuestionIds((current) =>
      current.includes(id) ? current : [...current, id],
    );

    const advance = () => {
      const visible = getVisibleQuestionIds(nextDraft);
      const currentIndex = visible.indexOf(id);
      const nextQuestion = visible[currentIndex + 1];

      if (editSection === "project") {
        if (!nextQuestion || isCommonQuestion(nextQuestion)) {
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

    if (prefersReducedMotion) {
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

  function updateCurrentAnswer(value: string) {
    if (!currentQuestionId) return;
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [currentQuestionId]: value },
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
    const errors = validateInquiryContact(contact, privacyAccepted);
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
    if (isSubmitting || (stage === "project-type" && !editSection) || stage === "success") {
      return;
    }
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

  const formatAnswer = useCallback(
    (id: QuestionId) => formatInquiryAnswer(draft, id),
    [draft],
  );

  const summarySections = useMemo(
    () => buildInquirySummarySections(draft, contact),
    [contact, draft],
  );

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
      setSubmissionError(
        "Bitte prüfen Sie Ihre Angaben. Mindestens eine Antwort ist noch unvollständig.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(undefined);

    try {
      const token = startToken || (await fetchStartToken());
      if (!token) {
        throw new Error("Das Anfrageformular ist noch nicht vollständig konfiguriert.");
      }
      const turnstileToken = await turnstileRef.current?.execute();
      if (!turnstileToken) {
        throw new Error("Die Sicherheitsprüfung konnte nicht abgeschlossen werden.");
      }

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
      const result = (await response.json().catch(() => ({}))) as InquiryApiError & {
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
  const phaseIndex =
    stage === "project-type" ? 0 : stage === "questions" ? 1 : stage === "contact" ? 2 : 3;
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
  const stepLabel =
    stage === "project-type" ? "Kurzer Einstieg" : `Schritt ${currentStep} von ${totalSteps}`;
  const canGoBack =
    (stage !== "project-type" || Boolean(editSection)) && stage !== "success" && !isSubmitting;
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

  return {
    canGoBack,
    canRestart,
    chooseProjectType,
    contact,
    contactErrors,
    continueContact,
    continueInput,
    continueMultiple,
    currentAnswer,
    currentPanelLabel,
    currentQuestion,
    currentQuestionId,
    currentSelectedValues,
    draft,
    editSummarySection,
    formatAnswer,
    goBack,
    honeypot,
    isSubmitting,
    phaseIndex,
    phaseLabel,
    prefersReducedMotion,
    privacyAccepted,
    questionError,
    resetInquiry,
    selectChoice,
    setContact,
    setHoneypot,
    setPrivacyAccepted,
    setShowRestartConfirmation,
    setTurnstileError,
    setTurnstileReady,
    showRestartConfirmation,
    stage,
    stepLabel,
    submissionError,
    submitInquiry,
    summarySections,
    turnstileError,
    turnstileReady,
    transcriptQuestionIds,
    updateCurrentAnswer,
    updateOther,
  };
}
