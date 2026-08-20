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
  "src/components/billing/pricing-page-content.tsx",
  "src/app/opengraph-image.tsx",
  "src/app/page.tsx",
  "src/app/pricing/**",
  // Route-level immersive views — full-bleed co-working room and the 3D
  // dream-goal canvas. `*` stands in for the `[id]` dynamic segment; literal
  // brackets are glob metacharacters in minimatch.
  "src/app/(app)/focus/rooms/*/page.tsx",
  "src/app/(app)/progress/dream/page.tsx",
  // Rasterized by html-to-image — must not depend on CSS custom properties,
  // which can resolve differently (or not at all) in the cloned off-screen
  // node the library captures.
  "src/components/stats/share-stats-card.tsx",
  "src/components/social/share-card.tsx",
  // Only ever rendered inside FocusSetupView (an exempt expressive
  // surface) — kept visually consistent with the screen it lives in.
  "src/components/ai/ai-session-suggestion.tsx",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Design-system rules, enforced. The migration these ran as "warn" during
  // is done — raw palette / gradients-in-chrome / transition-all are at
  // zero outside the exempted expressive surfaces (see EXPRESSIVE_SURFACES
  // above; a further per-line eslint-disable covers leaderboard.tsx's
  // gold/silver/bronze medal colors, a real-world convention, not slop).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**", ...EXPRESSIVE_SURFACES],
    rules: {
      "no-restricted-syntax": [
        "error",
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
      ],
    },
  },

  // Radius scale and the Card→DataCard migration are still in progress
  // across older files — warn until that burndown clears too.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**", ...EXPRESSIVE_SURFACES],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/(^|\\s)rounded-(2xl|3xl)(\\s|$)/]",
          message: "Use rounded-xs|sm|md|lg|full — see the radius scale in globals.css.",
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

  // The double-header bug this guards against only exists inside the app
  // shell, where PageShell owns the title — auth/landing/marketing pages
  // have no competing chrome, so a plain semantic <h1> there is fine.
  {
    files: ["src/app/(app)/**/*.{ts,tsx}"],
    ignores: [...EXPRESSIVE_SURFACES],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='h1']",
          message: "Only PageHeader (src/components/ui-app/page-header.tsx) may render <h1>.",
        },
      ],
    },
  },
]);

export default eslintConfig;
