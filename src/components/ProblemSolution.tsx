import { Sparkles, Smartphone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InteractiveCard } from "@/components/ui/InteractiveCard";

const benefits = [
  {
    icon: Sparkles,
    title: "Professioneller Außenauftritt",
    description:
      "Ihre Webseite vermittelt auf den ersten Blick die Qualität und Sorgfalt, die auch Ihre Arbeit auszeichnet.",
  },
  {
    icon: Smartphone,
    title: "Bessere Nutzererfahrung",
    description:
      "Klare Struktur und durchdachte Bedienung sorgen dafür, dass Besucher auf jedem Gerät finden, wonach sie suchen.",
  },
  {
    icon: Clock,
    title: "Digitale Abläufe, die Zeit sparen",
    description:
      "Anfragen, Termine und wiederkehrende Aufgaben laufen digital ab und entlasten Sie im Alltag.",
  },
];

export function ProblemSolution() {
  return (
    <section className="section-padding">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Der erste Eindruck</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Gute Arbeit sollte auch online gut aussehen.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Viele Unternehmen überzeugen ihre Kunden jeden Tag mit
              Qualität, Erfahrung und persönlichem Service. Ihre Webseite
              vermittelt davon jedoch häufig nur einen Bruchteil. Ich
              entwickle digitale Auftritte, die Vertrauen schaffen,
              Leistungen verständlich erklären und auf jedem Gerät
              professionell funktionieren.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} variant="up" delay={index * 0.08}>
              <InteractiveCard className="h-full rounded-2xl border border-border bg-surface p-8 shadow-soft sm:p-9">
                <benefit.icon aria-hidden="true" className="h-6 w-6 text-clay" strokeWidth={1.5} />
                <h3 className="mt-6 text-lg font-medium tracking-tight text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </InteractiveCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
