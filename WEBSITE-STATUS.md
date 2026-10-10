# Website-Status

Diese Datei hält fest, wo das Projekt steht. Der Skill `website-bauen` liest sie bei jedem Aufruf und macht dort weiter.

Status: ✅ erledigt · 🔄 läuft · ⬜ offen · ➖ außerhalb des Skills entstanden

| Phase | Name | Status | Datum |
|---|---|---|---|
| 0 | Einrichten | ➖ | |
| 1 | Fundament | ➖ | |
| 2 | Recherche | ⬜ keine Keyword-Recherche mit Zahlen | |
| 3 | Texte | ➖ Texte liegen im Code, kein `texte.md` | |
| 4 | Design-Richtung | ➖ | |
| 5 | Bauen | ➖ | |
| 6 | Prüfen und Feinschliff | ➖ | |
| 7 | Livegang | ✅ SEO-Technik, Seite live | 10.10.2026 |
| 8 | Danach | 🔄 Search Console eingerichtet | 10.10.2026 |

Die Seite wurde vor dem Skill gebaut. Eingestiegen am 10.10.2026 in Phase 7 mit Schwerpunkt Google und Search Console.

## Ausgangslage

- Bestehende Website: https://loriz.digital, Next.js (App Router) über OpenNext auf Cloudflare Workers
- Hauptziel der Seite: Projektanfragen von Handwerksbetrieben, kleinen Unternehmen und Selbstständigen
- Hosting: Cloudflare Workers, DNS bei Cloudflare
- Formular: geführte Projektanfrage, `/api/project-inquiries` → Brevo, Spamschutz mit Turnstile, Rate-Limit als Cloudflare-WAF-Regel
- Werkzeuge: impeccable ✅ · Playwright ✅ · DataForSEO ⬜ · Hosting-MCP ➖ (Deploy per Push) · Formular-Ziel ✅

## Entscheidungen

- 10.10.2026: Seitentitel führt mit Region Kassel: „Webseiten für Handwerk & kleine Unternehmen in Kassel | Loriz Digital“. Die große Überschrift bleibt der Slogan.
- 10.10.2026: Einsatzgebiet in den strukturierten Daten: Kassel und Landkreis Kassel.
- 10.10.2026: Vertrauenszeile lautet „Aus Calden bei Kassel – persönlich statt anonym“.
- 10.10.2026: Hero-Überschrift blendet per CSS ab dem ersten Paint ein statt nach der Hydrierung.

## Stand SEO und GEO (10.10.2026)

- Titel, Beschreibung, Canonical, Open Graph, Vorschaubild 1200 × 630, robots.txt, sitemap.xml, llms.txt, strukturierte Daten (`WebSite` und `ProfessionalService`) vorhanden.
- Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot und PerplexityBot erhalten Status 200.
- Lighthouse Handy vorher: Performance 79, Barrierefreiheit 92, Best Practices 100, SEO 100.
- Lighthouse Handy nachher (live): Performance 77 bis 87 (schwankt), Barrierefreiheit 100, Best Practices 100, SEO 100. Lighthouse rechnet das LCP hoch (3,8 s). Im echten Lauf malt Chrome die Überschrift beim ersten Paint (0,9 s, bei vierfach gedrosselter CPU 0,3 s statt vorher 3,0 s).
- Startseite kommt aus dem Cache (`x-nextjs-cache: HIT`), keine Cookies beim Laden, einziger Fremdhost ist `static.cloudflareinsights.com` (Cloudflare Web Analytics, in der Datenschutzerklärung genannt).
- Search Console: Domain-Eigenschaft `sc-domain:loriz.digital` bestätigt (TXT-Eintrag im Cloudflare-DNS). Startseite ist indexiert. Sitemap am 10.10.2026 eingereicht, Indexierung der Startseite neu beantragt.

## Offene Punkte

- [ ] Search Console in zwei bis drei Tagen ansehen: Die Sitemap stand direkt nach dem Einreichen auf „Konnte nicht abgerufen werden“, obwohl sie für Googlebot Status 200 liefert. Das ist bei neuen Properties üblich, sollte sich aber auf „Erfolgreich“ ändern.
- [ ] Cloudflare: „Always Use HTTPS“ einschalten (SSL/TLS → Edge-Zertifikate). `http://loriz.digital` liefert bisher Status 200 statt einer Umleitung.
- [ ] Bing Webmaster Tools: Seite aus der Search Console importieren.
- [ ] Google-Unternehmensprofil für Loriz Digital anlegen oder prüfen. Für lokale Suchen in Kassel ist das der größte Hebel.
- [ ] Profile (LinkedIn, Instagram usw.) mit denselben Fakten abgleichen und danach als `sameAs` in die strukturierten Daten aufnehmen.
- [ ] Nachmessung in drei bis vier Wochen: Suchbegriffe und Positionen in der Search Console, Indexierung, Anfragen.

## Update-Ablauf nach dem Livegang

1. Änderung im Code
2. `npm run lint`, `npm test`, `npm run build`
3. Optional lokal prüfen: `npx opennextjs-cloudflare build`, dann `npx opennextjs-cloudflare preview` (Port 8787)
4. Push auf `main`: Cloudflare Workers Builds baut und deployt automatisch
5. Live prüfen: `curl -I https://loriz.digital/` (Header `x-nextjs-cache: HIT`), Seite ansehen
