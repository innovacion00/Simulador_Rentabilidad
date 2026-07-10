export type Currency = "COP" | "USD";

export type TypologyGroup = "Casa A y B" | "Casa C" | "Casa D" | "Casa E";

export type TypologyTier = "Base" | "Superior (S)" | "Privé (piscina privada)";

export interface Typology {
  id: string;
  label: string;
  group: TypologyGroup;
  tier: TypologyTier;
  /** Valor comercial sugerido de compra, en COP. */
  baseValueCOP: number;
  /** Tarifa promedio diaria (ADR) sugerida, en COP. */
  baseADRCOP: number;
  /** true cuando el valor no proviene del modelo base y es una proyección proporcional. */
  isEstimated?: boolean;
}

export type OccupancyScenarioKey =
  | "pesimista"
  | "conservador"
  | "optimista"
  | "personalizado";

export interface SimulatorInputs {
  typologyId: string;
  /** Valor de compra digitado por el usuario, en la moneda seleccionada (purchaseCurrency). */
  purchaseValue: number;
  purchaseCurrency: Currency;
  /** Moneda principal en la que se presentan los resultados. */
  displayCurrency: Currency;
  /** Tasa de cambio COP por 1 USD. */
  exchangeRate: number;
  /** Tarifa promedio diaria, siempre en COP. */
  adr: number;
  occupancyScenario: OccupancyScenarioKey;
  /** Porcentaje de ocupación aplicado (0-100). Coincide con el escenario salvo "personalizado". */
  occupancyPct: number;
  availableDays: number;
  serviciosPublicosPct: number;
  predialPct: number;
  segurosPct: number;
  impuestoRentaPct: number;
  /** Comisión de administración Smart Stay / GEH, sobre la utilidad operacional. */
  comisionSmartStayPct: number;
  comisionOnlinePct: number;
  faraPct: number;
  aseoAmenitiesPct: number;
  mantenimientoPct: number;
  gastosFinancierosPct: number;
  /** Activa (true/ausente) o desactiva (false) cada línea de costo/gasto de la tabla financiera, por `key`. */
  rowEnabled: Partial<Record<string, boolean>>;
}

export interface FinancialLineItem {
  key: string;
  label: string;
  monthlyCOP: number;
  annualCOP: number;
  monthlyUSD: number;
  annualUSD: number;
  /** Porcentaje sobre ventas brutas, cuando aplica. */
  percent: number | null;
  /** Marca filas de subtotal/total para resaltarlas en la tabla. */
  emphasis?: "subtotal" | "total";
  /** true si la línea de costo/gasto está activa; false si el usuario la desactivó (no afecta filas sin costo asociado). */
  enabled?: boolean;
}

export interface SimulationResult {
  purchaseValueCOP: number;
  purchaseValueUSD: number;
  exchangeRate: number;

  ventasBrutasAnualCOP: number;
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
  comisionSmartStayAnualCOP: number;
  impuestoRentaAnualCOP: number;
  utilidadNetaAnualCOP: number;
  utilidadNetaMensualCOP: number;

  rentabilidadAnual: number;
  rentabilidadMensual: number;

  table: FinancialLineItem[];
}

export interface ScenarioResult {
  key: OccupancyScenarioKey;
  label: string;
  occupancyPct: number;
  adrCOP: number;
  result: SimulationResult;
}
