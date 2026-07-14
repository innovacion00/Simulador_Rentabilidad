import type { Typology, TypologyGroup, OccupancyScenarioKey } from "./types";

export const PROJECT_NAME = "Sunno Blue";

/**
 * Valores base del modelo financiero por grupo de tipología (COP), tomados de la
 * "Lista precios -HOME Sunno - 10 JULIO 2026" (columna VALOR TOTAL HOMES para el
 * tipo "/S", el único con inventario disponible/publicado por casa base).
 */
const GROUP_BASE = {
  "Casa A": { value: 680_424_714, adr: 520_000 },
  "Casa B": { value: 680_424_714, adr: 520_000 },
  "Casa C": { value: 829_500_000, adr: 590_000 },
  "Casa D": { value: 920_040_000, adr: 680_000 },
  // Sin dato oficial de tipo "/S" en la lista de precios (todo el inventario base
  // de Casa E disponible es "/S PRIVÉ"): se proyecta de forma proporcional a partir
  // de la relación valor Privé/Base promedio de las tipologías A-D.
  "Casa E": { value: 1_255_255_000, adr: 780_000 },
} as const;

type CasaGroup = keyof typeof GROUP_BASE;

/**
 * Valor real "VALOR TOTAL HOMES" del tipo "/S PRIVÉ" (piscina privada) por grupo,
 * según la misma lista de precios. Casa E sí tiene dato oficial para este tier.
 */
const GROUP_PRIVE_VALUE_COP: Record<CasaGroup, number> = {
  "Casa A": 739_564_000,
  "Casa B": 744_444_000,
  "Casa C": 932_789_000,
  "Casa D": 1_089_303_735,
  "Casa E": 1_408_865_625,
};

/** Incremento de ADR aplicado por nivel de tipología (no hay dato oficial de ADR por tier). */
const TIER_ADR_INCREMENT: Record<Typology["tier"], number> = {
  Base: 0,
  "Superior (S)": 0.05,
  "Privé (piscina privada)": 0.1,
};

function buildHome(
  code: "A" | "B" | "C" | "D" | "E",
  group: CasaGroup
): Typology[] {
  const base = GROUP_BASE[group];
  const isEstimated = group === "Casa E";
  const tiers: {
    suffix: string;
    tier: Typology["tier"];
    valueCOP: number;
    estimated: boolean;
  }[] = [
    { suffix: "", tier: "Base", valueCOP: base.value, estimated: isEstimated },
    {
      suffix: "-S",
      tier: "Superior (S)",
      valueCOP: Math.round(base.value * (1 + TIER_ADR_INCREMENT["Superior (S)"])),
      estimated: isEstimated,
    },
    {
      suffix: "-S PRIVÉ",
      tier: "Privé (piscina privada)",
      valueCOP: GROUP_PRIVE_VALUE_COP[group],
      estimated: false,
    },
  ];

  return tiers.map(({ suffix, tier, valueCOP, estimated }) => ({
    id: `HOME-${code}${suffix}`.replace(" ", "-"),
    label: `HOME ${code}${suffix}`,
    group,
    tier,
    baseValueCOP: valueCOP,
    baseADRCOP: Math.round(base.adr * (1 + TIER_ADR_INCREMENT[tier])),
    isEstimated: estimated,
  }));
}

/** Opciones agrupadas para cálculo rápido, mapeadas al valor base (tier "Base") de cada grupo. */
export const QUICK_TYPOLOGIES: Typology[] = [
  {
    id: "QUICK-A",
    label: "Casa A",
    group: "Casa A",
    tier: "Base",
    baseValueCOP: GROUP_BASE["Casa A"].value,
    baseADRCOP: GROUP_BASE["Casa A"].adr,
  },
  {
    id: "QUICK-B",
    label: "Casa B",
    group: "Casa B",
    tier: "Base",
    baseValueCOP: GROUP_BASE["Casa B"].value,
    baseADRCOP: GROUP_BASE["Casa B"].adr,
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
  ...buildHome("A", "Casa A"),
  ...buildHome("B", "Casa B"),
  ...buildHome("C", "Casa C"),
  ...buildHome("D", "Casa D"),
  ...buildHome("E", "Casa E"),
];

/** Suites y Rooftop: valores de compra y ADR reales por tipo. */
export const SUITE_ROOFTOP_TYPOLOGIES: Typology[] = [
  {
    id: "SUITE-A",
    label: "Suite A",
    group: "Suite A",
    tier: "Base",
    baseValueCOP: 319_923_000,
    baseADRCOP: 350_000,
  },
  {
    id: "SUITE-A-S",
    label: "Suite A/S",
    group: "Suite A",
    tier: "Superior (S)",
    baseValueCOP: 452_400_000,
    baseADRCOP: 410_000,
  },
  {
    id: "SUITE-B",
    label: "Suite B",
    group: "Suite B",
    tier: "Base",
    baseValueCOP: 394_240_000,
    baseADRCOP: 350_000,
  },
  {
    id: "SUITE-C",
    label: "Suite C",
    group: "Suite C",
    tier: "Base",
    baseValueCOP: 407_974_000,
    baseADRCOP: 407_974,
  },
  {
    id: "ROOFTOP-A",
    label: "Rooftop A",
    group: "Rooftop A",
    tier: "Base",
    baseValueCOP: 480_000_000,
    baseADRCOP: 500_000,
  },
];

export const ALL_TYPOLOGIES: Typology[] = [
  ...QUICK_TYPOLOGIES,
  ...HOME_TYPOLOGIES,
  ...SUITE_ROOFTOP_TYPOLOGIES,
];

export function getTypologyById(id: string): Typology {
  const found = ALL_TYPOLOGIES.find((t) => t.id === id);
  if (!found) return QUICK_TYPOLOGIES[0];
  return found;
}

/** ADR base de Casa A y Casa B: raíz del cálculo en cascada de servicios públicos. */
export const AB_BASE_ADR_COP = GROUP_BASE["Casa A"].adr;

/**
 * Incremento del costo de servicios públicos de cada grupo de tipología frente a la
 * base de Casa A/B (escenario pesimista). Casa E no tiene dato oficial: se extrapola
 * siguiendo la progresión de Casa C (+12%) y Casa D (+25%), sujeto a ajuste. Suites y
 * Rooftop tampoco tienen dato oficial: se usa la misma base de Casa A/B (0%).
 */
export const SERVICIOS_TIPOLOGIA_INCREMENT: Record<TypologyGroup, number> = {
  "Casa A": 0,
  "Casa B": 0,
  "Casa C": 0.12,
  "Casa D": 0.25,
  "Casa E": 0.38,
  "Suite A": 0,
  "Suite B": 0,
  "Suite C": 0,
  "Rooftop A": 0,
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
