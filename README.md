# Loriz Digital

Website von Loriz Digital auf Basis von Next.js (App Router), React und TypeScript.

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local
npm run dev
```

Anschließend ist die Website standardmäßig unter
[http://localhost:3000](http://localhost:3000) erreichbar. Die Seiten liegen unter
`src/app`, wiederverwendbare Komponenten unter `src/components`.

## Qualitätsprüfung

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Die Playwright-Screenshot-Skripte werden ausschließlich manuell und bei Bedarf
ausgeführt.

## Deployment

Die produktive Website läuft über Cloudflare Workers. Die versionierten
Einstellungen befinden sich in `wrangler.jsonc` und `open-next.config.ts`; die
zugehörigen Build- und Deploymentbefehle sind in `package.json` definiert.
Runtime-Secrets werden ausschließlich als geschützte Cloudflare-Variablen
verwaltet und gehören nicht in das Repository.

Die für den Anfrage-Chat benötigten Variablen sind in `.env.example`
dokumentiert. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` muss bereits während des
Produktions-Builds verfügbar sein; die übrigen Werte werden ausschließlich
serverseitig zur Laufzeit benötigt. Produktionsschlüssel gehören nur in die
geschützten Cloudflare-Variablen und niemals in das Repository.
