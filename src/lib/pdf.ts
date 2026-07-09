import { formatCOP, formatPercent, formatUSD } from "./format";
import type { SimulationResult, Typology } from "./types";

export async function downloadSimulationPDF(typology: Typology, result: SimulationResult) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const navy: [number, number, number] = [10, 37, 64];
  const gold: [number, number, number] = [201, 162, 75];

  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Simulador de Rentabilidad — Sunno Blue", 14, 13);
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text("Smart Estate · Smart Stay", 14, 20);

  doc.setTextColor(...navy);
  doc.setFontSize(12);
  doc.text(`Tipología: ${typology.label}`, 14, 38);

  autoTable(doc, {
    startY: 44,
    head: [["Indicador", "COP", "USD"]],
    body: [
      ["Inversión total", formatCOP(result.purchaseValueCOP), formatUSD(result.purchaseValueUSD)],
      [
        "Ingresos anuales",
        formatCOP(result.ventasBrutasAnualCOP),
        formatUSD(result.ventasBrutasAnualCOP / result.exchangeRate),
      ],
      [
        "Costos y gastos anuales",
        formatCOP(result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP),
        formatUSD(
          (result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP) /
            result.exchangeRate
        ),
      ],
      [
        "Utilidad neta anual",
        formatCOP(result.utilidadNetaAnualCOP),
        formatUSD(result.utilidadNetaAnualCOP / result.exchangeRate),
      ],
      [
        "Utilidad neta mensual",
        formatCOP(result.utilidadNetaMensualCOP),
        formatUSD(result.utilidadNetaMensualCOP / result.exchangeRate),
      ],
      ["Rentabilidad anual", formatPercent(result.rentabilidadAnual), ""],
      ["Rentabilidad mensual", formatPercent(result.rentabilidadMensual), ""],
    ],
    headStyles: { fillColor: navy },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY + 10,
    head: [["Concepto", "Mensual COP", "Anual COP", "%"]],
    body: result.table.map((row) => [
      row.label,
      row.key === "rentabilidad" ? "—" : formatCOP(row.monthlyCOP),
      row.key === "rentabilidad" ? "—" : formatCOP(row.annualCOP),
      row.percent === null ? "—" : formatPercent(row.percent),
    ]),
    headStyles: { fillColor: gold, textColor: navy },
    styles: { fontSize: 8.5 },
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Proyecciones estimadas, sin garantía financiera ni oferta pública de valores. Sujetas a variaciones comerciales, operativas y de mercado.",
    14,
    pageHeight - 10,
    { maxWidth: 182 }
  );

  doc.save(`simulacion-sunno-blue-${typology.id.toLowerCase()}.pdf`);
}
