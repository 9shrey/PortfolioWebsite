import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The 3D scene must never fetch assets at runtime: no troika text (CDN
  // font fallback), no GLTF/font loaders, no HDR presets/files, no
  // camera-controls (it hijacks touch-action on the shell).
  {
    files: ["app/components/gl/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@react-three/drei",
              importNames: ["Text", "Text3D", "useGLTF", "Stage", "useFont", "CameraControls"],
              message: "Runtime-fetching / input-hijacking helpers are banned in the scene (spec §14).",
            },
          ],
          patterns: ["three/examples/jsm/loaders/TTFLoader*"],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name=/^(preset|files)$/]",
          message: "No Environment presets/files — they fetch HDRs from a CDN. Use <Lightformer> children.",
        },
      ],
    },
  },
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
    // Separate project checked out inside this folder; has its own tooling.
    "sales_agent_db/**",
  ]),
]);

export default eslintConfig;
