"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

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
}: ChoiceQuestionProps) {
  const isMultiple = type === "multiple";
  const otherSelected = selectedValues.includes("other");
  const errorId = `${id}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
        {prompt}
      </legend>
      <p className="mt-2 text-sm text-muted-foreground">
        {isMultiple ? "Mehrere Antworten sind möglich." : "Bitte wählen Sie eine Antwort."}
        {optional ? " Diese Angabe ist freiwillig." : ""}
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                selected
                  ? "border-accent bg-accent text-accent-foreground shadow-soft"
                  : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-clay/30 hover:shadow-soft",
              )}
            >
              <span>{option.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-accent-foreground/20 bg-accent-foreground/15"
                    : "border-border bg-surface-muted",
                )}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </span>
            </button>
          );
        })}
      </div>

      {otherSelected && onOtherChange && (
        <div className="mt-4">
          <label htmlFor={`${id}-other`} className="text-sm font-medium text-foreground">
            Kurze Ergänzung
          </label>
          <input
            id={`${id}-other`}
            type="text"
            value={otherValue}
            maxLength={otherMaxLength}
            onChange={(event) => onOtherChange(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-clay/45 focus:ring-2 focus:ring-accent/20"
            placeholder="Was möchten Sie ergänzen?"
          />
          <p className="mt-1.5 text-right text-xs text-muted-foreground">
            {otherValue.length}/{otherMaxLength}
          </p>
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {isMultiple && onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Weiter
        </button>
      )}
    </fieldset>
  );
}
