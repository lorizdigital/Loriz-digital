import { Calendar, Check, CheckCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { ModernWebsiteDemo } from "@/components/ModernWebsiteDemo";
import { cn } from "@/lib/cn";

const services = [
  {
    index: "01",
    title: "Moderne Webseiten",
    lead: "Schnell, mobil optimiert und individuell auf Ihr Unternehmen zugeschnitten.",
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

/** Animierte Mini-Landingpage-Demo statt statischem Browser-Mockup. */
function WebsiteVisual() {
  return <ModernWebsiteDemo />;
}

/** Eindeutig als Terminbuchung erkennbar: Kalender, Datum, Zeitslots, Bestätigung. */
function BookingVisual() {
  return (
    <div className="flex h-full flex-col justify-center p-8 sm:p-10">
      <div className="w-full max-w-[280px] rounded-xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Calendar aria-hidden="true" className="h-4 w-4 text-clay" strokeWidth={2} />
          <div className="h-2 w-24 rounded-full bg-foreground/70" />
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className={cn("aspect-square rounded-md", i === 9 ? "bg-accent" : "bg-surface-muted")}
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <span className="h-7 flex-1 rounded-full border border-border" />
          <span className="h-7 flex-1 rounded-full bg-accent" />
          <span className="h-7 flex-1 rounded-full border border-border" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2.5">
          <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-clay" strokeWidth={2.5} />
          <div className="h-2 w-28 rounded-full bg-foreground/45" />
        </div>
      </div>
    </div>
  );
}

/** Eindeutig als persönliche Kommunikation erkennbar: Chat-Verlauf mit Lesebestätigung. */
function ConversationVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-8 sm:p-10">
      <div className="flex items-end gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a25] to-accent text-[0.6rem] font-medium text-accent-foreground">
          LL
        </span>
        <div className="max-w-[75%] space-y-1.5 rounded-2xl rounded-bl-sm bg-surface px-4 py-3 shadow-soft">
          <div className="h-2 w-28 rounded-full bg-foreground/55" />
          <div className="h-2 w-16 rounded-full bg-foreground/35" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[65%] space-y-1.5 rounded-2xl rounded-br-sm bg-accent px-4 py-3">
          <div className="h-2 w-24 rounded-full bg-accent-foreground/70" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[#2a2a25] to-accent" />
        <div className="max-w-[55%] rounded-2xl rounded-bl-sm bg-surface px-4 py-3 shadow-soft">
          <div className="h-2 w-14 rounded-full bg-foreground/45" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 pr-1 pt-1">
        <div className="h-1.5 w-10 rounded-full bg-border" />
        <CheckCheck aria-hidden="true" className="h-3.5 w-3.5 text-clay" strokeWidth={2.5} />
      </div>
    </div>
  );
}

function ServiceVisual({ variant }: { variant: number }) {
  if (variant === 0) return <WebsiteVisual />;
  if (variant === 1) return <BookingVisual />;
  return <ConversationVisual />;
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
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Drei Bereiche, ein Ansprechpartner.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 space-y-6">
          {services.map((service, i) => (
            <Reveal key={service.index} variant={i % 2 === 0 ? "left" : "right"} delay={0.05}>
              <InteractiveCard className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
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
                          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-clay" strokeWidth={2} />
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
              </InteractiveCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
