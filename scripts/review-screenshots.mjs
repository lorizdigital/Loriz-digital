// Einfacher visueller Review-Workflow.
//
// Öffnet die lokal laufende Startseite (siehe `npm run dev`) mit Playwright
// und erzeugt vier PNG-Screenshots im Ordner `review-screenshots/`:
//   - desktop-full.png   – vollständige Desktop-Seite, 1440×1000
//   - mobile-full.png    – vollständige Mobilseite, 390×844
//   - desktop-hero.png   – Hero-Bereich auf Desktop
//   - mobile-hero.png    – Hero-Bereich auf Mobil
//
// Aufruf: npm run review:screenshots

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "review-screenshots");
const BASE_URL = process.env.REVIEW_BASE_URL ?? "http://localhost:3000";
const HERO_SELECTOR = "#start";

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

/**
 * Scrollt die Seite in Schritten bis zum Ende und wieder zurück nach oben.
 * Löst dadurch scrollbasierte Reveal-Animationen sowie `loading="lazy"`
 * Bilder/iframes aus, bevor der finale Screenshot entsteht.
 */
async function triggerScrollAndLazyContent(page) {
  const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));

  const steps = Math.max(1, Math.ceil(scrollHeight / viewportHeight));
  for (let step = 1; step <= steps; step += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), step * viewportHeight);
    await page.waitForTimeout(150);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
}

async function prepareStablePage(page) {
  // Reduzierte Bewegung: Framer-Motion-Übergänge und CSS-Animationen im
  // Projekt springen dadurch direkt in ihren Endzustand – deterministisch,
  // ohne auf Animationstiming warten zu müssen.
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(BASE_URL, { waitUntil: "load", timeout: 30_000 });

  // Vollständig geladene Fonts abwarten.
  await page.evaluate(() => document.fonts.ready);

  await triggerScrollAndLazyContent(page);

  // Nachlaufende Netzwerkaktivität (z. B. die eingebettete Live-Vorschau)
  // eine kurze Zeit lang tolerieren, aber den Lauf nicht blockieren.
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
}

async function captureViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport });

  try {
    await prepareStablePage(page);

    // Explizites Clipping statt `fullPage: true`: Chromium ermittelt die
    // Full-Page-Breite aus `scrollWidth`, der bei Sub-Pixel-Rundungen
    // während Animationen minimal über der Viewport-Breite liegen kann.
    // Mit einem festen Clip bleibt die Breite exakt wie angefordert.
    const contentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${name}-full.png`),
      fullPage: true,
      clip: { x: 0, y: 0, width: viewport.width, height: contentHeight },
      animations: "disabled",
    });
    console.log(`✓ ${name}-full.png`);

    await page.locator(HERO_SELECTOR).screenshot({
      path: path.join(OUTPUT_DIR, `${name}-hero.png`),
      animations: "disabled",
    });
    console.log(`✓ ${name}-hero.png`);
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  try {
    await captureViewport(browser, "desktop", viewports.desktop);
    await captureViewport(browser, "mobile", viewports.mobile);
  } catch (error) {
    if (error instanceof Error && /ERR_CONNECTION_REFUSED|net::ERR_/.test(error.message)) {
      console.error(
        `\nDie Seite unter ${BASE_URL} ist nicht erreichbar.\n` +
          "Bitte zuerst den Dev-Server in einem separaten Terminal starten: npm run dev\n",
      );
      process.exitCode = 1;
      return;
    }
    throw error;
  } finally {
    await browser.close();
  }

  console.log(`\nScreenshots gespeichert in: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
