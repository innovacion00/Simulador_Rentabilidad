import { FINANCIAL_RATES, OCCUPANCY_SCENARIOS, SCENARIO_ADR_INCREMENT } from "./constants";
import { convertCOPtoUSD, convertUSDtoCOP } from "./format";
import type {
  FinancialLineItem,
  OccupancyScenarioKey,
  ScenarioResult,
  SimulationResult,
  SimulatorInputs,
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
    serviciosPublicosPct: number;
    predialPct: number;
    segurosPct: number;
  }
): CostBreakdown {
  const comisionOnlineAnualCOP = ventasBrutasAnualCOP * FINANCIAL_RATES.comisionOnlinePct;
  const faraAnualCOP = ventasBrutasAnualCOP * FINANCIAL_RATES.faraPct;
  const totalCostoVentasAnualCOP = comisionOnlineAnualCOP + faraAnualCOP;
  const utilidadBrutaAnualCOP = ventasBrutasAnualCOP - totalCostoVentasAnualCOP;

  const aseoAnualCOP = ventasBrutasAnualCOP * FINANCIAL_RATES.aseoAmenitiesPct;
  const mantenimientoAnualCOP = ventasBrutasAnualCOP * FINANCIAL_RATES.mantenimientoPct;
  const gastosFinancierosAnualCOP = ventasBrutasAnualCOP * FINANCIAL_RATES.gastosFinancierosPct;
  const serviciosPublicosAnualCOP = ventasBrutasAnualCOP * rates.serviciosPublicosPct;
  const predialAnualCOP = purchaseValueCOP * rates.predialPct;
  const segurosAnualCOP = ventasBrutasAnualCOP * rates.segurosPct;

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

  const costs = calculateCosts(ventasBrutasAnualCOP, purchaseValueCOP, {
    serviciosPublicosPct: inputs.serviciosPublicosPct,
    predialPct: inputs.predialPct,
    segurosPct: inputs.segurosPct,
  });

  const comisionSmartStayAnualCOP =
    costs.utilidadOperacionalAnualCOP * FINANCIAL_RATES.comisionSmartStayPct;
  const impuestoRentaAnualCOP = costs.utilidadOperacionalAnualCOP * inputs.impuestoRentaPct;
  const utilidadNetaAnualCOP =
    costs.utilidadOperacionalAnualCOP - comisionSmartStayAnualCOP - impuestoRentaAnualCOP;
  const utilidadNetaMensualCOP = utilidadNetaAnualCOP / 12;

  const { rentabilidadAnual, rentabilidadMensual } = calculateProfitability(
    utilidadNetaAnualCOP,
    purchaseValueCOP
  );

  const rate = inputs.exchangeRate;
  const table = buildTable(ventasBrutasAnualCOP, costs, {
    comisionSmartStayAnualCOP,
    impuestoRentaAnualCOP,
    utilidadNetaAnualCOP,
    rentabilidadAnual,
  }, rate);

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
    emphasis?: FinancialLineItem["emphasis"]
  ): FinancialLineItem => ({
    key,
    label,
    monthlyCOP: annualCOP / 12,
    annualCOP,
    monthlyUSD: convertCOPtoUSD(annualCOP / 12, rate),
    annualUSD: convertCOPtoUSD(annualCOP, rate),
    percent,
    emphasis,
  });

  const pct = (value: number) => (ventasBrutasAnualCOP > 0 ? value / ventasBrutasAnualCOP : 0);

  return [
    row("ventasBrutas", "Ventas brutas", ventasBrutasAnualCOP, 1, "subtotal"),
    row("comisionOnline", "Comisión online", -costs.comisionOnlineAnualCOP, -FINANCIAL_RATES.comisionOnlinePct),
    row("fara", "FARA / fondo de ahorro", -costs.faraAnualCOP, -FINANCIAL_RATES.faraPct),
    row(
      "totalCostoVentas",
      "Total costo de ventas",
      -costs.totalCostoVentasAnualCOP,
      -pct(costs.totalCostoVentasAnualCOP),
      "subtotal"
    ),
    row("utilidadBruta", "Utilidad bruta", costs.utilidadBrutaAnualCOP, pct(costs.utilidadBrutaAnualCOP), "subtotal"),
    row("aseo", "Aseo, amenities, lencería y lavandería", -costs.aseoAnualCOP, -FINANCIAL_RATES.aseoAmenitiesPct),
    row("mantenimiento", "Mantenimiento", -costs.mantenimientoAnualCOP, -FINANCIAL_RATES.mantenimientoPct),
    row("gastosFinancieros", "Gastos financieros / datáfonos", -costs.gastosFinancierosAnualCOP, -pct(costs.gastosFinancierosAnualCOP)),
    row("serviciosPublicos", "Servicios públicos", -costs.serviciosPublicosAnualCOP, -pct(costs.serviciosPublicosAnualCOP)),
    row("predial", "Predial (anual s/ valor propiedad)", -costs.predialAnualCOP, null),
    row("seguros", "Seguros", -costs.segurosAnualCOP, -pct(costs.segurosAnualCOP)),
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
    row("comisionSmartStay", "Comisión Smart Stay / GEH", -totals.comisionSmartStayAnualCOP, -pct(totals.comisionSmartStayAnualCOP)),
    row("impuestoRenta", "Impuesto de renta", -totals.impuestoRentaAnualCOP, -pct(totals.impuestoRentaAnualCOP)),
    row("utilidadNeta", "Utilidad neta propietario", totals.utilidadNetaAnualCOP, pct(totals.utilidadNetaAnualCOP), "total"),
    row("rentabilidad", "Rentabilidad sobre inversión", 0, totals.rentabilidadAnual, "total"),
  ];
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
