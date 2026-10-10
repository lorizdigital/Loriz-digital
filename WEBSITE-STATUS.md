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

## Stand SEO und GEO (10.10.2026)

- Titel, Beschreibung, Canonical, Open Graph, Vorschaubild 1200 × 630, robots.txt, sitemap.xml, llms.txt, strukturierte Daten (`WebSite` und `ProfessionalService`) vorhanden.
- Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot und PerplexityBot erhalten Status 200.
- Lighthouse Handy vorher: Performance 79, Barrierefreiheit 92, Best Practices 100, SEO 100.
- Lighthouse Handy nachher (live): Performance 77 bis 87 (schwankt), Barrierefreiheit 100, Best Practices 100, SEO 100. Lighthouse rechnet das LCP hoch (3,8 s). Im echten Lauf malt Chrome die Überschrift beim ersten Paint (0,9 s, bei vierfach gedrosselter CPU 0,3 s statt vorher 3,0 s).
- Startseite kommt aus dem Cache (`x-nextjs-cache: HIT`), keine Cookies beim Laden, einziger Fremdhost ist `static.cloudflareinsights.com` (Cloudflare Web Analytics, in der Datenschutzerklärung genannt).
- Search Console: Domain-Eigenschaft `sc-domain:loriz.digital` bestätigt (TXT-Eintrag im Cloudflare-DNS). Startseite ist indexiert. Sitemap am 10.10.2026 eingereicht, Indexierung der Startseite neu beantragt.

## Offene Punkte

- [ ] Search Console in zwei bis drei Tagen ansehen: Die Sitemap stand direkt nach dem Einreichen auf „Konnte nicht abgerufen werden“, obwohl sie für Googlebot Status 200 liefert. Das ist bei neuen Properties üblich, sollte sich aber auf „Erfolgreich“ ändern.
- [x] Cloudflare „Always Use HTTPS“ eingeschaltet (10.10.2026, geprüft: http und www leiten per 301 um).
- [x] Bing Webmaster Tools: aus der Search Console importiert (10.10.2026). Sitemap fehlt dort noch.
- [ ] Google-Unternehmensprofil (liegt in einem anderen Google-Konto): Hauptkategorie „Webdesigner“, Einzugsgebiet Kassel und Landkreis Kassel statt vermutlich Hessen, neue Beschreibung und Leistungen. Texte in `recherche/profil-abgleich.md`.
- [ ] Profile abgleichen nach `recherche/profil-abgleich.md`: Instagram @loriz.digital, LinkedIn persönlich, LinkedIn-Unternehmensseite neu, Bing Places, Verzeichnisse (Das Örtliche, Gelbe Seiten, kennstdueinen, Bestenlisten).
- [x] `sameAs` (Instagram, GitHub, LinkedIn beim Gründer) und `hasMap` (Google-Profil) in den strukturierten Daten (10.10.2026). LinkedIn-Unternehmensseite nachtragen, sobald sie existiert.
- [ ] Referenzprojekte: mitgefeiert.de (Vorschaubild zeigt auf localhost, robots.txt und Sitemap fehlen), wünschi.de (Link auf loriz.digital, USt-IdNr.).
- [ ] GitHub: prüfen, ob die öffentlichen Repositories (u. a. Kundenprojekte) öffentlich bleiben sollen. Auch dieses Website-Repo und damit diese Datei sind öffentlich.
- [ ] Nachmessung am 31.10.2026 (Kalender „Arbeit“, 10:00). Ausgangsmessung in `recherche/keywords-geo.md`. Der Ordner `recherche/` ist über `.git/info/exclude` vom Repo ausgenommen.

## Update-Ablauf nach dem Livegang

1. Änderung im Code
2. `npm run lint`, `npm test`, `npm run build`
3. Optional lokal prüfen: `npx opennextjs-cloudflare build`, dann `npx opennextjs-cloudflare preview` (Port 8787)
4. Push auf `main`: Cloudflare Workers Builds baut und deployt automatisch
5. Live prüfen: `curl -I https://loriz.digital/` (Header `x-nextjs-cache: HIT`), Seite ansehen
