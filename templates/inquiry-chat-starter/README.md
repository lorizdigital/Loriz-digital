# Wiederverwendbarer Anfrage-Chat

Dieses Starter-Kit enthält das neutrale Grundkonstrukt für eine geführte Kontaktaufnahme. Es enthält keine kunden- oder projektspezifischen Unternehmens-, Personen-, Domain- oder E-Mail-Daten.

## Enthalten

- verzweigte Gesprächsabläufe
- Einzel- und Mehrfachauswahl
- exklusive Antworten wie „Noch nicht sicher“
- bedingte Folgefragen mit `visibleWhen`
- Freitext, URL-Felder und „Sonstiges“-Ergänzungen
- Kontakt- und Datenschutzdaten
- validierte, neutrale Nutzlast über `buildInquiryPayload`
- zentrale Texte und Kundenkonfiguration in einer Datei

Der wiederverwendbare Kern liegt in `src/lib/inquiry-kit`. Die Datei `inquiry.config.ts` ist das neutrale Kundenbeispiel.

## Übernahme in ein Kundenprojekt

1. Den Ordner `src/lib/inquiry-kit` in das Zielprojekt kopieren.
2. `inquiry.config.ts` in den Kundenbereich kopieren und Fragen, Texte, Pfade und Auswahlwerte anpassen.
3. Eine React-Oberfläche mit der Konfiguration verbinden. Die vorhandenen Komponenten unter `src/components/inquiry` können als Designreferenz dienen; Logo, Avatar, Farben und Texte müssen pro Kunde ersetzt werden.
4. Den API-Endpunkt aus `config.endpoint` bereitstellen und die von `buildInquiryPayload` erzeugte Nutzlast serverseitig erneut validieren.
5. Einen Versandadapter anbinden. Das aktuelle Projekt nutzt Brevo; andere Anbieter können denselben Payload verarbeiten.
6. `.env.example` übernehmen, ausschließlich mit kundeneigenen Werten befüllen und Secrets niemals committen.
7. Datenschutzhinweise, Empfänger, Auftragsverarbeitung, Löschfristen und Bot-Schutz für das konkrete Kundenprojekt rechtlich und technisch prüfen.

## Bewusste Trennung

Der Kern ist „headless“ und enthält kein festes Branding oder Styling. So bleibt die aufwendige Ablaufsteuerung wiederverwendbar, während die Oberfläche zum jeweiligen Corporate Design passt. Brevo, Cloudflare Turnstile und das Rate Limiting sind technische Adapter des aktuellen Projekts und werden nicht als zwingender Bestandteil des neutralen Kerns festgeschrieben.

## Produktionshinweise

- Client-Validierung ersetzt keine Server-Validierung.
- Ein In-Memory-Rate-Limit reicht bei verteilten Serverless-/Edge-Deployments nicht aus.
- Origin, Hostname und Challenge-Action müssen zusammenpassen.
- Absenderdomains müssen beim jeweiligen E-Mail-Anbieter verifiziert sein.
- Vor dem Einsatz mindestens Happy Path, bedingte Fragen, Zurücknavigation, Doppelklick/Idempotenz, Fehler beim Versand und mobile Darstellung testen.
