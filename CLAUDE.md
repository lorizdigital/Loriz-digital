## Screenshot-/Review-Workflow

Dieses Projekt enthält Playwright-basierte Skripte (`npm run review:screenshots`,
`npm run capture:einzelstueck`). Diese werden **ausschließlich manuell** auf
ausdrücklichen Wunsch des Nutzers ausgeführt.

- Führe diese Skripte NICHT automatisch nach normalen Änderungen aus.
- Sie sind kein Bestandteil der Standard-Abschlussprüfung.
- Standard-Abschlussprüfung nach Änderungen bleibt: Build (`npm run build`),
  TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`).
- Die Skripte und ihre npm-Einträge bleiben im Projekt erhalten, damit sie bei
  Bedarf jederzeit manuell ausgelöst werden können.
