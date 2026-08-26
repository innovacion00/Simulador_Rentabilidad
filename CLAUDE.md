# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A single-page Next.js (App Router) financial simulator for **Sunno Blue**, a vacation-home real estate project in Cartagena. Users pick a home typology, adjust ADR/occupancy/expense assumptions, and get a projected profitability report (KPIs, a detailed P&L-style table, scenario comparison, charts, and a downloadable PDF).

The entire app is one client component tree mounted from a single route (`src/app/page.tsx` → `Home`); there is no routing, no API layer, and no backend — all computation happens client-side in `src/lib`.

## Commands

```bash
npm run dev      # start dev server (Next.js, Turbopack)
npm run build    # production build
npm run start    # run production build
npm run lint      # eslint (flat config: eslint-config-next core-web-vitals + typescript)
```

There is no test suite/framework configured in this repo.

## Architecture

**`src/lib` is the financial model** — pure, framework-free TypeScript, and the part most likely to need care/correctness review:

- `types.ts` — `SimulatorInputs` (all user-editable form state), `SimulationResult` (full computed output incl. `table: FinancialLineItem[]`), `Typology`, `ScenarioResult`.
- `constants.ts` — the source data: per-typology base purchase values and ADR (derived from the price list PDF in the repo root), occupancy scenario presets (pesimista/conservador/optimista), scenario ADR increments, and `FINANCIAL_RATES` (default commission/expense percentages). Read the inline comments here before changing any figure — several values are explicitly marked as estimated/extrapolated rather than sourced from the official price list, with the reasoning documented next to them.
- `calculations.ts` — `runSimulation(inputs)` is the core entry point: converts currency, computes annual revenue (ADR × days × occupancy%), cascades servicios públicos cost across typology groups and scenarios (`calculateServiciosPublicosCOP`), applies commission/expense rates (`calculateCosts`), and builds the full line-item table (`buildTable`) used by both the UI table and the PDF export. `calculateScenario(key, inputs)` derives the three comparison scenarios by re-running `runSimulation` with scenario-specific ADR/occupancy.
- `validation.ts` — `validateInputs` / `isValid` gate whether results render (see `page.tsx`).
- `format.ts` — all `Intl.NumberFormat` currency/percent formatting and COP↔USD conversion; always go through these rather than formatting numbers inline.
- `summary.ts` — plain-text summaries used for the WhatsApp CTA link and share text.
- `pdf.ts` — `downloadSimulationPDF` builds the branded PDF client-side via `jspdf` + `jspdf-autotable` (dynamically imported), including a watermark image loaded from `/public` and re-encoded to JPEG on a canvas.

**`src/components`** are presentational, each owning one section of the page (`Hero`, `SimulatorForm`, `FormControls` (shared inputs: `ChipGroup`, `FieldShell`, `NumberInput`, `PillToggle`), `KPIResults`, `DetailedTable`, `ScenarioComparison`, `ChartsSection` (Recharts), `ExplanationSection`, `Disclaimer`, `FooterCTA`, `Logos`). All state lives in `Home` (`page.tsx`) as a single `SimulatorInputs` object; components receive `inputs`/`result`/`errors` and call `onChange(patch)` to update — there is no external state management.

**Row-level toggles**: individual cost/expense lines in the financial table can be disabled per-simulation via `inputs.rowEnabled[key]` (checked with `isOn(key)` throughout `calculations.ts`); a disabled row contributes 0 to totals but its rate is still shown.

**Currency handling**: `purchaseValue` is entered in `purchaseCurrency` (COP or USD) but ADR and all internal rates are always COP; `displayCurrency` only affects presentation, not the underlying calculation currency. `exchangeRate` (COP per 1 USD) is used for all conversions via `format.ts`.

## Working in this repo

- The repo root also contains the source price list (`Lista precios -HOME Sunno - 10 JULIO 2026.pdf`) and an annual projection spreadsheet — treat these as the ground truth when validating or updating figures in `constants.ts`.
- `Sunno Blue - Simulador Rentabilidad HOME A (standalone).html` is a large standalone export/snapshot, not part of the Next.js build — don't edit it expecting it to affect the app.
- Styling is Tailwind v4 via `@theme inline` in `src/app/globals.css`, with a custom navy/caribbean/sand/gold palette and `font-display` (Fraunces) / `font-sans` (Manrope) — prefer the existing color tokens over ad hoc hex values.
- Financial copy and labels are in Spanish (es-CO locale for number/currency formatting) — keep new user-facing strings consistent with this.
