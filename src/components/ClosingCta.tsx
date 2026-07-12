import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { TrustSignals } from "@/components/TrustSignals";
import { siteConfig } from "@/lib/site";

export function ClosingCta() {
  return (
    <section id="kontakt" className="section-padding">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface px-8 py-16 text-center shadow-soft sm:px-14 sm:py-20">
            <Eyebrow className="justify-center">Kontakt</Eyebrow>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Lassen Sie uns über Ihr Projekt sprechen.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Sie planen eine neue Webseite oder möchten einen digitalen
              Ablauf in Ihrem Unternehmen verbessern? Erzählen Sie mir kurz
              von Ihrer Idee.
            </p>

            <TrustSignals className="mt-7" />

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button href={`mailto:${siteConfig.email}`} variant="primary">
                Unverbindlich anfragen
              </Button>
            </div>

            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
              Oder schreiben Sie direkt eine E-Mail an {siteConfig.email}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
