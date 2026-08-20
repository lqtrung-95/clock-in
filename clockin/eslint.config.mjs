import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Raw Tailwind palette usage the design system migration is burning down.
// Matches bg-blue-500, text-cyan-400, from-purple-500, etc. — the standard
// Tailwind color families at any shade — but not semantic tokens like
// bg-surface-raised or text-data-focus.
const RAW_PALETTE_SRC =
  "\\b(bg|text|border|from|via|to|ring|fill|stroke|shadow|divide|outline|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\\b";

// Directories where the "calm & focused" chrome rules don't apply — the
// immersive focus session, the dream-goal 3D scenes, and marketing surfaces
// are where the app's visual drama is allowed to live.
const EXPRESSIVE_SURFACES = [
  "src/components/focus/**",
  "src/components/dream-goal/**",
  "src/components/landing/**",
  "src/app/opengraph-image.tsx",
  "src/app/page.tsx",
  "src/app/pricing/**",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Design-system rules. Warn, not error, until Phase 6 flips this — 241
  // raw blue-* + 150 cyan-* usages exist at the time these rules were
  // written and would otherwise red-wall every build mid-migration.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**", ...EXPRESSIVE_SURFACES],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: `Literal[value=/${RAW_PALETTE_SRC}/]`,
          message: "Use a semantic token (bg-surface-raised, text-ink-muted, text-data-focus, ...) instead of a raw Tailwind color.",
        },
        {
          selector: `TemplateElement[value.raw=/${RAW_PALETTE_SRC}/]`,
          message: "Use a semantic token instead of a raw Tailwind color.",
        },
        {
          selector: "Literal[value=/bg-gradient-to-/]",
          message: "Gradients are reserved for the focus session and dream-goal scenes.",
        },
        {
          selector: "Literal[value=/(^|\\s)transition-all(\\s|$)/]",
          message: "Transition specific properties (transition-colors, transition-[width], ...), not transition-all.",
        },
        {
          selector: "Literal[value=/(^|\\s)rounded-(2xl|3xl)(\\s|$)/]",
          message: "Use rounded-xs|sm|md|lg|full — see the radius scale in globals.css.",
        },
        {
          selector: "JSXOpeningElement[name.name='h1']",
          message: "Only PageHeader (src/components/ui-app/page-header.tsx) may render <h1>.",
        },
      ],
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/components/ui/card"],
              message: "Use <DataCard> from @/components/ui-app/data-card instead of the raw shadcn Card.",
            },
          ],
        },
      ],
    },
  },

  // page-header.tsx is the one file allowed to render <h1>.
  {
    files: ["src/components/ui-app/page-header.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
]);

export default eslintConfig;
