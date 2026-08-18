// Wiederverwendbares Screenshot-Skript für Referenzprojekte.
//
// Öffnet eine URL und speichert genau den sichtbaren Viewport – keine
// vollständige Seite, keine Browserleiste – als optimiertes WebP.
//
// Die beiden Voreinstellungen liefern exakt die Maße, die der Coverflow
// erwartet (siehe src/components/ProjectCoverflow.tsx):
//   --mobile   390x844  bei Device-Scale-Factor 3  ->  1170x2532
//   --desktop  1440x1540 bei Device-Scale-Factor 1 ->  1440x1540
//
// Aufruf:
//   node scripts/capture-screenshot.mjs <url> <ausgabe.webp> [--mobile|--desktop]
//
// Ohne Angabe wird --mobile verwendet. Beispiel für ein neues Projekt:
//   node scripts/capture-screenshot.mjs https://example.de public/projects/example-desktop.webp --desktop
//   node scripts/capture-screenshot.mjs https://example.de public/projects/example-mobile.webp

import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PRESETS = {
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  desktop: {
    viewport: { width: 1440, height: 1540 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
};

const DEFAULT_URL = "https://einzelstueckbyelisa.de";
const DEFAULT_OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "projects",
  "einzelstueck-by-elisa-mobile.webp",
);

const args = process.argv.slice(2);
const presetFlag = args.find((arg) => arg.startsWith("--"))?.replace(/^--/, "");
const positional = args.filter((arg) => !arg.startsWith("--"));

if (presetFlag && !(presetFlag in PRESETS)) {
  console.error(`Unbekannte Voreinstellung "--${presetFlag}". Erlaubt: --mobile, --desktop`);
  process.exit(1);
}

const preset = PRESETS[presetFlag ?? "mobile"];
const targetUrl = positional[0] ?? DEFAULT_URL;
const outputPath = path.resolve(positional[1] ?? DEFAULT_OUTPUT);

async function waitForVisibleImages(page, timeoutMs) {
  // Nur Bilder abwarten, die aktuell im Viewport sichtbar sind. Weiter unten
  // liegende loading="lazy"-Bilder werden von Chromium sonst nie ausgelöst
  // und würden ein Promise.all über *alle* document.images unbegrenzt
  // blockieren – zusätzlich mit Zeitlimit abgesichert.
  const waitPromise = page.evaluate(async () => {
    const isInViewport = (img) => {
      const rect = img.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };
    const images = Array.from(document.images).filter(isInViewport);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }),
    );
  });

  await Promise.race([waitPromise, page.waitForTimeout(timeoutMs)]);
}

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext(preset);
  const page = await context.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: "load", timeout: 30_000 });

    // networkidle ist nicht auf jeder Seite zuverlässig (z. B. bei
    // dauerhaften Analytics-Verbindungen) – daher best effort, nicht fatal.
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    await page.evaluate(() => document.fonts.ready);

    // Kurz minimal scrollen, um Intersection-Observer-Animationen und
    // knapp unterhalb der Faltkante liegende Lazy-Bilder auszulösen –
    // danach zurück an den Seitenanfang und das Layout beruhigen lassen.
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);

    await waitForVisibleImages(page, 6_000);

    const tempPngPath = `${outputPath}.tmp.png`;
    await page.screenshot({ path: tempPngPath, type: "png" });

    await sharp(tempPngPath).webp({ quality: 82 }).toFile(outputPath);
    await unlink(tempPngPath);

    const { width, height } = await sharp(outputPath).metadata();
    console.log(`✓ ${path.relative(process.cwd(), outputPath)} (${width}x${height})`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
