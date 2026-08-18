import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Arbeitsverzeichnisse von Agenten ausschließen. `.claude` enthält eine
    // vollständige Worktree-Kopie des Repos; ohne diesen Ausschluss läuft
    // jeder Test zweimal, die zweite Hälfte gegen einen veralteten Stand.
    exclude: [...configDefaults.exclude, "**/.claude/**", "**/.agents/**"],
  },
});
