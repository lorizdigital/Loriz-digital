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
              aria-hidden="true"
              className="shadow-glass-lg relative mx-auto flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl"
            >
              {/* Markentreue, immer dunkle Grundfläche – bewusst unabhängig vom
                  Farbschema, damit sie wie ein gestaltetes Signature-Element
                  wirkt und nicht wie eine leere Platzhalterfläche. */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#211f1a] via-[#2a2621] to-[#39301f]" />
              <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-clay/30 blur-3xl" />
              <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-[#bfcddb]/15 blur-3xl" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />

              <span className="relative text-[5.5rem] font-semibold tracking-tight text-[#f3f1ea] sm:text-[6.5rem]">
                LL
              </span>
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
