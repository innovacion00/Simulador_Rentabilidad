import { formatCOP, formatPercent, formatUSD } from "./format";
import type { SimulationResult, Typology } from "./types";

export function buildSummaryText(typology: Typology, result: SimulationResult): string {
  return [
    `Simulación de rentabilidad — Sunno Blue (${typology.label})`,
    "",
    `Inversión total: ${formatCOP(result.purchaseValueCOP)} (${formatUSD(result.purchaseValueUSD)})`,
    `Ingresos anuales proyectados: ${formatCOP(result.ventasBrutasAnualCOP)}`,
    `Costos y gastos anuales: ${formatCOP(
      result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP
    )}`,
    `Utilidad neta anual: ${formatCOP(result.utilidadNetaAnualCOP)} (${formatUSD(
      result.utilidadNetaAnualCOP / result.exchangeRate
    )})`,
    `Utilidad neta mensual: ${formatCOP(result.utilidadNetaMensualCOP)} (${formatUSD(
      result.utilidadNetaMensualCOP / result.exchangeRate
    )})`,
    `Rentabilidad anual estimada: ${formatPercent(result.rentabilidadAnual)}`,
    `Rentabilidad mensual estimada: ${formatPercent(result.rentabilidadMensual)}`,
    "",
    "Modelo financiero estimado, sujeto a variaciones comerciales, operativas y de mercado.",
    "Smart Estate · Smart Stay · Sunno Blue",
  ].join("\n");
}

export function buildWhatsAppMessage(result: SimulationResult): string {
  return (
    `Hola, quiero recibir asesoría sobre la rentabilidad estimada de una casa en Sunno Blue. ` +
    `Mi simulación arrojó una rentabilidad anual aproximada de ${formatPercent(
      result.rentabilidadAnual
    )} y una utilidad mensual estimada de ${formatCOP(result.utilidadNetaMensualCOP)} ` +
    `(${formatUSD(result.utilidadNetaMensualCOP / result.exchangeRate)}).`
  );
}
