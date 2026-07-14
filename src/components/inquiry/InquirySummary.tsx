"use client";

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
      <h3 className="text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
        Bitte prüfen Sie Ihre Angaben.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Sie können jeden Abschnitt bearbeiten, ohne die Anfrage neu beginnen zu müssen.
      </p>

      <div className="mt-6 space-y-3">
        {sections.map((section) => (
          <section key={section.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-medium text-foreground">{section.title}</h4>
              <button
                type="button"
                onClick={() => onEdit(section.id)}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-clay transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
              >
                Bearbeiten
              </button>
            </div>
            <dl className="mt-4 space-y-3">
              {section.rows.map((row) => (
                <div key={row.label} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
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
