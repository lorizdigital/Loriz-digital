import { ArrowUpRight, ImageOff } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

const highlights = [
  "Modernes, responsives Design",
  "Übersichtliche Präsentation der Produkte",
  "Persönliche Markenwirkung",
  "Hochwertige Galerie",
  "Optimierte Darstellung auf Smartphone und Desktop",
];

export function FeaturedProject() {
  return (
    <section id="projekte" className="section-padding">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Ausgewähltes Projekt</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Von der Idee zur digitalen Markenwirkung.
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <div className="grid gap-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft lg:grid-cols-2">
            <div
              className="relative flex min-h-[280px] flex-col items-center justify-center gap-3 border-b border-dashed border-border bg-surface-muted p-10 text-center lg:min-h-[420px] lg:border-b-0 lg:border-r"
              role="img"
              aria-label="Platzhalter für Screenshot der Website Einzelstück by Elisa"
            >
              <ImageOff className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm font-medium text-muted-foreground">
                Screenshot folgt
              </p>
              <p className="max-w-[220px] text-xs text-muted-foreground/80">
                Platzhalter – wird durch eine Aufnahme der fertigen Website ersetzt
              </p>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                Einzelstück by Elisa
              </h3>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">
                Entwicklung eines modernen und emotionalen Webauftritts für
                ein lokales Unternehmen mit handgemachten Produkten und
                personalisierten Geschenkideen.
              </p>

              <ul className="mt-6 space-y-2.5">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="mt-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Projekt ansehen
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
