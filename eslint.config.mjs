import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Arbeitsverzeichnisse von Agenten. `.claude` enthält eine vollständige
    // Worktree-Kopie des Repos – ohne diesen Ausschluss wird jede Datei ein
    // zweites Mal geprüft, gegen einen veralteten Stand.
    ".claude/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
