import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProjectShowcase } from "@/components/ProjectShowcase";

const projectUrl = "https://einzelstueckbyelisa.de";

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
            <Eyebrow>Aktuelles Projekt</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Von der Idee zur digitalen Markenwirkung.
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <div className="grid gap-0 rounded-2xl border border-border bg-surface shadow-soft lg:grid-cols-2">
            <div className="bg-surface-muted/40 lg:border-r lg:border-border">
              <ProjectShowcase
                title="Einzelstück by Elisa"
                url={projectUrl}
                mobileImage="/projects/einzelstueck-by-elisa-mobile.webp"
                alt="Startseite von Einzelstück by Elisa auf dem Smartphone"
              />
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
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Projekt ansehen
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
