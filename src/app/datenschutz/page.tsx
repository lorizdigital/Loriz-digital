import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LegalPageLayout, LegalSection, LegalList, type TocEntry } from "@/components/legal/LegalPageLayout";

const externalLinkProps = { target: "_blank", rel: "noopener noreferrer" } as const;
const linkClass = "text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground";

const toc: TocEntry[] = [
  { id: "verantwortlicher", label: "1. Verantwortlicher" },
  { id: "allgemeine-hinweise", label: "2. Allgemeine Hinweise" },
  { id: "bereitstellung-der-website", label: "3. Bereitstellung der Website" },
  { id: "hosting-und-content-delivery", label: "4. Hosting und Content Delivery" },
  { id: "cloudflare-web-analytics", label: "5. Cloudflare Web Analytics" },
  { id: "schriftarten", label: "6. Schriftarten" },
  { id: "kontaktaufnahme", label: "7. Kontaktaufnahme" },
  { id: "kommunikation-per-e-mail", label: "8. Kommunikation per E-Mail (iCloud Mail)" },
  { id: "einbindung-von-referenzprojekten", label: "9. Einbindung von Referenzprojekten" },
  { id: "cookies", label: "10. Cookies" },
  { id: "speicherdauer", label: "11. Speicherdauer" },
  { id: "empfaenger-personenbezogener-daten", label: "12. Empfänger personenbezogener Daten" },
  { id: "ihre-rechte", label: "13. Ihre Rechte" },
  { id: "beschwerderecht", label: "14. Beschwerderecht" },
  { id: "widerspruchsrecht", label: "15. Widerspruchsrecht" },
  { id: "datensicherheit", label: "16. Datensicherheit" },
  { id: "aenderungen", label: "17. Änderungen dieser Datenschutzerklärung" },
];

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von Loriz Digital gemäß DSGVO.",
  alternates: {
    canonical: "/datenschutz",
  },
};

export default function DatenschutzPage() {
  return (
    <>
      <Navigation />
      <LegalPageLayout title="Datenschutzerklärung" subtitle="Stand: Juli 2026" toc={toc}>
        <div className="space-y-10">
        <LegalSection id="verantwortlicher" heading="1. Verantwortlicher">
          <p>
            Verantwortlicher für die Verarbeitung personenbezogener Daten auf dieser Website im
            Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <address className="not-italic">
            Lino Loriz
            <br />
            Loriz Digital
            <br />
            Wiesenweg 23
            <br />
            34379 Calden
          </address>
          <p>
            Telefon:{" "}
            <a href="tel:+491603329300" className={linkClass}>
              +49 160 3329300
            </a>
            <br />
            E-Mail:{" "}
            <a href="mailto:hallo@loriz.digital" className={linkClass}>
              hallo@loriz.digital
            </a>
          </p>
        </LegalSection>

        <LegalSection id="allgemeine-hinweise" heading="2. Allgemeine Hinweise">
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist mir ein wichtiges Anliegen. Ich
            verarbeite Ihre personenbezogenen Daten ausschließlich im Rahmen der geltenden
            datenschutzrechtlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung
            (DSGVO), des Bundesdatenschutzgesetzes (BDSG) sowie des Digitale-Dienste-Gesetzes
            (DDG).
          </p>
          <p>
            Personenbezogene Daten sind alle Informationen, mit denen Sie persönlich
            identifiziert werden können.
          </p>
          <p>Diese Datenschutzerklärung erläutert,</p>
          <LegalList
            items={[
              "welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden,",
              "aus welchem Grund dies geschieht,",
              "auf welcher Rechtsgrundlage die Verarbeitung erfolgt,",
              "wie lange Daten gespeichert werden und",
              "welche Rechte Ihnen zustehen.",
            ]}
          />
        </LegalSection>

        <LegalSection id="bereitstellung-der-website" heading="3. Bereitstellung der Website">
          <p>
            Beim Aufruf dieser Website werden durch den Browser automatisch Informationen an den
            Server übermittelt.
          </p>
          <p>Hierzu gehören insbesondere:</p>
          <LegalList
            items={[
              "IP-Adresse",
              "Datum und Uhrzeit des Zugriffs",
              "angeforderte URL",
              "Referrer-URL",
              "Browsertyp und Browserversion",
              "verwendetes Betriebssystem",
              "Spracheinstellungen",
              "Zugriffsstatus",
              "übertragene Datenmenge",
              "weitere technische Verbindungsinformationen",
            ]}
          />
          <p>Diese Daten werden verarbeitet, um</p>
          <LegalList
            items={[
              "die Website bereitzustellen,",
              "die Stabilität sicherzustellen,",
              "Angriffe zu erkennen,",
              "Fehler zu analysieren und",
              "die Sicherheit der Systeme zu gewährleisten.",
            ]}
          />
          <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
          <p>
            Mein berechtigtes Interesse liegt in einer sicheren, stabilen und technisch
            fehlerfreien Bereitstellung meines Internetauftritts.
          </p>
        </LegalSection>

        <LegalSection id="hosting-und-content-delivery" heading="4. Hosting und Content Delivery">
          <p>Diese Website wird über Dienste der</p>
          <address className="not-italic">
            Cloudflare, Inc.
            <br />
            101 Townsend Street
            <br />
            San Francisco, CA 94107
            <br />
            USA
          </address>
          <p>bereitgestellt.</p>
          <p>Zum Einsatz kommen insbesondere:</p>
          <LegalList
            items={[
              "Cloudflare Workers",
              "Cloudflare CDN",
              "DNS-Dienste",
              "Sicherheitsfunktionen",
              "Performance-Optimierungen",
            ]}
          />
          <p>
            Cloudflare verarbeitet technische Verbindungsdaten, um Inhalte weltweit performant
            und sicher auszuliefern.
          </p>
          <p>Hierzu können insbesondere gehören:</p>
          <LegalList
            items={[
              "IP-Adresse",
              "Browserinformationen",
              "Datum und Uhrzeit",
              "HTTP-Header",
              "angeforderte Ressourcen",
              "Informationen zur Netzwerksicherheit",
            ]}
          />
          <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
          <p>
            Mein berechtigtes Interesse besteht in der sicheren, schnellen und zuverlässigen
            Bereitstellung meiner Website.
          </p>
          <p>Cloudflare kann Daten auch außerhalb der Europäischen Union verarbeiten.</p>
          <p>
            Für Datenübermittlungen werden nach Angaben von Cloudflare geeignete Garantien nach
            Art. 46 DSGVO verwendet, insbesondere Standardvertragsklauseln sowie – soweit
            anwendbar – das EU-US Data Privacy Framework.
          </p>
          <p>
            Weitere Informationen finden Sie unter:
            <br />
            <a href="https://www.cloudflare.com/privacypolicy/" className={linkClass} {...externalLinkProps}>
              https://www.cloudflare.com/privacypolicy/
            </a>
          </p>
        </LegalSection>

        <LegalSection id="cloudflare-web-analytics" heading="5. Cloudflare Web Analytics">
          <p>Diese Website verwendet Cloudflare Web Analytics.</p>
          <p>
            Cloudflare Web Analytics ermöglicht die statistische Auswertung der Nutzung meiner
            Website, ohne klassische Tracking-Cookies einzusetzen.
          </p>
          <p>Hierbei werden insbesondere Informationen verarbeitet über</p>
          <LegalList
            items={[
              "aufgerufene Seiten",
              "Browsertyp",
              "Betriebssystem",
              "Geräteeigenschaften",
              "Referrer",
              "Zeitpunkt des Seitenaufrufs",
              "Ladezeiten",
              "Performance-Daten",
            ]}
          />
          <p>
            Nach Angaben von Cloudflare werden hierfür keine Cookies auf Ihrem Endgerät
            gespeichert.
          </p>
          <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
          <p>Mein berechtigtes Interesse besteht darin,</p>
          <LegalList
            items={[
              "die Benutzerfreundlichkeit meiner Website zu verbessern,",
              "technische Fehler zu erkennen,",
              "die Performance zu optimieren und",
              "mein Angebot kontinuierlich weiterzuentwickeln.",
            ]}
          />
          <p>
            Weitere Informationen finden Sie unter:
            <br />
            <a href="https://developers.cloudflare.com/web-analytics/" className={linkClass} {...externalLinkProps}>
              https://developers.cloudflare.com/web-analytics/
            </a>
          </p>
        </LegalSection>

        <LegalSection id="schriftarten" heading="6. Schriftarten">
          <p>Auf dieser Website werden ausschließlich lokal eingebundene Schriftarten verwendet.</p>
          <p>
            Beim Laden der Website erfolgt daher keine Verbindung zu Servern von Google oder
            anderen externen Font-Anbietern.
          </p>
          <p>
            Es werden insoweit keine personenbezogenen Daten an Dritte zum Zweck der
            Schriftendarstellung übertragen.
          </p>
        </LegalSection>

        <LegalSection id="kontaktaufnahme" heading="7. Kontaktaufnahme">
          <p>
            Wenn Sie mich per E-Mail oder telefonisch kontaktieren, verarbeite ich Ihre Angaben
            ausschließlich zur Bearbeitung Ihrer Anfrage.
          </p>
          <p>Hierzu können insbesondere gehören:</p>
          <LegalList
            items={[
              "Name",
              "Unternehmen",
              "Telefonnummer",
              "E-Mail-Adresse",
              "Inhalt Ihrer Nachricht",
              "Zeitpunkt der Kontaktaufnahme",
            ]}
          />
          <p>Die Verarbeitung erfolgt</p>
          <LegalList
            items={[
              "zur Durchführung vorvertraglicher Maßnahmen gemäß Art. 6 Abs. 1 lit. b DSGVO oder",
              "aufgrund meines berechtigten Interesses an der Bearbeitung Ihrer Anfrage gemäß Art. 6 Abs. 1 lit. f DSGVO.",
            ]}
          />
          <p>
            Eine Weitergabe Ihrer Daten erfolgt nur, soweit dies gesetzlich zulässig oder zur
            Bearbeitung Ihrer Anfrage erforderlich ist.
          </p>
          <p>
            Die Daten werden gelöscht, sobald Ihre Anfrage vollständig bearbeitet wurde und keine
            gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>
        </LegalSection>

        <LegalSection id="kommunikation-per-e-mail" heading="8. Kommunikation per E-Mail (iCloud Mail)">
          <p>
            Für den Empfang und Versand von E-Mails verwende ich iCloud Mail mit einer eigenen
            E-Mail-Domain.
          </p>
          <p>Anbieter für Nutzer im Europäischen Wirtschaftsraum ist:</p>
          <address className="not-italic">
            Apple Distribution International Limited
            <br />
            Hollyhill Industrial Estate
            <br />
            Hollyhill, Cork
            <br />
            Irland
          </address>
          <p>
            Wenn Sie mir eine E-Mail senden, verarbeitet Apple die für die Zustellung und
            Speicherung der Nachricht erforderlichen Daten. Hierzu gehören insbesondere:
          </p>
          <LegalList
            items={[
              "Absenderadresse",
              "Empfängeradresse",
              "Betreff",
              "Nachrichteninhalt",
              "Anhänge",
              "Datum und Uhrzeit",
              "technische Verbindungsdaten",
            ]}
          />
          <p>
            Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage gemäß Art. 6 Abs. 1 lit. b
            DSGVO beziehungsweise aufgrund meines berechtigten Interesses an einer zuverlässigen
            geschäftlichen Kommunikation gemäß Art. 6 Abs. 1 lit. f DSGVO.
          </p>
          <p>
            Weitere Informationen finden Sie unter:
            <br />
            <a href="https://www.apple.com/legal/privacy/de-ww/" className={linkClass} {...externalLinkProps}>
              https://www.apple.com/legal/privacy/de-ww/
            </a>
          </p>
        </LegalSection>

        <LegalSection id="einbindung-von-referenzprojekten" heading="9. Einbindung von Referenzprojekten">
          <p>Diese Website enthält eine Live-Vorschau eines Referenzprojekts.</p>
          <p>
            Hierfür wird die Website{" "}
            <a href="https://einzelstueckbyelisa.de" className={linkClass} {...externalLinkProps}>
              https://einzelstueckbyelisa.de
            </a>{" "}
            innerhalb eines Browser-Frames dargestellt.
          </p>
          <p>
            Beim Laden dieser Vorschau kann Ihr Browser eine Verbindung zu dieser Domain
            herstellen.
          </p>
          <p>Hierbei können insbesondere verarbeitet werden:</p>
          <LegalList
            items={[
              "IP-Adresse",
              "Browserinformationen",
              "Betriebssystem",
              "Datum und Uhrzeit",
              "technische Verbindungsdaten",
              "Referrer",
            ]}
          />
          <p>
            Die Einbindung erfolgt ausschließlich zur Präsentation eines von mir entwickelten
            Projekts.
          </p>
          <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>
          <p>
            Mein berechtigtes Interesse besteht darin, Besuchern meiner Website reale
            Referenzprojekte präsentieren zu können.
          </p>
        </LegalSection>

        <LegalSection id="cookies" heading="10. Cookies">
          <p>
            Diese Website verwendet keine Cookies zu Werbe-, Marketing- oder
            Profilbildungszwecken.
          </p>
          <p>
            Soweit technisch erforderliche Cookies durch Cloudflare oder den Hostinganbieter
            eingesetzt werden, dienen diese ausschließlich der sicheren Bereitstellung der
            Website.
          </p>
          <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO sowie § 25 Abs. 2 TDDDG.</p>
        </LegalSection>

        <LegalSection id="speicherdauer" heading="11. Speicherdauer">
          <p>
            Personenbezogene Daten werden nur so lange gespeichert, wie dies zur Erfüllung des
            jeweiligen Zwecks erforderlich ist.
          </p>
          <p>Darüber hinaus erfolgt eine Speicherung nur,</p>
          <LegalList
            items={[
              "sofern gesetzliche Aufbewahrungspflichten bestehen,",
              "soweit dies zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist oder",
              "solange berechtigte Interessen einer Löschung entgegenstehen.",
            ]}
          />
          <p>Anschließend werden die Daten gelöscht.</p>
        </LegalSection>

        <LegalSection id="empfaenger-personenbezogener-daten" heading="12. Empfänger personenbezogener Daten">
          <p>Personenbezogene Daten werden nur dann an Dritte übermittelt, wenn</p>
          <LegalList
            items={[
              "dies gesetzlich zulässig ist,",
              "eine gesetzliche Verpflichtung besteht,",
              "dies zur Vertragserfüllung erforderlich ist,",
              "Sie eingewilligt haben oder",
              "ein berechtigtes Interesse besteht.",
            ]}
          />
          <p>Empfänger können insbesondere sein:</p>
          <LegalList
            items={["Cloudflare", "Apple (iCloud Mail)", "IT-Dienstleister", "Hosting- und Infrastrukturpartner"]}
          />
          <p className="italic text-muted-foreground">
            Soweit für eingesetzte Dienstleister gesetzlich erforderlich, werden die
            datenschutzrechtlich notwendigen vertraglichen Vereinbarungen geschlossen.
          </p>
        </LegalSection>

        <LegalSection id="ihre-rechte" heading="13. Ihre Rechte">
          <p>Sie haben nach der DSGVO insbesondere folgende Rechte:</p>
          <LegalList
            items={[
              "Recht auf Auskunft gemäß Art. 15 DSGVO",
              "Recht auf Berichtigung gemäß Art. 16 DSGVO",
              "Recht auf Löschung gemäß Art. 17 DSGVO",
              "Recht auf Einschränkung der Verarbeitung gemäß Art. 18 DSGVO",
              "Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO",
              "Recht auf Widerspruch gemäß Art. 21 DSGVO",
              "Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft",
            ]}
          />
          <p>
            Zur Ausübung Ihrer Rechte genügt eine formlose Mitteilung an{" "}
            <a href="mailto:hallo@loriz.digital" className={linkClass}>
              hallo@loriz.digital
            </a>
          </p>
        </LegalSection>

        <LegalSection id="beschwerderecht" heading="14. Beschwerderecht">
          <p>
            Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde über die
            Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
          </p>
          <p>Zuständige Aufsichtsbehörde ist insbesondere:</p>
          <address className="not-italic">
            Der Hessische Beauftragte für Datenschutz und Informationsfreiheit
            <br />
            Wilhelmstraße 7
            <br />
            65185 Wiesbaden
            <br />
            Telefon: +49 611 1408-0
            <br />
            <a href="https://datenschutz.hessen.de" className={linkClass} {...externalLinkProps}>
              https://datenschutz.hessen.de
            </a>
          </address>
        </LegalSection>

        <LegalSection id="widerspruchsrecht" heading="15. Widerspruchsrecht">
          <p>
            Werden personenbezogene Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
            verarbeitet, haben Sie das Recht, aus Gründen, die sich aus Ihrer besonderen
            Situation ergeben, jederzeit Widerspruch gegen diese Verarbeitung einzulegen.
          </p>
          <p>
            Ich werde die betreffenden personenbezogenen Daten anschließend nicht mehr
            verarbeiten, sofern keine zwingenden schutzwürdigen Gründe für die Verarbeitung
            nachgewiesen werden können oder die Verarbeitung der Geltendmachung, Ausübung oder
            Verteidigung von Rechtsansprüchen dient.
          </p>
          <p>
            Der Widerspruch kann jederzeit per E-Mail an{" "}
            <a href="mailto:hallo@loriz.digital" className={linkClass}>
              hallo@loriz.digital
            </a>{" "}
            gerichtet werden.
          </p>
        </LegalSection>

        <LegalSection id="datensicherheit" heading="16. Datensicherheit">
          <p>Diese Website verwendet eine SSL- beziehungsweise TLS-Verschlüsselung.</p>
          <p>Dadurch werden übermittelte Daten während der Übertragung geschützt.</p>
          <p>
            Eine verschlüsselte Verbindung erkennen Sie an der Adresszeile Ihres Browsers (
            <code className="rounded bg-surface-muted px-1.5 py-0.5 text-[0.9em]">https://</code>)
            sowie am Schloss-Symbol.
          </p>
        </LegalSection>

        <LegalSection id="aenderungen" heading="17. Änderungen dieser Datenschutzerklärung">
          <p>
            Ich behalte mir vor, diese Datenschutzerklärung anzupassen, wenn dies aufgrund
            technischer Weiterentwicklungen, gesetzlicher Änderungen oder neuer Angebote
            erforderlich wird.
          </p>
          <p>Es gilt jeweils die auf dieser Website veröffentlichte aktuelle Fassung.</p>
        </LegalSection>
        </div>
      </LegalPageLayout>
      <Footer />
    </>
  );
}
