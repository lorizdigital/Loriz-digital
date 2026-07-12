import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

const steps = [
  {
    title: "Kennenlernen",
    description: "Wir besprechen Ihr Unternehmen, Ihre Ziele und Ihre Vorstellungen.",
  },
  {
    title: "Konzept",
    description: "Ich entwickle Struktur, Inhalte und eine passende visuelle Richtung.",
  },
  {
    title: "Gestaltung und Entwicklung",
    description: "Die Webseite oder digitale Lösung wird individuell umgesetzt.",
  },
  {
    title: "Feedback",
    description: "Sie erhalten einen Entwurf und können gezielt Änderungswünsche einbringen.",
  },
  {
    title: "Livegang",
    description: "Nach der finalen Abstimmung geht das Projekt online.",
  },
  {
    title: "Betreuung",
    description: "Auch danach bleibe ich bei Fragen und Weiterentwicklungen erreichbar.",
  },
];

export function Process() {
  return (
    <section className="section-padding bg-surface-muted/60">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Ablauf</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Von der ersten Idee bis zur fertigen Lösung.
            </h2>
          </Reveal>
        </div>

        <div className="relative mt-16 max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute left-[19px] top-3 hidden h-[calc(100%-2rem)] w-px bg-border sm:block"
          />
          <ol className="space-y-10 sm:space-y-12">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.06}>
                <li className="relative flex gap-6 sm:gap-8">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay/25 bg-accent-soft text-sm font-medium text-clay shadow-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-medium tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
