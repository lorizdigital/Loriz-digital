import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LegalPageLayout, LegalSection, type TocEntry } from "@/components/legal/LegalPageLayout";

const toc: TocEntry[] = [
  { id: "angaben", label: "Angaben gemäß § 5 DDG" },
  { id: "kontakt", label: "Kontakt" },
  { id: "verantwortlich", label: "Verantwortlich für den Inhalt" },
  { id: "verbraucherstreitbeilegung", label: "Verbraucherstreitbeilegung" },
];

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Loriz Digital – Angaben gemäß § 5 DDG.",
  alternates: {
    canonical: "/impressum",
  },
};

export default function ImpressumPage() {
  return (
    <>
      <Navigation />
      <LegalPageLayout title="Impressum" toc={toc}>
        <LegalSection id="angaben" heading="Angaben gemäß § 5 DDG">
          <address className="not-italic">
            Lino Loriz
            <br />
            Loriz Digital
            <br />
            Wiesenweg 23
            <br />
            34379 Calden
          </address>
        </LegalSection>

        <LegalSection id="kontakt" heading="Kontakt">
          <p>
            Telefon:{" "}
            <a
              href="tel:+491603329300"
              className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              +49 160 3329300
            </a>
            <br />
            E-Mail:{" "}
            <a
              href="mailto:hallo@loriz.digital"
              className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              hallo@loriz.digital
            </a>
          </p>
        </LegalSection>

        <LegalSection id="verantwortlich" heading="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
          <address className="not-italic">
            Lino Loriz
            <br />
            Wiesenweg 23
            <br />
            34379 Calden
          </address>
        </LegalSection>

        <LegalSection id="verbraucherstreitbeilegung" heading="Verbraucherstreitbeilegung">
          <p>
            Ich bin weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </LegalSection>
      </LegalPageLayout>
      <Footer />
    </>
  );
}
