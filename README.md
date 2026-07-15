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

Die produktive Website läuft über Cloudflare Workers. Build-Einstellungen und
Runtime-Secrets werden derzeit im Cloudflare-Projekt verwaltet; im Repository
liegt keine eigenständige Wrangler- oder OpenNext-Deploymentkonfiguration.
Änderungen an diesem Deploymentweg müssen deshalb zuerst mit der tatsächlich in
Cloudflare hinterlegten Konfiguration abgeglichen werden.

Die für den Anfrage-Chat benötigten Variablen sind in `.env.example`
dokumentiert. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` muss bereits während des
Produktions-Builds verfügbar sein; die übrigen Werte werden ausschließlich
serverseitig zur Laufzeit benötigt. Produktionsschlüssel gehören nur in die
geschützten Cloudflare-Variablen und niemals in das Repository.
