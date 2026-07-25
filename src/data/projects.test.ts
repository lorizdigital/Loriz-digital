import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "./projects";

const PUBLIC_DIR = path.join(process.cwd(), "public");

describe("projects", () => {
  it("contains at least one reference", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("uses unique titles as stable render keys", () => {
    const titles = projects.map((project) => project.title);

    expect(new Set(titles).size).toBe(titles.length);
  });

  it.each(projects)("$title has complete content", (project) => {
    expect(project.title.trim()).not.toBe("");
    expect(project.alt.trim()).not.toBe("");
    expect(project.description.trim()).not.toBe("");
    expect(project.highlights.length).toBeGreaterThan(0);
    expect(project.highlights.every((highlight) => highlight.trim() !== "")).toBe(true);
  });

  it.each(projects)("$title links to an external https url", (project) => {
    const url = new URL(project.url);

    expect(url.protocol).toBe("https:");
  });

  // Fehlende Bilder fallen sonst erst im Browser auf, weil `next/image`
  // die Pfade nicht zur Buildzeit prüft.
  it.each(projects)("$title references existing preview images", (project) => {
    for (const image of [project.desktopImage, project.mobileImage]) {
      expect(image.startsWith("/")).toBe(true);
      expect(existsSync(path.join(PUBLIC_DIR, image))).toBe(true);
    }
  });
});
