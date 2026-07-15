"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowLeft, CalendarDays, Clock3, RotateCcw } from "lucide-react";
import { LorizMark } from "@/components/icons/LorizMark";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { easeGlass } from "@/lib/motion";
import { formatBookingDate } from "@/lib/booking/dateFormat";
import { demoBookingAdapter } from "@/lib/booking/demoAvailability";
import { LatestRequestCoordinator } from "@/lib/booking/latestRequest";
import type {
  AvailableDay,
  BookingService,
  BookingAvailabilityAdapter,
} from "@/lib/booking/types";

type BookingStep = "service" | "date" | "time" | "review" | "confirmed";
type IntroPhase = "idle" | "frame" | "content" | "ready";

type BookingDraft = {
  serviceId: string | null;
  date: string | null;
  slotId: string | null;
};

const EMPTY_DRAFT: BookingDraft = {
  serviceId: null,
  date: null,
  slotId: null,
};

const STEP_INDEX: Record<BookingStep, number> = {
  service: 0,
  date: 1,
  time: 2,
  review: 3,
  confirmed: 3,
};

function createDemoRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function InteractiveBookingDemo({
  adapter = demoBookingAdapter,
}: {
  adapter?: BookingAvailabilityAdapter;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const timeoutsRef = useRef<Set<number>>(new Set());
  const hasUserInteractedRef = useRef(false);
  const availabilityRequestsRef = useRef(new LatestRequestCoordinator());
  const confirmationRequestsRef = useRef(new LatestRequestCoordinator());
  const isInView = useInView(frameRef, { once: true, amount: 0.35 });

  const [introPhase, setIntroPhase] = useState<IntroPhase>("idle");
  const [step, setStep] = useState<BookingStep>("service");
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [services, setServices] = useState<BookingService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [days, setDays] = useState<AvailableDay[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string>();

  const selectedService = services.find((service) => service.id === draft.serviceId);
  const selectedDay = days.find((day) => day.date === draft.date);
  const selectedSlot = selectedDay?.slots.find((slot) => slot.id === draft.slotId);
  const currentStepIndex = STEP_INDEX[step];

  const setStepHeadingRef = useCallback((heading: HTMLHeadingElement | null) => {
    stepHeadingRef.current = heading;
    if (!heading || !hasUserInteractedRef.current) return;

    window.requestAnimationFrame(() => {
      if (stepHeadingRef.current === heading) heading.focus({ preventScroll: true });
    });
  }, []);

  const availableSlots = useMemo(
    () => days.find((day) => day.date === draft.date)?.slots ?? [],
    [days, draft.date],
  );

  useEffect(() => {
    const controller = new AbortController();
    adapter
      .listServices(controller.signal)
      .then((availableServices) => {
        if (controller.signal.aborted) return;
        setServices(availableServices);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Die Demo konnte nicht geladen werden.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoadingServices(false);
      });
    return () => controller.abort();
  }, [adapter]);

  useEffect(() => {
    if (!isInView) return;

    const schedule = (action: () => void, delay: number) => {
      const timeout = window.setTimeout(() => {
        timeoutsRef.current.delete(timeout);
        action();
      }, prefersReducedMotion ? 0 : delay);
      timeoutsRef.current.add(timeout);
    };

    schedule(() => setIntroPhase("frame"), 0);
    schedule(() => setIntroPhase("content"), 180);
    schedule(() => setIntroPhase("ready"), 460);

    // React startet Effekte im Strict Mode probeweise zweimal. Die Timer
    // muessen deshalb pro Effektlauf neu angelegt und sauber entfernt werden.
    // Andernfalls koennte der Rahmen sichtbar bleiben, waehrend sein Inhalt
    // nach dem ersten Cleanup dauerhaft transparent ist.
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(window.clearTimeout);
      timeouts.clear();
    };
  }, [isInView, prefersReducedMotion]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    const availabilityRequests = availabilityRequestsRef.current;
    const confirmationRequests = confirmationRequestsRef.current;
    return () => {
      timeouts.forEach(window.clearTimeout);
      timeouts.clear();
      availabilityRequests.cancel();
      confirmationRequests.cancel();
    };
  }, []);

  function takeOver() {
    hasUserInteractedRef.current = true;
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current.clear();
    setIntroPhase("ready");
  }

  async function chooseService(serviceId: string) {
    takeOver();
    const request = availabilityRequestsRef.current.begin();
    setError(undefined);
    setIsLoadingAvailability(true);
    setDays([]);
    setDraft({ serviceId, date: null, slotId: null });
    setStep("date");

    try {
      const availability = await adapter.listAvailability({ serviceId }, request.signal);
      if (!request.isCurrent()) return;
      setDays(availability);
    } catch (loadError) {
      if (!request.isCurrent()) return;
      setError(loadError instanceof Error ? loadError.message : "Verfügbarkeiten konnten nicht geladen werden.");
    } finally {
      if (request.isCurrent()) setIsLoadingAvailability(false);
    }
  }

  function chooseDate(date: string) {
    takeOver();
    setError(undefined);
    setDraft((current) => ({ ...current, date, slotId: null }));
    setStep("time");
  }

  function chooseSlot(slotId: string) {
    takeOver();
    setError(undefined);
    setDraft((current) => ({ ...current, slotId }));
    setStep("review");
  }

  async function confirmDemo() {
    takeOver();
    if (!draft.serviceId || !draft.date || !draft.slotId || isConfirming) return;
    const request = confirmationRequestsRef.current.begin();
    setError(undefined);
    setIsConfirming(true);

    try {
      await adapter.createBooking(
        {
          serviceId: draft.serviceId,
          date: draft.date,
          slotId: draft.slotId,
        },
        { idempotencyKey: createDemoRequestId(), signal: request.signal },
      );
      if (!request.isCurrent()) return;
      setStep("confirmed");
    } catch (submitError) {
      if (!request.isCurrent()) return;
      setError(submitError instanceof Error ? submitError.message : "Die Demo-Auswahl konnte nicht bestätigt werden.");
    } finally {
      if (request.isCurrent()) setIsConfirming(false);
    }
  }

  function goBack() {
    takeOver();
    setError(undefined);
    if (step === "date") {
      availabilityRequestsRef.current.cancel();
      setIsLoadingAvailability(false);
      setDays([]);
      setStep("service");
      return;
    }
    if (step === "time") {
      setStep("date");
      return;
    }
    if (step === "review") {
      confirmationRequestsRef.current.cancel();
      setIsConfirming(false);
      setStep("time");
    }
  }

  function restart() {
    takeOver();
    availabilityRequestsRef.current.cancel();
    confirmationRequestsRef.current.cancel();
    setStep("service");
    setDraft(EMPTY_DRAFT);
    setDays([]);
    setError(undefined);
    setIsLoadingAvailability(false);
    setIsConfirming(false);
  }

  const motionProps = prefersReducedMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 7 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -5 },
        transition: { duration: 0.3, ease: easeGlass },
      };

  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-7 lg:p-8">
      <motion.div
        ref={frameRef}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
        animate={
          introPhase === "idle"
            ? { opacity: 0, y: 12, scale: 0.985 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: prefersReducedMotion ? 0 : 0.46, ease: easeGlass }}
        className="w-full max-w-[27rem] overflow-hidden rounded-[1.35rem] border border-border bg-surface shadow-glass-sm"
        onPointerDown={takeOver}
        onFocusCapture={takeOver}
        onKeyDown={takeOver}
      >
        <div className="flex items-start gap-3 border-b border-clay/20 bg-accent-soft/75 px-4 py-3.5 sm:px-5">
          <span className="mt-0.5 shrink-0 rounded-full border border-clay/30 bg-surface/75 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-clay">
            Demo
          </span>
          <p className="text-xs font-medium leading-relaxed text-foreground/85">
            Interaktive Vorschau – es wird kein echter Termin gebucht oder gespeichert.
          </p>
        </div>
        <div className="border-b border-border/80 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-clay/20 bg-accent-soft">
                <CalendarDays aria-hidden="true" className="h-[1.05rem] w-[1.05rem] text-clay" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium tracking-tight text-foreground">Termin auswählen</p>
                <p className="mt-0.5 text-[0.7rem] text-muted-foreground">Beispiel einer digitalen Terminbuchung</p>
              </div>
            </div>
            {step !== "service" && step !== "confirmed" && (
              <button
                type="button"
                onClick={restart}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
                Neu starten
              </button>
            )}
          </div>

          <div
            className="mt-4 flex items-center justify-between gap-4"
            role="group"
            aria-label={
              step === "confirmed"
                ? "Fortschritt: Demo abgeschlossen"
                : `Fortschritt: Schritt ${currentStepIndex + 1} von 4`
            }
          >
            <span className="text-[0.68rem] font-medium text-muted-foreground">
              {step === "confirmed" ? "Demo abgeschlossen" : `Schritt ${currentStepIndex + 1} von 4`}
            </span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <motion.span
                  key={index}
                  animate={{
                    width: index === currentStepIndex ? 15 : 5,
                    opacity: index <= currentStepIndex ? 1 : 0.26,
                  }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: easeGlass }}
                  className={cn(
                    "h-[5px] rounded-full",
                    index <= currentStepIndex ? "bg-clay" : "bg-muted-foreground",
                  )}
                />
              ))}
            </span>
          </div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: introPhase === "content" || introPhase === "ready" ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: easeGlass }}
          className="min-h-[22rem] px-4 py-5 sm:px-5 sm:py-6"
        >
          <AnimatePresence mode="wait" initial={false}>
            {step === "service" && (
              <motion.div key="service" {...motionProps}>
                <StepHeading ref={setStepHeadingRef} eyebrow="Terminart">
                  Worum geht es in Ihrem Gespräch?
                </StepHeading>
                <fieldset className="mt-5 space-y-2.5">
                  <legend className="sr-only">Terminart auswählen</legend>
                  {services.map((service) => (
                    <SelectionButton
                      key={service.id}
                      selected={draft.serviceId === service.id}
                      onClick={() => void chooseService(service.id)}
                      ariaLabel={`${service.title}, ${service.durationMinutes} Minuten. ${service.description}`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">{service.title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {service.description}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                        {service.durationMinutes} Min.
                      </span>
                    </SelectionButton>
                  ))}
                </fieldset>
                {isLoadingServices && !error && (
                  <p role="status" className="mt-5 text-sm text-muted-foreground">
                    Die Demo wird vorbereitet.
                  </p>
                )}
                {!isLoadingServices && services.length === 0 && !error && (
                  <p role="status" className="mt-5 text-sm text-muted-foreground">
                    Aktuell stehen keine Beispieltermine zur Verfügung.
                  </p>
                )}
              </motion.div>
            )}

            {step === "date" && (
              <motion.div key="date" {...motionProps}>
                <StepHeading ref={setStepHeadingRef} eyebrow="Beispielwoche">
                  Welcher Tag passt für Sie?
                </StepHeading>
                {isLoadingAvailability ? (
                  <p role="status" className="mt-5 text-sm text-muted-foreground">
                    Freie Zeiten werden geladen.
                  </p>
                ) : (
                  <fieldset className="mt-5">
                    <legend className="sr-only">Verfügbaren Tag auswählen</legend>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {days.map((day) => {
                        const selected = draft.date === day.date;
                        return (
                          <button
                            key={day.date}
                            type="button"
                            disabled={!day.available}
                            aria-label={day.accessibleLabel}
                            aria-pressed={selected}
                            onClick={() => chooseDate(day.date)}
                            className={cn(
                              "flex min-h-[4.4rem] flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                              selected
                                ? "border-clay/45 bg-accent-soft shadow-soft"
                                : "border-border bg-surface hover:-translate-y-0.5 hover:border-clay/30 hover:shadow-soft",
                              !day.available && "cursor-not-allowed border-transparent bg-surface-muted/55 opacity-45 hover:translate-y-0 hover:border-transparent hover:shadow-none",
                            )}
                          >
                            <span className="text-[0.65rem] font-medium text-muted-foreground">{day.shortWeekday}</span>
                            <span className="mt-1 text-sm font-semibold text-foreground">{day.dayOfMonth}</span>
                            <span className={cn("mt-1 h-1 w-1 rounded-full", day.available ? "bg-clay" : "bg-border")} aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                    {days.length > 0 ? (
                      <p className="mt-3 text-[0.68rem] leading-relaxed text-muted-foreground">
                        Markierte Tage zeigen beispielhaft verfügbare Termine.
                      </p>
                    ) : (
                      <p role="status" className="mt-4 text-sm text-muted-foreground">
                        In dieser Beispielwoche sind keine freien Zeiten verfügbar.
                      </p>
                    )}
                  </fieldset>
                )}
              </motion.div>
            )}

            {step === "time" && (
              <motion.div key="time" {...motionProps}>
                <StepHeading
                  ref={setStepHeadingRef}
                  eyebrow={selectedDay ? formatBookingDate(selectedDay.date) : "Uhrzeit"}
                >
                  Welche Uhrzeit passt am besten?
                </StepHeading>
                <fieldset className="mt-5">
                  <legend className="sr-only">Uhrzeit auswählen</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={draft.slotId === slot.id}
                        onClick={() => chooseSlot(slot.id)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:border-clay/30 hover:bg-accent-soft/55 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-clay" strokeWidth={1.9} />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && (
                    <p role="status" className="mt-4 text-sm text-muted-foreground">
                      Für diesen Tag sind keine freien Uhrzeiten verfügbar.
                    </p>
                  )}
                </fieldset>
              </motion.div>
            )}

            {step === "review" && selectedService && selectedDay && selectedSlot && (
              <motion.div key="review" {...motionProps}>
                <StepHeading ref={setStepHeadingRef} eyebrow="Ihre Auswahl">
                  Passt alles für Sie?
                </StepHeading>
                <dl className="mt-5 divide-y divide-border/75 rounded-[1.05rem] border border-border bg-surface-muted/35 px-4">
                  <ReviewRow label="Gespräch" value={selectedService.title} />
                  <ReviewRow label="Dauer" value={`${selectedService.durationMinutes} Minuten`} />
                  <ReviewRow
                    label="Termin"
                    value={`${formatBookingDate(selectedDay.date)} · ${selectedSlot.time} Uhr`}
                  />
                </dl>
                <button
                  type="button"
                  onClick={() => void confirmDemo()}
                  disabled={isConfirming}
                  aria-busy={isConfirming}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow,opacity] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  {isConfirming ? "Auswahl wird vorbereitet" : "Demo abschließen"}
                </button>
              </motion.div>
            )}

            {step === "confirmed" && (
              <motion.div key="confirmed" {...motionProps} role="status" aria-live="polite">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-clay/20 bg-accent-soft shadow-soft">
                  <LorizMark aria-hidden="true" className="h-6 w-6 text-foreground" />
                </span>
                <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Demo abgeschlossen</p>
                <h4 ref={setStepHeadingRef} tabIndex={-1} className="mt-2 text-xl font-medium tracking-[-0.02em] text-foreground outline-none sm:text-2xl">
                  So einfach kann Terminbuchung sein.
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Diese Auswahl wurde nur in der Vorschau bestätigt. Es wurde kein echter Termin gebucht und nichts gespeichert.
                </p>
                <button
                  type="button"
                  onClick={restart}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-300 hover:border-clay/30 hover:bg-surface-muted/45 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                  Noch einmal ausprobieren
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-700/20 bg-red-50 p-3 text-sm leading-relaxed text-red-800 dark:border-red-300/20 dark:bg-red-950/25 dark:text-red-200">
              {error}
            </p>
          )}

          {step !== "service" && step !== "confirmed" && (
            <div className="mt-6 border-t border-border/80 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-[background-color,color] hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                Zurück
              </button>
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}

function StepHeading({
  ref,
  eyebrow,
  children,
}: {
  ref: React.Ref<HTMLHeadingElement>;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-clay">{eyebrow}</p>
      <h4 ref={ref} tabIndex={-1} className="mt-2 text-lg font-medium leading-snug tracking-[-0.02em] text-foreground outline-none sm:text-xl">
        {children}
      </h4>
    </div>
  );
}

function SelectionButton({
  selected,
  onClick,
  ariaLabel,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-[4.6rem] w-full items-center justify-between gap-4 rounded-[1rem] border px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        selected
          ? "border-clay/45 bg-accent-soft shadow-soft"
          : "border-border bg-surface hover:-translate-y-0.5 hover:border-clay/30 hover:bg-surface-muted/35 hover:shadow-soft",
      )}
    >
      {children}
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-3.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}
