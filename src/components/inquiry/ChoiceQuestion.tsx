"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { easeGlass } from "@/lib/motion";

export type InquiryChoiceOption = {
  value: string;
  label: string;
};

type ChoiceQuestionProps = {
  id: string;
  prompt: string;
  type: "single" | "multiple";
  options: InquiryChoiceOption[];
  selectedValues: string[];
  otherValue?: string;
  otherMaxLength?: number;
  optional?: boolean;
  error?: string;
  onSelect: (value: string) => void;
  onOtherChange?: (value: string) => void;
  onContinue?: () => void;
  reducedMotion?: boolean;
  hidePromptVisually?: boolean;
};

export function ChoiceQuestion({
  id,
  prompt,
  type,
  options,
  selectedValues,
  otherValue = "",
  otherMaxLength = 200,
  optional = false,
  error,
  onSelect,
  onOtherChange,
  onContinue,
  reducedMotion = false,
  hidePromptVisually = false,
}: ChoiceQuestionProps) {
  const isMultiple = type === "multiple";
  const otherSelected = selectedValues.includes("other");
  const errorId = `${id}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend
        className={cn(
          "max-w-2xl text-xl font-medium leading-[1.3] tracking-[-0.02em] text-foreground sm:text-2xl",
          hidePromptVisually && "sr-only",
        )}
      >
        {prompt}
      </legend>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        {isMultiple ? "Mehrere Antworten sind möglich." : "Bitte wählen Sie eine Antwort."}
        {optional ? " Diese Angabe ist freiwillig." : ""}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <motion.button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.value)}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.22,
                ease: easeGlass,
              }}
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.992 }}
              className={cn(
                "group relative flex min-h-14 items-center justify-between gap-4 overflow-hidden rounded-[1.1rem] border px-4 py-3.5 text-left text-[0.92rem] leading-snug transition-[background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                selected
                  ? "border-clay/45 bg-accent-soft text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.38),var(--shadow-soft)]"
                  : "border-border bg-surface text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.32)] hover:border-clay/35 hover:shadow-glass-sm",
              )}
            >
              <span className="relative z-10 pr-1 font-medium">{option.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-glass)]",
                  selected
                    ? "scale-100 border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface-muted text-transparent group-hover:border-clay/35",
                )}
              >
                <Check className={cn("h-3.5 w-3.5 transition-opacity", selected ? "opacity-100" : "opacity-0")} strokeWidth={2.5} />
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {otherSelected && onOtherChange && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.32, ease: easeGlass }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-[1.1rem] border border-border bg-surface-muted/45 p-4 sm:p-5">
              <label htmlFor={`${id}-other`} className="text-sm font-medium text-foreground">
                Kurze Ergänzung
              </label>
              <input
                id={`${id}-other`}
                type="text"
                value={otherValue}
                maxLength={otherMaxLength}
                onChange={(event) => onOtherChange(event.target.value)}
                className="mt-2.5 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/60 focus:border-clay/45 focus:bg-surface focus:ring-2 focus:ring-clay/15"
                placeholder="Was möchten Sie ergänzen?"
              />
              <p className="mt-2 text-right text-xs tabular-nums text-muted-foreground">
                {otherValue.length}/{otherMaxLength}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {isMultiple && onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:hover:translate-y-0"
        >
          Weiter
          <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </button>
      )}
    </fieldset>
  );
}
