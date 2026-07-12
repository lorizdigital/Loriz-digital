import { User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function About() {
  return (
    <section id="ueber-mich" className="section-padding">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal variant="left">
            <div
              className="relative mx-auto flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface-muted"
              role="img"
              aria-label="Platzhalter für Porträtfoto von Lino Loriz"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-soft">
                  <User className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-medium text-muted-foreground">Porträtfoto folgt</p>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={0.1}>
            <Eyebrow>Über mich</Eyebrow>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Hi, ich bin Lino.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Mich begeistert, wie gute digitale Lösungen Unternehmen
              professioneller präsentieren und gleichzeitig den
              Arbeitsalltag einfacher machen können. Mit Loriz Digital
              entwickle ich moderne Webseiten und individuelle digitale
              Lösungen für Unternehmen, die Wert auf Qualität, persönliche
              Zusammenarbeit und verständliche Kommunikation legen.
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Dabei erhalten Sie keine anonyme Agenturleistung, sondern
              einen direkten Ansprechpartner, der zuhört, mitdenkt und
              Lösungen entwickelt, die zu Ihrem Unternehmen passen.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
