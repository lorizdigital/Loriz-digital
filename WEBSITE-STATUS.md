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
| 8 | Danach | 🔄 Search Console, Bing, Profil-Abgleich vorbereitet | 10.10.2026 |

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
- 10.10.2026: Wiesenweg 23 ist eine reine Wohnadresse. Adresse in Google, Bing und Verzeichnissen ausblenden, nur Einzugsgebiet zeigen. Apple Karten entfällt.
- 10.10.2026: Auf der Website werden nur Geschäftsprofile verknüpft, keine privaten Konten.
- Eröffnungsdatum laut Google-Unternehmensprofil: August 2026.
- 11.10.2026: Prüfung auf Cookies und AGB (Phase 7, Schritt 2) nachgeholt. Kein Cookie-Banner und keine AGB nötig, weil über die Seite nichts verkauft oder gebucht wird.
- 11.10.2026: Bot Fight Mode in Cloudflare bleibt an. Das Cookie `cf_clearance` aus der Bot-Erkennung steht in der Datenschutzerklärung (Abschnitt 11).
- 11.10.2026: Cloudflare Web Analytics für loriz.digital deaktiviert. Zahlen zur Suche kommen aus der Search Console.
- 11.10.2026: Besucher bekommen keine Eingangsbestätigung per E-Mail mehr. Brevo lässt das Tracking in Transaktionsmails nicht abschalten, der Schalter wählt nur zwischen anonym und pro Empfänger. Über Brevo geht nur noch die interne Mail an hallo@loriz.digital.

## Stand SEO und GEO (10.10.2026)

- Titel, Beschreibung, Canonical, Open Graph, Vorschaubild 1200 × 630, robots.txt, sitemap.xml, llms.txt, strukturierte Daten (`WebSite` und `ProfessionalService`) vorhanden.
- Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot und PerplexityBot erhalten Status 200.
- Lighthouse Handy vorher: Performance 79, Barrierefreiheit 92, Best Practices 100, SEO 100.
- Lighthouse Handy nachher (live): Performance 77 bis 87 (schwankt), Barrierefreiheit 100, Best Practices 100, SEO 100. Lighthouse rechnet das LCP hoch (3,8 s). Im echten Lauf malt Chrome die Überschrift beim ersten Paint (0,9 s, bei vierfach gedrosselter CPU 0,3 s statt vorher 3,0 s).
- Startseite kommt aus dem Cache (`x-nextjs-cache: HIT`).
- Cookies und fremde Dienste (gemessen am 11.10.2026): Beim Laden setzt Cloudflares Bot-Erkennung das Cookie `cf_clearance` (HttpOnly, ein Jahr gültig), sonst keine Cookies und kein lokaler Speicher. Seit dem Abschalten von Web Analytics lädt die Startseite nichts mehr von fremden Hosts. Turnstile (`challenges.cloudflare.com`) lädt erst im letzten Schritt der Projektanfrage. Schriften liegen auf dem eigenen Server.
- Search Console: Domain-Eigenschaft `sc-domain:loriz.digital` bestätigt (TXT-Eintrag im Cloudflare-DNS). Startseite ist indexiert. Sitemap am 10.10.2026 eingereicht, Indexierung der Startseite neu beantragt.

## Offene Punkte

- [ ] Search Console in zwei bis drei Tagen ansehen: Die Sitemap stand direkt nach dem Einreichen auf „Konnte nicht abgerufen werden“, obwohl sie für Googlebot Status 200 liefert. Das ist bei neuen Properties üblich, sollte sich aber auf „Erfolgreich“ ändern.
- [x] Cloudflare „Always Use HTTPS“ eingeschaltet (10.10.2026, geprüft: http und www leiten per 301 um).
- [ ] Cloudflare Web Analytics läuft noch auf wünschi.de, mitgefeiert.de und citycenterfriseur.de. Dort abschalten oder prüfen, ob die Datenschutzerklärung es nennt.
- [x] Bing Webmaster Tools: aus der Search Console importiert, Sitemap eingereicht (10.10.2026).
- [x] Google-Unternehmensprofil (zweites Google-Konto, in Chrome als authuser=1 angemeldet) am 10.10.2026 angepasst: Hauptkategorie Webdesigner, weitere Kategorie Softwareentwickler/-hersteller, neue Beschreibung, Einzugsgebiet Kassel, Landkreis Kassel, Calden (Hessen und Bad Wilhelmshöhe entfernt), vier eigene Leistungen mit Beschreibung, „Entwicklung von mobilen Apps“ entfernt. Google prüft die Änderungen (bis zu einem Tag).
- [ ] Google-Unternehmensprofil: Fotos ergänzen (letztes Foto 87 Tage alt), erste Kunden um Rezensionen bitten (bisher 0, Link über „Um Rezensionen bitten“).
- [ ] Profile abgleichen nach `recherche/profil-abgleich.md`: Instagram @loriz.digital, LinkedIn persönlich, LinkedIn-Unternehmensseite neu, Bing Places, Verzeichnisse (Das Örtliche, Gelbe Seiten, kennstdueinen, Bestenlisten).
- [x] `sameAs` (Instagram, GitHub, LinkedIn beim Gründer) und `hasMap` (Google-Profil) in den strukturierten Daten (10.10.2026). LinkedIn-Unternehmensseite nachtragen, sobald sie existiert.
- [x] mitgefeiert.de (10.10.2026 live): Vorschaubild und Favicon auf echter Domain, robots.txt und Sitemap, Impressum mit Loriz Digital und USt-IdNr.
- [ ] mitgefeiert.de in der Search Console anlegen und `https://mitgefeiert.de/sitemap.xml` einreichen.
- [x] wünschi.de (10.10.2026 live, dea4655): Impressum mit USt-IdNr. und „Ein Projekt von Loriz Digital“, Credit „Designed and developed by Loriz Digital“ im Footer der Startseite. Lokaler `main` dort enthält einen alten, nie gepushten Commit (02042b1), nicht pushen.
- [ ] GitHub: prüfen, ob die öffentlichen Repositories (u. a. Kundenprojekte) öffentlich bleiben sollen. Auch dieses Website-Repo und damit diese Datei sind öffentlich.
- [ ] Nachmessung am 31.10.2026 (Kalender „Arbeit“, 10:00). Ausgangsmessung in `recherche/keywords-geo.md`. Der Ordner `recherche/` ist über `.git/info/exclude` vom Repo ausgenommen.

## Update-Ablauf nach dem Livegang

1. Änderung im Code
2. `npm run lint`, `npm test`, `npm run build`
3. Optional lokal prüfen: `npx opennextjs-cloudflare build`, dann `npx opennextjs-cloudflare preview` (Port 8787)
4. Push auf `main`: Cloudflare Workers Builds baut und deployt automatisch
5. Live prüfen: `curl -I https://loriz.digital/` (Header `x-nextjs-cache: HIT`), Seite ansehen
