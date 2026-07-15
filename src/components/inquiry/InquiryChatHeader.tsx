import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { easeGlass } from "@/lib/motion";

type InquiryChatHeaderProps = {
  phaseIndex: number;
  phaseLabel: string;
  stepLabel: string;
  reducedMotion: boolean;
  canRestart: boolean;
  showRestartConfirmation: boolean;
  onRestartConfirmationChange: (show: boolean) => void;
  onRestart: () => void;
};

export function InquiryChatHeader({
  phaseIndex,
  phaseLabel,
  stepLabel,
  reducedMotion,
  canRestart,
  showRestartConfirmation,
  onRestartConfirmationChange,
  onRestart,
}: InquiryChatHeaderProps) {
  return (
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
        <div
          className="flex items-center gap-3"
          aria-label={`Fortschritt: ${phaseLabel}, ${stepLabel}`}
        >
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
                transition={{ duration: reducedMotion ? 0 : 0.4, ease: easeGlass }}
                className={
                  phase <= phaseIndex
                    ? "h-[5px] rounded-full bg-clay"
                    : "h-[5px] rounded-full bg-muted-foreground"
                }
              />
            ))}
          </span>
        </div>
      </div>
      {canRestart && (
        <div className="mt-4 flex justify-end border-t border-border/70 pt-3.5">
          <button
            type="button"
            onClick={() => onRestartConfirmationChange(!showRestartConfirmation)}
            aria-expanded={showRestartConfirmation}
            aria-controls="inquiry-restart-confirmation"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-medium text-muted-foreground transition-[background-color,color] hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
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
            initial={reducedMotion ? false : { opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: easeGlass }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-border bg-surface-muted/55 p-3.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Möchten Sie alle bisherigen Antworten verwerfen?
              </p>
              <div className="mt-3 flex items-center gap-2 sm:mt-0 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => onRestartConfirmationChange(false)}
                  className="min-h-11 rounded-full px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="min-h-11 rounded-full bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glass-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted motion-reduce:hover:translate-y-0"
                >
                  Neu starten
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
