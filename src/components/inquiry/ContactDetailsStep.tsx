"use client";

import Link from "next/link";
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
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/55 focus:border-clay/45 focus:ring-2 focus:ring-accent/20";

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
      <h3 className="text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
        Wie darf ich Sie erreichen?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ihre Kontaktdaten werden ausschließlich zur Bearbeitung dieser Anfrage verwendet.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField label="Name" name="name" required error={errors.name}>
          <input
            id="inquiry-name"
            name="name"
            autoComplete="name"
            value={value.name}
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

      <fieldset className="mt-6" aria-describedby={errors.preferredContact ? "preferred-contact-error" : undefined}>
        <legend className="text-sm font-medium text-foreground">Bevorzugter Kontaktweg</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
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
                  "min-h-11 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
                  selected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-foreground hover:border-clay/30",
                )}
              >
                {label}
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

      <div className="mt-6 rounded-xl border border-border bg-surface-muted/60 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => onPrivacyChange(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
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
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-glass-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
