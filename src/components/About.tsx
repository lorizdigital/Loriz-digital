import Image from "next/image";
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
              className="shadow-glass-lg relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-[#d8cbbc] ring-1 ring-border/70"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(145deg,#f2eee7_0%,#ded3c4_52%,#bca587_100%)]"
              />
              <div
                aria-hidden="true"
                className="absolute -left-[18%] -top-[14%] h-[74%] w-[136%] rounded-[50%] border border-white/40"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-[12%] bottom-[7%] h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />

              <Image
                src="/images/lino-loriz-portrait.webp"
                alt="Lino Loriz, Gründer von Loriz Digital"
                fill
                sizes="(max-width: 639px) calc(100vw - 3rem), 384px"
                quality={80}
                className="origin-bottom scale-[1.08] object-contain object-bottom"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/25"
              />
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
