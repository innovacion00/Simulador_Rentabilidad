import type { Typology, TypologyGroup, OccupancyScenarioKey } from "./types";

export const PROJECT_NAME = "Sunno Blue";

/** Valores base del modelo financiero por grupo de tipología (COP). */
const GROUP_BASE = {
  "Casa A y B": { value: 680_424_714, adr: 520_000 },
  "Casa C": { value: 829_500_000, adr: 590_000 },
  "Casa D": { value: 920_040_000, adr: 680_000 },
  // Sin dato oficial en el modelo base: se proyecta de forma proporcional
  // a partir de la relación valor/ADR promedio de las tipologías A-D.
  "Casa E": { value: 1_050_000_000, adr: 780_000 },
} as const;

/** Incremento aplicado sobre el valor base del grupo según el nivel de la tipología. */
const TIER_INCREMENT = {
  Base: 0,
  "Superior (S)": 0.05,
  "Privé (piscina privada)": 0.1,
} as const;

function buildHome(
  code: "A" | "B" | "C" | "D" | "E",
  group: Typology["group"]
): Typology[] {
  const base = GROUP_BASE[group];
  const isEstimated = group === "Casa E";
  const tiers: { suffix: string; tier: Typology["tier"] }[] = [
    { suffix: "", tier: "Base" },
    { suffix: "-S", tier: "Superior (S)" },
    { suffix: "-S PRIVÉ", tier: "Privé (piscina privada)" },
  ];

  return tiers.map(({ suffix, tier }) => {
    const factor = 1 + TIER_INCREMENT[tier];
    return {
      id: `HOME-${code}${suffix}`.replace(" ", "-"),
      label: `HOME ${code}${suffix}`,
      group,
      tier,
      baseValueCOP: Math.round(base.value * factor),
      baseADRCOP: Math.round(base.adr * factor),
      isEstimated,
    };
  });
}

/** Opciones agrupadas para cálculo rápido, mapeadas al valor base (tier "Base") de cada grupo. */
export const QUICK_TYPOLOGIES: Typology[] = [
  {
    id: "QUICK-AB",
    label: "Casa A y B",
    group: "Casa A y B",
    tier: "Base",
    baseValueCOP: GROUP_BASE["Casa A y B"].value,
    baseADRCOP: GROUP_BASE["Casa A y B"].adr,
  },
  {
    id: "QUICK-C",
    label: "Casa C",
    group: "Casa C",
    tier: "Base",
    baseValueCOP: GROUP_BASE["Casa C"].value,
    baseADRCOP: GROUP_BASE["Casa C"].adr,
  },
  {
    id: "QUICK-D",
    label: "Casa D",
    group: "Casa D",
    tier: "Base",
    baseValueCOP: GROUP_BASE["Casa D"].value,
    baseADRCOP: GROUP_BASE["Casa D"].adr,
  },
  {
    id: "QUICK-E",
    label: "Casa E",
    group: "Casa E",
    tier: "Base",
    baseValueCOP: GROUP_BASE["Casa E"].value,
    baseADRCOP: GROUP_BASE["Casa E"].adr,
    isEstimated: true,
  },
];

export const HOME_TYPOLOGIES: Typology[] = [
  ...buildHome("A", "Casa A y B"),
  ...buildHome("B", "Casa A y B"),
  ...buildHome("C", "Casa C"),
  ...buildHome("D", "Casa D"),
  ...buildHome("E", "Casa E"),
];

export const ALL_TYPOLOGIES: Typology[] = [
  ...QUICK_TYPOLOGIES,
  ...HOME_TYPOLOGIES,
];

export function getTypologyById(id: string): Typology {
  const found = ALL_TYPOLOGIES.find((t) => t.id === id);
  if (!found) return QUICK_TYPOLOGIES[0];
  return found;
}

/** ADR base de Casa A y B: raíz del cálculo en cascada de servicios públicos. */
export const AB_BASE_ADR_COP = GROUP_BASE["Casa A y B"].adr;

/**
 * Incremento del costo de servicios públicos de cada grupo de tipología frente a la
 * base de Casa A y B (escenario pesimista). Casa E no tiene dato oficial: se extrapola
 * siguiendo la progresión de Casa C (+12%) y Casa D (+25%), sujeto a ajuste.
 */
export const SERVICIOS_TIPOLOGIA_INCREMENT: Record<TypologyGroup, number> = {
  "Casa A y B": 0,
  "Casa C": 0.12,
  "Casa D": 0.25,
  "Casa E": 0.38,
};

/** Incremento de servicios públicos al pasar de pesimista a conservador, y de conservador a optimista. */
export const SERVICIOS_ESCALON_PCT = 0.05;

/** Presets rápidos de ADR (COP/noche), ademas de un valor personalizado. */
export const ADR_PRESETS_COP = [
  500_000, 550_000, 600_000, 650_000, 700_000, 750_000, 800_000,
];

export const DEFAULT_EXCHANGE_RATE_COP_USD = 4_050;

export const DEFAULT_AVAILABLE_DAYS = 330;
export const OWNER_USAGE_DAYS_MIN = 30;
export const OWNER_USAGE_DAYS_MAX = 35;

export const OCCUPANCY_SCENARIOS: Record<
  Exclude<OccupancyScenarioKey, "personalizado">,
  { label: string; occupancyPct: number }
> = {
  pesimista: { label: "Pesimista", occupancyPct: 50 },
  conservador: { label: "Conservador", occupancyPct: 70 },
  optimista: { label: "Optimista", occupancyPct: 85 },
};

/** Incrementos de ADR aplicados sobre la tarifa base del simulador para cada escenario comparativo. */
export const SCENARIO_ADR_INCREMENT: Record<
  Exclude<OccupancyScenarioKey, "personalizado">,
  number
> = {
  pesimista: 0,
  conservador: 0.12,
  optimista: 0.25,
};

/** Porcentajes del modelo financiero, todos sobre ventas brutas salvo donde se indique. */
export const FINANCIAL_RATES = {
  comisionOnlinePct: 0.13,
  faraPct: 0.01,
  aseoAmenitiesPct: 0.012,
  mantenimientoPct: 0.02,
  gastosFinancierosPct: 0.02,
  /** Base sugerida; queda editable porque depende del consumo real de la unidad. */
  serviciosPublicosPct: 0.19,
  /** Anual, sobre el valor comercial de la propiedad (no sobre ventas). */
  predialPctAnualSobreValor: 0.006,
  segurosPct: 0,
  impuestoRentaPct: 0,
  /** Sobre la utilidad operacional. */
  comisionSmartStayPct: 0.11,
} as const;

export const WHATSAPP_ADVISOR_NUMBER = "573000000000";
