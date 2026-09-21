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
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Non-source trees. These were passed as --ignore-pattern flags on the
    // lint script, where an unquoted `node_modules/**` got glob-expanded by
    // the shell before ESLint ever saw it and broke the run.
    "node_modules/**",
    "public/**",
    ".planning/**",
  ]),
]);

export default eslintConfig;
