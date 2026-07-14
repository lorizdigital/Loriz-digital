"use client";

import { Pencil } from "lucide-react";

export type InquirySummarySection = {
  id: string;
  title: string;
  rows: Array<{ label: string; value: string | string[] }>;
};

type InquirySummaryProps = {
  sections: InquirySummarySection[];
  onEdit: (sectionId: string) => void;
};

export function InquirySummary({ sections, onEdit }: InquirySummaryProps) {
  return (
    <div>
      <h3 className="max-w-2xl text-xl font-medium leading-[1.3] tracking-[-0.02em] text-foreground sm:text-2xl">
        Bitte prüfen Sie Ihre Angaben.
      </h3>
      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Sie können jeden Abschnitt bearbeiten, ohne die Anfrage neu beginnen zu müssen.
      </p>

      <div className="mt-7 space-y-4">
        {sections.map((section, sectionIndex) => (
          <section
            key={section.id}
            className="rounded-[1.1rem] border border-border bg-surface-muted/32 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] sm:p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[0.68rem] font-medium tabular-nums text-muted-foreground"
                >
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <h4 className="font-medium tracking-tight text-foreground">{section.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => onEdit(section.id)}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-[background-color,color] hover:bg-accent-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
              >
                <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
                Bearbeiten
              </button>
            </div>
            <dl className="mt-5 divide-y divide-border/70 border-t border-border/70">
              {section.rows.map((row) => (
                <div key={row.label} className="grid gap-1.5 py-3.5 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1.2fr)] sm:gap-6">
                  <dt className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{row.label}</dt>
                  <dd className="break-words text-sm font-medium leading-relaxed text-foreground [overflow-wrap:anywhere]">
                    {Array.isArray(row.value) ? row.value.join(", ") : row.value || "–"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
