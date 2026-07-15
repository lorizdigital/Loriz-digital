import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  LegalList,
  LegalPageLayout,
  LegalSection,
  type TocEntry,
} from "@/components/legal/LegalPageLayout";
import { siteConfig } from "@/lib/site";

const externalLinkProps = { target: "_blank", rel: "noopener noreferrer" } as const;
const linkClass =
  "rounded-sm text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45";

const toc: TocEntry[] = [
  { id: "verantwortlicher", label: "1. Verantwortlicher" },
  { id: "allgemeine-hinweise", label: "2. Allgemeine Hinweise" },
  { id: "bereitstellung-der-website", label: "3. Bereitstellung der Website" },
  { id: "hosting-und-content-delivery", label: "4. Hosting und Content Delivery" },
  { id: "cloudflare-web-analytics", label: "5. Cloudflare Web Analytics" },
  { id: "schriftarten", label: "6. Schriftarten" },
  { id: "kontaktaufnahme", label: "7. Kontaktaufnahme" },
  { id: "gefuehrte-projektanfrage", label: "8. Geführte Projektanfrage" },
  { id: "turnstile-missbrauchsschutz", label: "9. Turnstile und Missbrauchsschutz" },
  { id: "brevo", label: "10. E-Mail-Versand über Brevo" },
  { id: "kommunikation-per-e-mail", label: "11. Kommunikation per E-Mail (iCloud Mail)" },
  { id: "einbindung-von-referenzprojekten", label: "12. Einbindung von Referenzprojekten" },
  { id: "cookies", label: "13. Cookies und Zugriffe auf Endeinrichtungen" },
  { id: "speicherdauer", label: "14. Speicherdauer" },
  { id: "empfaenger-personenbezogener-daten", label: "15. Empfänger personenbezogener Daten" },
  { id: "ihre-rechte", label: "16. Ihre Rechte" },
  { id: "beschwerderecht", label: "17. Beschwerderecht" },
  { id: "widerspruchsrecht", label: "18. Widerspruchsrecht" },
  { id: "datensicherheit", label: "19. Datensicherheit" },
  { id: "aenderungen", label: "20. Änderungen dieser Datenschutzerklärung" },
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
              {siteConfig.address.street}
              <br />
              {siteConfig.address.postalCode} {siteConfig.address.city}
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

          <LegalSection id="gefuehrte-projektanfrage" heading="8. Geführte Projektanfrage">
            <p>
              Über die geführte Projektanfrage können Sie Ihr Vorhaben strukturiert beschreiben und
              anschließend eine persönliche Kontaktaufnahme anfragen.
            </p>
            <p>Dabei können insbesondere folgende Daten verarbeitet werden:</p>
            <LegalList
              items={[
                "Projektart und strukturierte Antworten zu Zielen, Umfang, Funktionen, aktueller Situation, Zeitrahmen und Projektstand,",
                "individuelle Ergänzungen, einschließlich Angaben unter „Sonstiges“,",
                "gegebenenfalls die Adresse einer bestehenden Website oder der Name eines bestehenden Systems,",
                "Name, Unternehmen, E-Mail-Adresse, Telefonnummer und bevorzugter Kontaktweg,",
                "die Kenntnisnahme der Datenschutzhinweise sowie",
                "Zeitpunkt und technische Referenz der Anfrage.",
              ]}
            />
            <p>
              Die Eingaben werden im Browser als strukturierter Formularzustand geführt und vor der
              weiteren Verarbeitung auf dem Server validiert und normalisiert. Es besteht keine
              eigene Formulardatenbank. Nach erfolgreicher Prüfung wird die vollständige Anfrage als
              E-Mail versendet.
            </p>
            <p>Die Verarbeitung erfolgt</p>
            <LegalList
              items={[
                "zur Vorbereitung und Bearbeitung einer konkreten Projekt- oder Vertragsanbahnung gemäß Art. 6 Abs. 1 lit. b DSGVO oder",
                "bei sonstiger geschäftlicher Kommunikation aufgrund meines berechtigten Interesses an der Bearbeitung und Beantwortung von Anfragen gemäß Art. 6 Abs. 1 lit. f DSGVO.",
              ]}
            />
            <p>
              Die als erforderlich gekennzeichneten Angaben werden benötigt, um die Anfrage über das
              Formular bearbeiten und beantworten zu können. Optionale Angaben sind freiwillig.
              Alternativ können Sie mich per E-Mail oder Telefon kontaktieren.
            </p>
            <p>
              Die Bestätigung der Datenschutzhinweise dokumentiert ausschließlich deren
              Kenntnisnahme. Sie stellt keine datenschutzrechtliche Einwilligung dar.
            </p>
            <p>
              Die Projektangaben werden nicht automatisiert bewertet, bepunktet oder zur Profilbildung
              verwendet. Eine automatisierte Entscheidung im Sinne des Art. 22 DSGVO findet nicht
              statt. Automatisierte Prüfungen dienen ausschließlich dem technischen Missbrauchsschutz.
            </p>
          </LegalSection>

          <LegalSection id="turnstile-missbrauchsschutz" heading="9. Cloudflare Turnstile und Missbrauchsschutz">
            <p>
              Zum Schutz der Projektanfrage vor automatisierten Eingaben, Spam und missbräuchlicher
              Nutzung wird Cloudflare Turnstile eingesetzt. Beim Aufruf des betreffenden
              Formularschritts wird hierfür ein Skript von{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5 text-[0.9em]">
                challenges.cloudflare.com
              </code>{" "}
              geladen. Die Sicherheitsprüfung wird anschließend serverseitig über den
              Siteverify-Dienst von Cloudflare bestätigt.
            </p>
            <p>Hierbei können insbesondere verarbeitet werden:</p>
            <LegalList
              items={[
                "IP-Adresse und technische Verbindungsdaten,",
                "TLS-Fingerprint, User-Agent und weitere Browser-, Geräte- und Sicherheitssignale,",
                "Sitekey und zugehöriger Ursprung,",
                "ein clientseitig erzeugter Prüf-Token,",
                "Prüfergebnis, Hostname und Formularaktion sowie",
                "eine technische Anfrage- beziehungsweise Idempotenzreferenz.",
              ]}
            />
            <p>
              Zusätzlich verwendet das Formular ein unsichtbares Honeypot-Feld, signierte
              Start-Tokens, zeitliche Plausibilitätsprüfungen, einen Schutz vor Mehrfachversand sowie
              eine bei Cloudflare eingerichtete Rate-Limiting-Regel auf Netzwerkebene. Diese
              Maßnahmen dienen ausschließlich dazu, missbräuchliche oder automatisierte Anfragen zu
              erkennen und abzuweisen.
            </p>
            <p>
              Rechtsgrundlage für die Verarbeitung personenbezogener Daten ist Art. 6 Abs. 1 lit. f
              DSGVO. Mein berechtigtes Interesse liegt in der Sicherheit und Funktionsfähigkeit des
              Anfrageformulars sowie der Vermeidung von Spam und Missbrauch.
            </p>
            <p>
              Soweit Turnstile für diesen Sicherheitszweck technisch unbedingt erforderliche
              Informationen auf Ihrer Endeinrichtung speichert oder daraus ausliest, erfolgt der
              Zugriff auf Grundlage von § 25 Abs. 2 Nr. 2 TDDDG. Diese Einordnung bezieht sich nur auf
              technisch unbedingt erforderliche Zugriffe im konkret eingesetzten Verfahren.
            </p>
            <p>
              Cloudflare verarbeitet die Signale zur Bereitstellung des Turnstile-Dienstes als
              Auftragsverarbeiter und kann sie nach eigenen Angaben zusätzlich in eigener
              Verantwortlichkeit zur Verbesserung der Bot-Erkennung verarbeiten. Daten können dabei
              auch außerhalb der Europäischen Union verarbeitet werden. Für Datenübermittlungen gelten
              die im Abschnitt zu Hosting und Content Delivery genannten Garantien.
            </p>
            <p>
              Weitere Informationen finden Sie in der{" "}
              <a href="https://www.cloudflare.com/turnstile-privacy-policy/" className={linkClass} {...externalLinkProps}>
                Datenschutzerklärung zu Cloudflare Turnstile
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection id="brevo" heading="10. E-Mail-Versand über Brevo">
            <p>
              Die Projektanfrage wird nicht unmittelbar aus Ihrem Browser per E-Mail versendet. Nach
              erfolgreicher serverseitiger Prüfung wird die Brevo Transactional API für den Versand
              verwendet. Dienstleister ist die im Brevo-Konto beziehungsweise im
              Auftragsverarbeitungsvertrag ausgewiesene Gesellschaft der Brevo-Gruppe.
            </p>
            <p>Dabei werden zwei E-Mails versendet:</p>
            <LegalList
              items={[
                "die vollständige interne Projektanfrage an hallo@loriz.digital und",
                "eine kurze Eingangsbestätigung an die von Ihnen angegebene E-Mail-Adresse, ohne vollständige Wiederholung Ihrer Projektangaben.",
              ]}
            />
            <p>
              Ihre zuvor validierte E-Mail-Adresse wird ausschließlich als Reply-To-Adresse der
              internen Nachricht verwendet. Brevo verarbeitet für den Versand insbesondere Absender,
              Empfänger, Reply-To, Betreff, Nachrichteninhalt, Referenznummer sowie technische
              Versand-, Zustell- und Sicherheitsinformationen.
            </p>
            <p>
              Nach der aktuellen Kontoeinstellung werden Transaktionslogs für einen Monat gespeichert.
              Vollständige E-Mail-Vorschauen werden im Brevo-Konto nicht gespeichert. Brevo verarbeitet
              den Nachrichteninhalt dennoch technisch, soweit dies für den Versand erforderlich ist.
            </p>
            <p>
              Das anonymisierte Öffnungs- und Klicktracking ist aktiviert. Brevo kann daher Öffnungs-
              und Klickereignisse technisch erfassen. Nach der aktuellen Einstellung werden diese
              Ereignisse anonymisiert verarbeitet und nicht einzelnen Empfängern zugeordnet. Es findet
              keine individuelle Auswertung oder Profilbildung anhand dieser Ereignisse statt.
            </p>
            <p>
              Soweit das Öffnungs- oder Klicktracking Informationen auf einer Endeinrichtung speichert
              oder daraus ausliest, richtet sich die Zulässigkeit dieses Zugriffs zusätzlich nach § 25
              TDDDG. Die Kenntnisnahme der Datenschutzhinweise im Anfrageformular ist keine
              Einwilligung in ein E-Mail-Tracking.
            </p>
            <p>
              Die Verarbeitung erfolgt zur Bearbeitung konkreter Projekt- und Vertragsanbahnungen gemäß
              Art. 6 Abs. 1 lit. b DSGVO beziehungsweise bei sonstiger geschäftlicher Kommunikation auf
              Grundlage meines berechtigten Interesses an einem zuverlässigen und nachvollziehbaren
              Nachrichtenversand gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </p>
            <p>
              Brevo wird für den Transaktionsversand als Auftragsverarbeiter eingesetzt. Die
              Verarbeitung erfolgt auf Grundlage eines Auftragsverarbeitungsvertrags nach Art. 28
              DSGVO, der Bestandteil der vereinbarten Nutzungsbedingungen ist. Abhängig von der im
              Vertrag ausgewiesenen Gesellschaft und den eingesetzten Unterauftragnehmern können Daten
              auch in Drittländern verarbeitet werden. In diesem Fall sind die Garantien der Art. 44
              ff. DSGVO, insbesondere Angemessenheitsbeschlüsse oder Standardvertragsklauseln,
              maßgeblich.
            </p>
            <p>
              Weitere Informationen finden Sie in der{" "}
              <a href="https://www.brevo.com/legal/privacypolicy/" className={linkClass} {...externalLinkProps}>
                Datenschutzerklärung von Brevo
              </a>{" "}
              sowie in den{" "}
              <a href="https://www.brevo.com/legal/termsofuse/" className={linkClass} {...externalLinkProps}>
                Nutzungsbedingungen von Brevo
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection id="kommunikation-per-e-mail" heading="11. Kommunikation per E-Mail (iCloud Mail)">
            <p>
              Für den Empfang der internen Projektanfrage sowie für die anschließende persönliche
              Kommunikation verwende ich iCloud Mail mit einer eigenen E-Mail-Domain.
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
              Die über das Anfrageformular übermittelte interne Projektanfrage wird über Brevo an
              mein Postfach{" "}
              <a href="mailto:hallo@loriz.digital" className={linkClass}>
                hallo@loriz.digital
              </a>{" "}
              zugestellt und dort in iCloud Mail gespeichert. Die Nachricht enthält die Projekt- und
              Kontaktdaten, den bevorzugten Kontaktweg und eine technische Referenznummer. Die
              validierte E-Mail-Adresse wird als Reply-To verwendet. Wenn Sie mir direkt eine E-Mail
              senden oder ich Ihre Anfrage beantworte, verarbeitet Apple ebenfalls die für
              Zustellung und Speicherung erforderlichen Daten. Hierzu gehören insbesondere:
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

          <LegalSection id="einbindung-von-referenzprojekten" heading="12. Einbindung von Referenzprojekten">
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

          <LegalSection id="cookies" heading="13. Cookies und Zugriffe auf Endeinrichtungen">
            <p>
              Diese Website verwendet keine Cookies zu Werbe-, Marketing- oder
              Profilbildungszwecken.
            </p>
            <p>
              Im Zusammenhang mit Cloudflare und Turnstile können technisch erforderliche
              Informationen auf Ihrer Endeinrichtung gespeichert oder daraus ausgelesen werden,
              soweit dies für die sichere Bereitstellung der Website und den Schutz des
              Anfrageformulars unbedingt erforderlich ist.
            </p>
            <p>
              Der Zugriff auf die Endeinrichtung erfolgt in diesen Fällen auf Grundlage von § 25 Abs.
              2 Nr. 2 TDDDG. Die anschließende Verarbeitung personenbezogener Daten erfolgt auf
              Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Eine pauschale Einordnung anderer oder
              zukünftiger Zugriffe ist damit nicht verbunden.
            </p>
          </LegalSection>

          <LegalSection id="speicherdauer" heading="14. Speicherdauer">
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
            <p>Für die Projektanfrage gilt ergänzend:</p>
            <LegalList
              items={[
                "Die Antworten werden im Browser nur im laufenden Formularzustand gehalten und nicht in einer eigenen Formulardatenbank gespeichert.",
                "Die interne Projektanfrage wird im iCloud-Postfach gespeichert und nach abgeschlossener Bearbeitung gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten oder Interessen an der Rechtsverteidigung entgegenstehen.",
                "Brevo-Transaktionslogs werden nach der aktuellen Kontoeinstellung für einen Monat gespeichert; vollständige E-Mail-Vorschauen werden im Brevo-Konto nicht gespeichert.",
                "Signierte Start-Tokens sind zeitlich begrenzt und werden ohne eigene serverseitige Token-Datenbank geprüft.",
                "Sicherheits- und Turnstile-Daten werden nach den für die eingesetzten Cloudflare-Dienste geltenden Vertrags- und Produkteinstellungen verarbeitet.",
              ]}
            />
            <p>Anschließend werden die Daten gelöscht.</p>
          </LegalSection>

          <LegalSection id="empfaenger-personenbezogener-daten" heading="15. Empfänger personenbezogener Daten">
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
              items={[
                "Cloudflare einschließlich Cloudflare Turnstile,",
                "die im Brevo-Konto beziehungsweise im Auftragsverarbeitungsvertrag ausgewiesene Gesellschaft der Brevo-Gruppe,",
                "Apple Distribution International Limited (iCloud Mail),",
                "jeweilige Unterauftragnehmer sowie",
                "IT-, Hosting- und Infrastrukturpartner.",
              ]}
            />
            <p className="italic text-muted-foreground">
              Soweit für eingesetzte Dienstleister gesetzlich erforderlich, werden die
              datenschutzrechtlich notwendigen vertraglichen Vereinbarungen geschlossen.
            </p>
          </LegalSection>

          <LegalSection id="ihre-rechte" heading="16. Ihre Rechte">
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

          <LegalSection id="beschwerderecht" heading="17. Beschwerderecht">
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

          <LegalSection id="widerspruchsrecht" heading="18. Widerspruchsrecht">
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

          <LegalSection id="datensicherheit" heading="19. Datensicherheit">
            <p>Diese Website verwendet eine SSL- beziehungsweise TLS-Verschlüsselung.</p>
            <p>Dadurch werden übermittelte Daten während der Übertragung geschützt.</p>
            <p>
              Eine verschlüsselte Verbindung erkennen Sie an der Adresszeile Ihres Browsers (
              <code className="rounded bg-surface-muted px-1.5 py-0.5 text-[0.9em]">https://</code>)
              sowie am Schloss-Symbol.
            </p>
          </LegalSection>

          <LegalSection id="aenderungen" heading="20. Änderungen dieser Datenschutzerklärung">
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
