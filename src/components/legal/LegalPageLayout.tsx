import { Container } from "@/components/ui/Container";

export type TocEntry = { id: string; label: string };

type LegalPageLayoutProps = {
  title: string;
  subtitle?: string;
  toc: TocEntry[];
  children: React.ReactNode;
};

/**
 * Gemeinsames, bewusst ruhiges Layout für Rechtstexte (Impressum,
 * Datenschutzerklärung): große H1, dezenter Untertitel, Inhaltsverzeichnis
 * aus den Überschriften (Desktop: sticky Sidebar, Mobil: einklappbar).
 * Keine Glasflächen, keine Animation – ausschließlich Lesbarkeit.
 */
export function LegalPageLayout({ title, subtitle, toc, children }: LegalPageLayoutProps) {
  return (
    <main id="main-content" className="flex-1">
      <section className="section-padding pt-36 sm:pt-44 lg:pt-48">
        <Container>
          <header className="max-w-3xl">
            <h1 className="break-words text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            {subtitle && <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>}
          </header>

          {/* Mobil: einklappbares Inhaltsverzeichnis, ohne JavaScript */}
          <details className="group mt-10 rounded-xl border border-border bg-surface-muted/50 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-5 py-4 text-sm font-medium text-foreground marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-clay/45">
              Inhaltsverzeichnis
              <span
                aria-hidden="true"
                className="text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <nav aria-label="Inhaltsverzeichnis" className="border-t border-border px-5 py-4">
              <ol className="space-y-2.5 text-sm">
                {toc.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="inline-flex min-h-11 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          <div className="mt-10 lg:mt-16 lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-16">
            {/* Desktop: sticky Inhaltsverzeichnis links */}
            <nav aria-label="Inhaltsverzeichnis" className="hidden lg:block">
              <div className="sticky top-32">
                <p className="text-sm font-medium text-foreground">Inhaltsverzeichnis</p>
                <ol className="mt-4 space-y-2.5 text-sm">
                  {toc.map((entry) => (
                    <li key={entry.id}>
                      <a
                        href={`#${entry.id}`}
                        className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                      >
                        {entry.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="max-w-[65ch] [overflow-wrap:anywhere] text-[1.05rem] leading-relaxed text-foreground/90">
              {children}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

/** Nummerierter Abschnitt mit Anker-Überschrift und abschließender Trennlinie. */
export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{heading}</h2>
      <div className="mt-4 space-y-4">{children}</div>
      <hr className="mt-10 border-border" />
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-clay">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
