import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { ModernWebsiteDemo } from "@/components/ModernWebsiteDemo";
import { PersonalInquiryChat } from "@/components/inquiry/PersonalInquiryChat";
import { InteractiveBookingDemo } from "@/components/booking/InteractiveBookingDemo";
import { MobileExpandableServiceVisual } from "@/components/MobileExpandableServiceVisual";
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

function ServiceVisual({ variant }: { variant: number }) {
  if (variant === 0) return <WebsiteVisual />;
  if (variant === 1) {
    return (
      <MobileExpandableServiceVisual
        eyebrow="Interaktive Demo"
        title="Wie kann eine einfache Terminbuchung aussehen?"
        description="Probieren Sie einen beispielhaften Ablauf direkt auf der Seite aus. Es wird dabei kein Termin gebucht."
        openLabel="Demo ansehen"
        closeLabel="Demo schließen"
      >
        <InteractiveBookingDemo />
      </MobileExpandableServiceVisual>
    );
  }
  return (
    <MobileExpandableServiceVisual
      eyebrow="Persönliche Projektanfrage"
      title="Möchten Sie mir von Ihrem Vorhaben erzählen?"
      description="Die geführte Anfrage öffnet sich mit einem Klick und bringt die wichtigsten Punkte Ihres Vorhabens übersichtlich zusammen."
      openLabel="Projektanfrage öffnen"
      closeLabel="Anfrage schließen"
    >
      <PersonalInquiryChat />
    </MobileExpandableServiceVisual>
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
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Drei Bereiche, ein Ansprechpartner.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 space-y-6">
          {services.map((service, i) => (
            <Reveal key={service.index} variant={i % 2 === 0 ? "left" : "right"} delay={0.05}>
              <InteractiveCard
                motionMode={i === 0 ? "tilt" : "highlight"}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
              >
                <div
                  className={cn(
                    "grid items-stretch lg:grid-cols-2",
                    i === 2 && "lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)]",
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
                      "border-t border-border bg-surface-muted lg:min-h-0 lg:border-t-0",
                      i === 0 && "min-h-[260px]",
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
