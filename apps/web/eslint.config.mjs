import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([...nextVitals,...nextTs,globalIgnores([
  ".next/**","out/**","build/**","next-env.d.ts","playwright-report/**","test-results/**",
  // Standard TypeScript libraries shipped as training assets, not application source.
  "public/practice/typescript/lib.*.d.ts",
])]);
