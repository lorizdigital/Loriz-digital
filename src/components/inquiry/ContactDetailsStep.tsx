"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type InquiryContactDraft = {
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone" | "both";
};

type ContactDetailsStepProps = {
  value: InquiryContactDraft;
  privacyAccepted: boolean;
  errors: Record<string, string>;
  onChange: (value: InquiryContactDraft) => void;
  onPrivacyChange: (accepted: boolean) => void;
  onContinue: () => void;
};

const fieldClass =
  "mt-2.5 min-h-12 w-full rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-muted-foreground/55 hover:border-clay/25 focus:border-clay/45 focus:bg-surface focus:ring-2 focus:ring-clay/15";

export function ContactDetailsStep({
  value,
  privacyAccepted,
  errors,
  onChange,
  onPrivacyChange,
  onContinue,
}: ContactDetailsStepProps) {
  function update<Key extends keyof InquiryContactDraft>(
    key: Key,
    nextValue: InquiryContactDraft[Key],
  ) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <div>
      <h3 className="max-w-2xl text-xl font-medium leading-[1.3] tracking-[-0.02em] text-foreground sm:text-2xl">
        Wie darf ich Sie erreichen?
      </h3>
      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Ihre Kontaktdaten werden ausschließlich zur Bearbeitung dieser Anfrage verwendet.
      </p>

      <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <FormField label="Name" name="name" required error={errors.name}>
          <input
            id="inquiry-name"
            name="name"
            autoComplete="name"
            value={value.name}
            required
            aria-required="true"
            maxLength={100}
            onChange={(event) => update("name", event.target.value)}
            className={fieldClass}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "inquiry-name-error" : undefined}
          />
        </FormField>

        <FormField label="Unternehmen" name="company" error={errors.company}>
          <input
            id="inquiry-company"
            name="company"
            autoComplete="organization"
            value={value.company}
            maxLength={120}
            onChange={(event) => update("company", event.target.value)}
            className={fieldClass}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "inquiry-company-error" : undefined}
          />
        </FormField>

        <FormField label="E-Mail" name="email" required error={errors.email}>
          <input
            id="inquiry-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={value.email}
            required
            aria-required="true"
            maxLength={254}
            onChange={(event) => update("email", event.target.value)}
            className={fieldClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "inquiry-email-error" : undefined}
          />
        </FormField>

        <FormField label="Telefonnummer" name="phone" error={errors.phone}>
          <input
            id="inquiry-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={value.phone}
            maxLength={30}
            onChange={(event) => update("phone", event.target.value)}
            className={fieldClass}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "inquiry-phone-error" : undefined}
          />
        </FormField>
      </div>

      <fieldset className="mt-8" aria-describedby={errors.preferredContact ? "preferred-contact-error" : undefined}>
        <legend className="text-sm font-medium text-foreground">Bevorzugter Kontaktweg</legend>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {[
            ["email", "E-Mail"],
            ["phone", "Telefon"],
            ["both", "Beides möglich"],
          ].map(([optionValue, label]) => {
            const selected = value.preferredContact === optionValue;
            return (
              <button
                key={optionValue}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  update("preferredContact", optionValue as InquiryContactDraft["preferredContact"])
                }
                className={cn(
                  "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  selected
                    ? "border-clay/45 bg-accent-soft text-foreground shadow-soft"
                    : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-clay/30 hover:shadow-soft motion-reduce:hover:translate-y-0",
                )}
              >
                <span>{label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface-muted text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
              </button>
            );
          })}
        </div>
        {errors.preferredContact && (
          <p id="preferred-contact-error" role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
            {errors.preferredContact}
          </p>
        )}
      </fieldset>

      <div className="mt-8 rounded-[1.1rem] border border-border bg-surface-muted/45 p-4 sm:p-5">
        <label className="flex cursor-pointer items-start gap-3.5 text-sm leading-relaxed text-foreground">
          <input
            type="checkbox"
            checked={privacyAccepted}
            required
            aria-required="true"
            onChange={(event) => onPrivacyChange(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted"
            aria-invalid={Boolean(errors.privacyAccepted)}
            aria-describedby={errors.privacyAccepted ? "privacy-error" : undefined}
          />
          <span>
            Ich habe die{" "}
            <Link
              href="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
            >
              Datenschutzhinweise
            </Link>{" "}
            zur Bearbeitung meiner Anfrage zur Kenntnis genommen.
          </span>
        </label>
        {errors.privacyAccepted && (
          <p id="privacy-error" role="alert" className="mt-2 pl-7 text-sm text-red-700 dark:text-red-300">
            {errors.privacyAccepted}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-glass)] hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:hover:translate-y-0"
      >
        Angaben prüfen
      </button>
    </div>
  );
}

function FormField({
  label,
  name,
  required = false,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`inquiry-${name}`} className="text-sm font-medium text-foreground">
        {label}
        {!required && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`inquiry-${name}-error`} role="alert" className="mt-1.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
