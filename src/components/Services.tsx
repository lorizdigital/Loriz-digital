import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";

const services = [
  {
    index: "01",
    title: "Moderne Webseiten",
    lead: "Individuell gestaltet, schnell, mobil optimiert und auf Ihr Unternehmen zugeschnitten.",
    points: [
      "Unternehmenswebseiten",
      "Landingpages",
      "Relaunch bestehender Webseiten",
      "Mobile Optimierung",
      "Verständliche Nutzerführung",
    ],
  },
  {
    index: "02",
    title: "Digitale Lösungen",
    lead: "Praktische digitale Werkzeuge, die Abläufe vereinfachen und im Alltag Zeit sparen.",
    points: [
      "Kontakt- und Anfrageformulare",
      "Terminbuchungen",
      "Automatisierungen",
      "Kleine interne Anwendungen",
      "Individuelle digitale Prozesse",
    ],
  },
  {
    index: "03",
    title: "Persönliche Betreuung",
    lead: "Ein direkter Ansprechpartner – von der ersten Idee bis nach dem Livegang.",
    points: [
      "Persönliche Beratung",
      "Transparente Abstimmung",
      "Verständliche Erklärungen",
      "Pflege und Weiterentwicklung",
      "Langfristige Erreichbarkeit",
    ],
  },
];

function ServiceVisual({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-3 p-8 sm:p-10">
        <div className="h-3 w-1/3 rounded-full bg-clay/40" />
        <div className="h-4 w-3/4 rounded-md bg-foreground/85" />
        <div className="h-2.5 w-full rounded-full bg-border" />
        <div className="h-2.5 w-5/6 rounded-full bg-border" />
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          <div className="aspect-[4/3] rounded-lg bg-surface" />
          <div className="aspect-[4/3] rounded-lg bg-surface" />
          <div className="aspect-[4/3] rounded-lg bg-surface" />
        </div>
      </div>
    );
  }

  if (variant === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-4 p-8 sm:p-10">
        <div className="flex items-center gap-3 rounded-xl bg-surface p-4 shadow-soft">
          <div className="h-9 w-9 shrink-0 rounded-full bg-accent/90" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-2/3 rounded-full bg-border" />
            <div className="h-2.5 w-1/3 rounded-full bg-border" />
          </div>
        </div>
        <div className="ml-8 flex items-center gap-3 rounded-xl bg-surface p-4 shadow-soft">
          <div className="h-9 w-9 shrink-0 rounded-full bg-clay/60" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-3/4 rounded-full bg-border" />
            <div className="h-2.5 w-1/2 rounded-full bg-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-8 sm:p-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
          LL
        </span>
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-2/3 rounded-full bg-surface" />
          <div className="h-2.5 w-1/3 rounded-full bg-surface" />
        </div>
      </div>
      <div className="mt-2 space-y-2.5 rounded-xl bg-surface p-4 shadow-soft">
        <div className="h-2.5 w-full rounded-full bg-border" />
        <div className="h-2.5 w-4/5 rounded-full bg-border" />
        <div className="h-2.5 w-3/5 rounded-full bg-border" />
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section id="leistungen" className="section-padding bg-surface-muted/60">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Leistungen</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Drei Bereiche, ein Ansprechpartner.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 space-y-6">
          {services.map((service, i) => (
            <Reveal key={service.index} variant={i % 2 === 0 ? "left" : "right"} delay={0.05}>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <div
                  className={cn(
                    "grid items-stretch lg:grid-cols-2",
                    i % 2 === 1 && "lg:[direction:rtl]",
                  )}
                >
                  <div className={cn("p-8 sm:p-10 lg:p-12", i % 2 === 1 && "lg:[direction:ltr]")}>
                    <span className="text-sm font-medium text-clay">{service.index}</span>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">
                      {service.lead}
                    </p>
                    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {service.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/85">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-clay" strokeWidth={2} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className={cn(
                      "min-h-[260px] border-t border-border bg-surface-muted lg:min-h-0 lg:border-t-0",
                      i % 2 === 0 ? "lg:border-l" : "lg:border-r lg:[direction:ltr]",
                    )}
                  >
                    <ServiceVisual variant={i} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
