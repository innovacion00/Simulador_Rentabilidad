import {
  AB_BASE_ADR_COP,
  OCCUPANCY_SCENARIOS,
  SCENARIO_ADR_INCREMENT,
  SERVICIOS_ESCALON_PCT,
  SERVICIOS_TIPOLOGIA_INCREMENT,
  getTypologyById,
} from "./constants";
import { convertCOPtoUSD, convertUSDtoCOP } from "./format";
import type {
  FinancialLineItem,
  OccupancyScenarioKey,
  ScenarioResult,
  SimulationResult,
  SimulatorInputs,
  TypologyGroup,
} from "./types";

/** Ingresos brutos anuales por hospedaje: ADR x días disponibles x % ocupación. */
export function calculateAnnualRevenue(
  adrCOP: number,
  availableDays: number,
  occupancyPct: number
): number {
  const occupancyFraction = clamp(occupancyPct, 0, 100) / 100;
  return Math.max(adrCOP, 0) * Math.max(availableDays, 0) * occupancyFraction;
}

/**
 * Servicios públicos ya no se calcula como % de las ventas del escenario activo.
 * Se fija una única base (Casa A y B, escenario pesimista = serviciosPublicosPct x
 * ventas de Casa A y B en pesimista) y todo lo demás se deriva en cascada:
 * conservador = pesimista x 1.05, optimista = conservador x 1.05, y cada tipología
 * superior parte del pesimista de Casa A y B con su propio incremento fijo.
 */
export function calculateServiciosPublicosCOP(
  group: TypologyGroup,
  scenario: OccupancyScenarioKey,
  availableDays: number,
  serviciosPublicosPct: number
): number {
  const ventasBaseAB = calculateAnnualRevenue(
    AB_BASE_ADR_COP,
    availableDays,
    OCCUPANCY_SCENARIOS.pesimista.occupancyPct
  );
  const pesimistaAB = serviciosPublicosPct * ventasBaseAB;
  const pesimistaGroup = pesimistaAB * (1 + SERVICIOS_TIPOLOGIA_INCREMENT[group]);
  const conservadorGroup = pesimistaGroup * (1 + SERVICIOS_ESCALON_PCT);
  const optimistaGroup = conservadorGroup * (1 + SERVICIOS_ESCALON_PCT);

  switch (scenario) {
    case "pesimista":
      return pesimistaGroup;
    case "optimista":
      return optimistaGroup;
    case "conservador":
    case "personalizado":
    default:
      return conservadorGroup;
  }
}

interface CostBreakdown {
  comisionOnlineAnualCOP: number;
  faraAnualCOP: number;
  totalCostoVentasAnualCOP: number;
  utilidadBrutaAnualCOP: number;
  aseoAnualCOP: number;
  mantenimientoAnualCOP: number;
  gastosFinancierosAnualCOP: number;
  serviciosPublicosAnualCOP: number;
  predialAnualCOP: number;
  segurosAnualCOP: number;
  totalGastosOperacionAnualCOP: number;
  utilidadOperacionalAnualCOP: number;
}

/** Aplica comisiones de venta y gastos de operación sobre las ventas brutas anuales. */
export function calculateCosts(
  ventasBrutasAnualCOP: number,
  purchaseValueCOP: number,
  rates: {
    comisionOnlinePct: number;
    faraPct: number;
    aseoAmenitiesPct: number;
    mantenimientoPct: number;
    gastosFinancierosPct: number;
    serviciosPublicosCOP: number;
    predialPct: number;
    segurosPct: number;
  },
  rowEnabled: Partial<Record<string, boolean>> = {}
): CostBreakdown {
  const isOn = (key: string) => rowEnabled[key] !== false;

  const comisionOnlineAnualCOP = isOn("comisionOnline")
    ? ventasBrutasAnualCOP * rates.comisionOnlinePct
    : 0;
  const faraAnualCOP = isOn("fara") ? ventasBrutasAnualCOP * rates.faraPct : 0;
  const totalCostoVentasAnualCOP = comisionOnlineAnualCOP + faraAnualCOP;
  const utilidadBrutaAnualCOP = ventasBrutasAnualCOP - totalCostoVentasAnualCOP;

  const aseoAnualCOP = isOn("aseo") ? ventasBrutasAnualCOP * rates.aseoAmenitiesPct : 0;
  const mantenimientoAnualCOP = isOn("mantenimiento")
    ? ventasBrutasAnualCOP * rates.mantenimientoPct
    : 0;
  const gastosFinancierosAnualCOP = isOn("gastosFinancieros")
    ? ventasBrutasAnualCOP * rates.gastosFinancierosPct
    : 0;
  const serviciosPublicosAnualCOP = isOn("serviciosPublicos") ? rates.serviciosPublicosCOP : 0;
  const predialAnualCOP = isOn("predial") ? purchaseValueCOP * rates.predialPct : 0;
  const segurosAnualCOP = isOn("seguros") ? ventasBrutasAnualCOP * rates.segurosPct : 0;

  const totalGastosOperacionAnualCOP =
    aseoAnualCOP +
    mantenimientoAnualCOP +
    gastosFinancierosAnualCOP +
    serviciosPublicosAnualCOP +
    predialAnualCOP +
    segurosAnualCOP;

  const utilidadOperacionalAnualCOP = utilidadBrutaAnualCOP - totalGastosOperacionAnualCOP;

  return {
    comisionOnlineAnualCOP,
    faraAnualCOP,
    totalCostoVentasAnualCOP,
    utilidadBrutaAnualCOP,
    aseoAnualCOP,
    mantenimientoAnualCOP,
    gastosFinancierosAnualCOP,
    serviciosPublicosAnualCOP,
    predialAnualCOP,
    segurosAnualCOP,
    totalGastosOperacionAnualCOP,
    utilidadOperacionalAnualCOP,
  };
}

/** Rentabilidad anual y mensual del propietario frente al valor de compra. */
export function calculateProfitability(
  utilidadNetaAnualCOP: number,
  purchaseValueCOP: number
): { rentabilidadAnual: number; rentabilidadMensual: number } {
  const rentabilidadAnual = purchaseValueCOP > 0 ? utilidadNetaAnualCOP / purchaseValueCOP : 0;
  return { rentabilidadAnual, rentabilidadMensual: rentabilidadAnual / 12 };
}

/** Convierte el valor de compra digitado (COP o USD) a COP, y calcula la simulación financiera completa. */
export function runSimulation(inputs: SimulatorInputs): SimulationResult {
  const purchaseValueCOP =
    inputs.purchaseCurrency === "USD"
      ? convertUSDtoCOP(inputs.purchaseValue, inputs.exchangeRate)
      : inputs.purchaseValue;
  const purchaseValueUSD = convertCOPtoUSD(purchaseValueCOP, inputs.exchangeRate);

  const ventasBrutasAnualCOP = calculateAnnualRevenue(
    inputs.adr,
    inputs.availableDays,
    inputs.occupancyPct
  );

  const typologyGroup = getTypologyById(inputs.typologyId).group;
  const serviciosPublicosCOP = calculateServiciosPublicosCOP(
    typologyGroup,
    inputs.occupancyScenario,
    inputs.availableDays,
    inputs.serviciosPublicosPct
  );

  const rowEnabled = inputs.rowEnabled ?? {};
  const isRowOn = (key: string) => rowEnabled[key] !== false;

  const costs = calculateCosts(
    ventasBrutasAnualCOP,
    purchaseValueCOP,
    {
      comisionOnlinePct: inputs.comisionOnlinePct,
      faraPct: inputs.faraPct,
      aseoAmenitiesPct: inputs.aseoAmenitiesPct,
      mantenimientoPct: inputs.mantenimientoPct,
      gastosFinancierosPct: inputs.gastosFinancierosPct,
      serviciosPublicosCOP,
      predialPct: inputs.predialPct,
      segurosPct: inputs.segurosPct,
    },
    rowEnabled
  );

  const comisionSmartStayAnualCOP = isRowOn("comisionSmartStay")
    ? costs.utilidadOperacionalAnualCOP * inputs.comisionSmartStayPct
    : 0;
  const impuestoRentaAnualCOP = isRowOn("impuestoRenta")
    ? costs.utilidadOperacionalAnualCOP * inputs.impuestoRentaPct
    : 0;
  const utilidadNetaAnualCOP =
    costs.utilidadOperacionalAnualCOP - comisionSmartStayAnualCOP - impuestoRentaAnualCOP;
  const utilidadNetaMensualCOP = utilidadNetaAnualCOP / 12;

  const { rentabilidadAnual, rentabilidadMensual } = calculateProfitability(
    utilidadNetaAnualCOP,
    purchaseValueCOP
  );

  const rate = inputs.exchangeRate;
  const table = buildTable(
    ventasBrutasAnualCOP,
    costs,
    {
      comisionOnlinePct: inputs.comisionOnlinePct,
      faraPct: inputs.faraPct,
      aseoAmenitiesPct: inputs.aseoAmenitiesPct,
      mantenimientoPct: inputs.mantenimientoPct,
      gastosFinancierosPct: inputs.gastosFinancierosPct,
      serviciosPublicosPct: inputs.serviciosPublicosPct,
      predialPct: inputs.predialPct,
      segurosPct: inputs.segurosPct,
      comisionSmartStayPct: inputs.comisionSmartStayPct,
      impuestoRentaPct: inputs.impuestoRentaPct,
    },
    rowEnabled,
    {
      comisionSmartStayAnualCOP,
      impuestoRentaAnualCOP,
      utilidadNetaAnualCOP,
      rentabilidadAnual,
    },
    rate
  );

  return {
    purchaseValueCOP,
    purchaseValueUSD,
    exchangeRate: rate,
    ventasBrutasAnualCOP,
    comisionOnlineAnualCOP: costs.comisionOnlineAnualCOP,
    faraAnualCOP: costs.faraAnualCOP,
    totalCostoVentasAnualCOP: costs.totalCostoVentasAnualCOP,
    utilidadBrutaAnualCOP: costs.utilidadBrutaAnualCOP,
    aseoAnualCOP: costs.aseoAnualCOP,
    mantenimientoAnualCOP: costs.mantenimientoAnualCOP,
    gastosFinancierosAnualCOP: costs.gastosFinancierosAnualCOP,
    serviciosPublicosAnualCOP: costs.serviciosPublicosAnualCOP,
    predialAnualCOP: costs.predialAnualCOP,
    segurosAnualCOP: costs.segurosAnualCOP,
    totalGastosOperacionAnualCOP: costs.totalGastosOperacionAnualCOP,
    utilidadOperacionalAnualCOP: costs.utilidadOperacionalAnualCOP,
    comisionSmartStayAnualCOP,
    impuestoRentaAnualCOP,
    utilidadNetaAnualCOP,
    utilidadNetaMensualCOP,
    rentabilidadAnual,
    rentabilidadMensual,
    table,
  };
}

/** Simulación completa para uno de los tres escenarios comparativos (o uno personalizado). */
export function calculateScenario(
  key: OccupancyScenarioKey,
  baseInputs: SimulatorInputs
): ScenarioResult {
  if (key === "personalizado") {
    const result = runSimulation(baseInputs);
    return {
      key,
      label: "Personalizado",
      occupancyPct: baseInputs.occupancyPct,
      adrCOP: baseInputs.adr,
      result,
    };
  }

  const scenario = OCCUPANCY_SCENARIOS[key];
  const adrCOP = baseInputs.adr * (1 + SCENARIO_ADR_INCREMENT[key]);
  const inputs: SimulatorInputs = {
    ...baseInputs,
    adr: adrCOP,
    occupancyPct: scenario.occupancyPct,
    occupancyScenario: key,
  };
  return {
    key,
    label: scenario.label,
    occupancyPct: scenario.occupancyPct,
    adrCOP,
    result: runSimulation(inputs),
  };
}

function buildTable(
  ventasBrutasAnualCOP: number,
  costs: CostBreakdown,
  rates: {
    comisionOnlinePct: number;
    faraPct: number;
    aseoAmenitiesPct: number;
    mantenimientoPct: number;
    gastosFinancierosPct: number;
    serviciosPublicosPct: number;
    predialPct: number;
    segurosPct: number;
    comisionSmartStayPct: number;
    impuestoRentaPct: number;
  },
  rowEnabled: Partial<Record<string, boolean>>,
  totals: {
    comisionSmartStayAnualCOP: number;
    impuestoRentaAnualCOP: number;
    utilidadNetaAnualCOP: number;
    rentabilidadAnual: number;
  },
  rate: number
): FinancialLineItem[] {
  const row = (
    key: string,
    label: string,
    annualCOP: number,
    percent: number | null,
    emphasis?: FinancialLineItem["emphasis"],
    enabled?: boolean
  ): FinancialLineItem => ({
    key,
    label,
    monthlyCOP: annualCOP / 12,
    annualCOP,
    monthlyUSD: convertCOPtoUSD(annualCOP / 12, rate),
    annualUSD: convertCOPtoUSD(annualCOP, rate),
    percent,
    emphasis,
    enabled,
  });

  const isOn = (key: string) => rowEnabled[key] !== false;

  const pct = (value: number) => (ventasBrutasAnualCOP > 0 ? value / ventasBrutasAnualCOP : 0);

  return [
    row("ventasBrutas", "Ventas brutas", ventasBrutasAnualCOP, 1, "subtotal"),
    row(
      "comisionOnline",
      "Comisión online",
      -costs.comisionOnlineAnualCOP,
      -rates.comisionOnlinePct,
      undefined,
      isOn("comisionOnline")
    ),
    row(
      "fara",
      "FARA / fondo de ahorro",
      -costs.faraAnualCOP,
      -rates.faraPct,
      undefined,
      isOn("fara")
    ),
    row(
      "totalCostoVentas",
      "Total costo de ventas",
      -costs.totalCostoVentasAnualCOP,
      -pct(costs.totalCostoVentasAnualCOP),
      "subtotal"
    ),
    row("utilidadBruta", "Utilidad bruta", costs.utilidadBrutaAnualCOP, pct(costs.utilidadBrutaAnualCOP), "subtotal"),
    row(
      "aseo",
      "Aseo, amenities, lencería y lavandería",
      -costs.aseoAnualCOP,
      -rates.aseoAmenitiesPct,
      undefined,
      isOn("aseo")
    ),
    row(
      "mantenimiento",
      "Mantenimiento",
      -costs.mantenimientoAnualCOP,
      -rates.mantenimientoPct,
      undefined,
      isOn("mantenimiento")
    ),
    row(
      "gastosFinancieros",
      "Gastos financieros / datáfonos",
      -costs.gastosFinancierosAnualCOP,
      -rates.gastosFinancierosPct,
      undefined,
      isOn("gastosFinancieros")
    ),
    row(
      "serviciosPublicos",
      "Servicios públicos",
      -costs.serviciosPublicosAnualCOP,
      -rates.serviciosPublicosPct,
      undefined,
      isOn("serviciosPublicos")
    ),
    row(
      "predial",
      "Predial (anual s/ valor propiedad)",
      -costs.predialAnualCOP,
      -rates.predialPct,
      undefined,
      isOn("predial")
    ),
    row(
      "seguros",
      "Seguros",
      -costs.segurosAnualCOP,
      -rates.segurosPct,
      undefined,
      isOn("seguros")
    ),
    row(
      "totalGastosOperacion",
      "Total gastos de operación",
      -costs.totalGastosOperacionAnualCOP,
      -pct(costs.totalGastosOperacionAnualCOP),
      "subtotal"
    ),
    row(
      "utilidadOperacional",
      "Utilidad operacional",
      costs.utilidadOperacionalAnualCOP,
      pct(costs.utilidadOperacionalAnualCOP),
      "subtotal"
    ),
    row(
      "comisionSmartStay",
      "Comisión Smart Stay / GEH",
      -totals.comisionSmartStayAnualCOP,
      -rates.comisionSmartStayPct,
      undefined,
      isOn("comisionSmartStay")
    ),
    row(
      "impuestoRenta",
      "Impuesto de renta",
      -totals.impuestoRentaAnualCOP,
      -rates.impuestoRentaPct,
      undefined,
      isOn("impuestoRenta")
    ),
    row("utilidadNeta", "Utilidad neta propietario", totals.utilidadNetaAnualCOP, pct(totals.utilidadNetaAnualCOP), "total"),
    row("rentabilidad", "Rentabilidad sobre inversión", 0, totals.rentabilidadAnual, "total"),
  ];
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
