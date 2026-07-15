"use client";

import { useRef } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { ContactDetailsStep } from "./ContactDetailsStep";
import { InquiryChatHeader } from "./InquiryChatHeader";
import {
  AssistantMessage,
  SendingGlyph,
  SuccessGlyph,
  UserMessage,
} from "./InquiryMessages";
import { InquirySummary } from "./InquirySummary";
import { InputQuestion } from "./InputQuestion";
import { TurnstileWidget, type TurnstileWidgetHandle } from "./TurnstileWidget";
import { useInquiryChatController } from "./useInquiryChatController";
import { PROJECT_TYPE_OPTIONS, getProjectTypeLabel } from "@/lib/inquiry/catalog";
import type { ProjectType } from "@/lib/inquiry/types";
import { easeGlass } from "@/lib/motion";

export function PersonalInquiryChat() {
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const currentPanelRef = useRef<HTMLDivElement>(null);
  const submissionErrorRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const chat = useInquiryChatController({
    chatViewportRef,
    submissionErrorRef,
    turnstileRef,
  });

  return (
    <div className="bg-surface-muted/70 p-2 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-glass-md">
        <InquiryChatHeader
          phaseIndex={chat.phaseIndex}
          phaseLabel={chat.phaseLabel}
          stepLabel={chat.stepLabel}
          reducedMotion={chat.prefersReducedMotion}
          canRestart={chat.canRestart}
          showRestartConfirmation={chat.showRestartConfirmation}
          onRestartConfirmationChange={chat.setShowRestartConfirmation}
          onRestart={chat.resetInquiry}
        />

        <div className="flex h-[clamp(32rem,72vh,48rem)] min-h-0 flex-col">
          <div className="h-[12.5rem] shrink-0 overflow-hidden border-b border-border/80 px-4 py-4 sm:h-[13rem] sm:px-6 sm:py-5">
            <InquiryTranscript chat={chat} />
          </div>

          <div
            ref={chatViewportRef}
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
          >
            <div className="px-4 py-6 sm:px-6 sm:py-7">
              <motion.div
                ref={currentPanelRef}
                tabIndex={-1}
                role="region"
                aria-label={chat.currentPanelLabel}
                className="relative outline-none"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`${chat.stage}-${chat.currentQuestionId ?? "panel"}`}
                    initial={chat.prefersReducedMotion ? false : { opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={chat.prefersReducedMotion ? undefined : { opacity: 0, y: -2 }}
                    transition={{
                      duration: chat.prefersReducedMotion ? 0 : 0.16,
                      ease: easeGlass,
                    }}
                  >
                    <InquiryCurrentStep
                      chat={chat}
                      submissionErrorRef={submissionErrorRef}
                      turnstileRef={turnstileRef}
                    />

                    {chat.canGoBack && (
                      <div className="mt-7 border-t border-border/80 pt-5">
                        <button
                          type="button"
                          onClick={chat.goBack}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:border-clay/30 hover:bg-surface-muted/45 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:hover:translate-y-0"
                        >
                          <ArrowLeft
                            aria-hidden="true"
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                          Zurück
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type InquiryChatController = ReturnType<typeof useInquiryChatController>;

function InquiryTranscript({ chat }: { chat: InquiryChatController }) {
  const lastCompletedQuestionId = chat.transcriptQuestionIds.at(-1);
  const currentQuestionIsPending =
    chat.stage === "questions" &&
    chat.currentQuestion &&
    chat.currentQuestionId &&
    !chat.transcriptQuestionIds.includes(chat.currentQuestionId);

  const contextKey = [
    chat.stage,
    chat.currentQuestionId ?? "none",
    lastCompletedQuestionId ?? chat.draft.projectType ?? "start",
  ].join("-");

  return (
    <div
      aria-label="Aktueller Gesprächskontext"
      aria-live="polite"
      className="flex h-full flex-col justify-end"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={contextKey}
          initial={chat.prefersReducedMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={chat.prefersReducedMotion ? undefined : { opacity: 0, y: -2 }}
          transition={{ duration: chat.prefersReducedMotion ? 0 : 0.16, ease: easeGlass }}
          className="space-y-3"
        >
          {chat.stage === "project-type" && !chat.draft.projectType && (
            <AssistantMessage reducedMotion={chat.prefersReducedMotion}>
              Schön, dass Sie da sind. Ich stelle Ihnen ein paar kurze Fragen.
            </AssistantMessage>
          )}

          {chat.stage !== "project-type" &&
            (lastCompletedQuestionId ? (
              <UserMessage reducedMotion={chat.prefersReducedMotion}>
                <span className="font-normal text-foreground/70">Letzte Antwort: </span>
                {chat.formatAnswer(lastCompletedQuestionId).join(", ") || "Übersprungen"}
              </UserMessage>
            ) : chat.draft.projectType ? (
              <UserMessage reducedMotion={chat.prefersReducedMotion}>
                <span className="font-normal text-foreground/70">Auswahl: </span>
                {getProjectTypeLabel(chat.draft.projectType)}
              </UserMessage>
            ) : null)}

          {chat.stage === "project-type" && (
            <AssistantMessage reducedMotion={chat.prefersReducedMotion}>
              Wobei darf ich Sie unterstützen?
            </AssistantMessage>
          )}

          {currentQuestionIsPending && chat.currentQuestion && (
            <AssistantMessage reducedMotion={chat.prefersReducedMotion}>
              {chat.currentQuestion.prompt}
            </AssistantMessage>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type InquiryCurrentStepProps = {
  chat: InquiryChatController;
  submissionErrorRef: React.RefObject<HTMLDivElement | null>;
  turnstileRef: React.RefObject<TurnstileWidgetHandle | null>;
};

function InquiryCurrentStep({
  chat,
  submissionErrorRef,
  turnstileRef,
}: InquiryCurrentStepProps) {
  if (chat.stage === "project-type") {
    return (
      <ChoiceQuestion
        id="project-type"
        prompt="Wobei darf ich Sie unterstützen?"
        type="single"
        options={PROJECT_TYPE_OPTIONS}
        selectedValues={chat.draft.projectType ? [chat.draft.projectType] : []}
        onSelect={(value) => chat.chooseProjectType(value as ProjectType)}
        reducedMotion={chat.prefersReducedMotion}
        hidePromptVisually
      />
    );
  }

  if (chat.stage === "questions" && chat.currentQuestion && chat.currentQuestionId) {
    if (chat.currentQuestion.type === "single" || chat.currentQuestion.type === "multiple") {
      return (
        <ChoiceQuestion
          id={chat.currentQuestionId}
          prompt={chat.currentQuestion.prompt}
          type={chat.currentQuestion.type}
          options={chat.currentQuestion.options ?? []}
          selectedValues={chat.currentSelectedValues}
          otherValue={chat.draft.customAnswers[chat.currentQuestionId]}
          otherMaxLength={chat.currentQuestion.otherMaxLength}
          optional={chat.currentQuestion.optional}
          error={chat.questionError}
          onSelect={chat.selectChoice}
          onOtherChange={chat.currentQuestion.allowOther ? chat.updateOther : undefined}
          onContinue={chat.currentQuestion.type === "multiple" ? chat.continueMultiple : undefined}
          reducedMotion={chat.prefersReducedMotion}
          hidePromptVisually
        />
      );
    }

    return (
      <InputQuestion
        id={chat.currentQuestionId}
        prompt={chat.currentQuestion.prompt}
        type={chat.currentQuestion.type}
        value={typeof chat.currentAnswer === "string" ? chat.currentAnswer : ""}
        placeholder={chat.currentQuestion.placeholder}
        maxLength={chat.currentQuestion.maxLength ?? 200}
        optional={chat.currentQuestion.optional}
        error={chat.questionError}
        onChange={chat.updateCurrentAnswer}
        onContinue={chat.continueInput}
        hidePromptVisually
      />
    );
  }

  if (chat.stage === "contact") {
    return (
      <div>
        <AssistantMessage reducedMotion={chat.prefersReducedMotion}>
          <span className="block font-medium">
            Perfekt. Ich habe jetzt einen guten ersten Eindruck von Ihrem Vorhaben.
          </span>
          <span className="mt-1.5 block">
            Zum Schluss benötige ich nur noch Ihre Kontaktdaten, damit ich mich persönlich bei
            Ihnen melden kann.
          </span>
        </AssistantMessage>
        <div className="mt-8 border-t border-border/80 pt-8">
          <ContactDetailsStep
            value={chat.contact}
            privacyAccepted={chat.privacyAccepted}
            errors={chat.contactErrors}
            onChange={chat.setContact}
            onPrivacyChange={chat.setPrivacyAccepted}
            onContinue={chat.continueContact}
          />
        </div>
      </div>
    );
  }

  if (chat.stage === "summary") {
    return (
      <InquirySubmissionStep
        chat={chat}
        submissionErrorRef={submissionErrorRef}
        turnstileRef={turnstileRef}
      />
    );
  }
  if (chat.stage === "success") return <InquirySuccessStep chat={chat} />;

  return null;
}

type InquirySubmissionStepProps = {
  chat: InquiryChatController;
  submissionErrorRef: React.RefObject<HTMLDivElement | null>;
  turnstileRef: React.RefObject<TurnstileWidgetHandle | null>;
};

function InquirySubmissionStep({
  chat,
  submissionErrorRef,
  turnstileRef,
}: InquirySubmissionStepProps) {
  return (
    <div>
      <InquirySummary sections={chat.summarySections} onEdit={chat.editSummarySection} />
      <div className="mt-7">
        <div
          className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="inquiry-website-confirm">Webseite bestätigen</label>
          <input
            id="inquiry-website-confirm"
            name="website_confirm"
            tabIndex={-1}
            autoComplete="off"
            value={chat.honeypot}
            onChange={(event) => chat.setHoneypot(event.target.value)}
          />
        </div>
        <TurnstileWidget
          ref={turnstileRef}
          onReadyChange={chat.setTurnstileReady}
          onErrorChange={chat.setTurnstileError}
        />
        {chat.turnstileError && (
          <div
            role="alert"
            className="mb-5 rounded-[1.1rem] border border-red-700/25 bg-red-50 p-4 text-sm leading-relaxed text-red-800 dark:border-red-300/25 dark:bg-red-950/25 dark:text-red-200"
          >
            <p>{chat.turnstileError} Ihre Eingaben bleiben erhalten.</p>
            <button
              type="button"
              onClick={() => turnstileRef.current?.retry()}
              className="mt-3 min-h-11 rounded-full border border-current/20 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-current/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/35"
            >
              Sicherheitsprüfung erneut laden
            </button>
          </div>
        )}
        <AnimatePresence initial={false}>
          {chat.isSubmitting && (
            <motion.div
              initial={chat.prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={chat.prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{
                duration: chat.prefersReducedMotion ? 0 : 0.35,
                ease: easeGlass,
              }}
              className="mb-5 flex items-center gap-4 rounded-[1.1rem] border border-clay/20 bg-accent-soft/70 p-4 sm:p-5"
            >
              <SendingGlyph reducedMotion={chat.prefersReducedMotion} />
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
        {chat.submissionError && (
          <div
            ref={submissionErrorRef}
            tabIndex={-1}
            role="alert"
            className="mb-5 rounded-[1.1rem] border border-red-700/25 bg-red-50 p-4 text-sm leading-relaxed text-red-800 outline-none dark:border-red-300/25 dark:bg-red-950/25 dark:text-red-200"
          >
            {chat.submissionError} Ihre bisherigen Eingaben bleiben vollständig erhalten.
          </div>
        )}
        <button
          type="button"
          disabled={chat.isSubmitting || !chat.turnstileReady}
          onClick={() => void chat.submitInquiry()}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow,opacity] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:hover:translate-y-0 sm:w-auto sm:px-7"
        >
          {chat.isSubmitting
            ? "Anfrage wird übermittelt"
            : chat.turnstileReady
              ? "Projektanfrage senden"
              : chat.turnstileError
                ? "Sicherheitsprüfung nicht verfügbar"
                : "Sicherheitsprüfung wird geladen"}
        </button>
      </div>
    </div>
  );
}

function InquirySuccessStep({ chat }: { chat: InquiryChatController }) {
  return (
    <div className="py-4 sm:py-6">
      <SuccessGlyph reducedMotion={chat.prefersReducedMotion} />
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Anfrage übermittelt
      </p>
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
        onClick={chat.resetInquiry}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-300 hover:border-clay/30 hover:bg-surface-muted/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 sm:w-auto"
      >
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
        Neue Anfrage beginnen
      </button>
    </div>
  );
}
