import { ArrowRight } from "lucide-react";

type InputQuestionProps = {
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
};

export function InputQuestion({
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
}: InputQuestionProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="max-w-2xl text-xl font-medium leading-[1.3] tracking-[-0.02em] text-foreground sm:text-2xl"
      >
        {prompt}
      </label>
      {optional && (
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Diese Angabe ist freiwillig.
        </p>
      )}
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
        <span className="tabular-nums">
          {value.length}/{maxLength}
        </span>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
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
