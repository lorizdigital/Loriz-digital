// Wiederverwendbares Mobil-Screenshot-Skript.
//
// Öffnet eine URL im echten Mobilmodus (Viewport, Touch, Device-Scale-Factor)
// und speichert genau den sichtbaren Viewport – keine vollständige Seite,
// keine Browserleiste – als optimiertes WebP.
//
// Aufruf mit Standardwerten (Einzelstück by Elisa):
//   npm run capture:einzelstueck
//
// Aufruf mit eigenen Werten (für weitere Projekte wiederverwendbar):
//   node scripts/capture-mobile-screenshot.mjs <url> <ausgabe.webp>

import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_URL = "https://einzelstueckbyelisa.de";
const DEFAULT_OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "projects",
  "einzelstueck-by-elisa-mobile.webp",
);

const targetUrl = process.argv[2] ?? DEFAULT_URL;
const outputPath = path.resolve(process.argv[3] ?? DEFAULT_OUTPUT);

const VIEWPORT = { width: 390, height: 844 };
const DEVICE_SCALE_FACTOR = 3;

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
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    isMobile: true,
    hasTouch: true,
  });
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

    console.log(`✓ ${path.relative(process.cwd(), outputPath)}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
