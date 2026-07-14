import { formatCOP, formatPercent, formatUSD } from "./format";
import type { SimulationResult, Typology } from "./types";

/** Foto usada como marca de agua de fondo en todo el PDF (servida desde /public). */
const WATERMARK_PHOTO_SRC = "/piscina patio con rejas alta final 2.jpg";
const WATERMARK_OPACITY = 0.15;

/** Descarga y comprime una imagen pública a JPEG en un canvas, para mantener el PDF liviano. */
async function loadImageAsJPEG(
  src: string,
  maxWidthPx = 1200,
  quality = 0.75
): Promise<{ dataUrl: string; width: number; height: number }> {
  const response = await fetch(encodeURI(src));
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const scale = Math.min(1, maxWidthPx / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen para el PDF.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  return { dataUrl: canvas.toDataURL("image/jpeg", quality), width, height };
}

export async function downloadSimulationPDF(typology: Typology, result: SimulationResult) {
  const { default: jsPDF, GState } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const navy: [number, number, number] = [10, 38, 64];
  const gold: [number, number, number] = [201, 163, 74];
  const goldText: [number, number, number] = [138, 108, 31];
  const tan: [number, number, number] = [239, 232, 216];
  const tanBorder: [number, number, number] = [221, 211, 176];
  const dark: [number, number, number] = [31, 41, 55];
  const red: [number, number, number] = [154, 74, 66];
  const muted: [number, number, number] = [139, 132, 120];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Marca de agua de fondo, en toda la página, detrás de todo el contenido.
  try {
    const wm = await loadImageAsJPEG(WATERMARK_PHOTO_SRC, 1000, 0.7);
    const imgRatio = wm.width / wm.height;
    const pageRatio = pageWidth / pageHeight;
    let drawW: number, drawH: number, offsetX: number, offsetY: number;
    if (imgRatio > pageRatio) {
      drawH = pageHeight;
      drawW = pageHeight * imgRatio;
      offsetX = (pageWidth - drawW) / 2;
      offsetY = 0;
    } else {
      drawW = pageWidth;
      drawH = pageWidth / imgRatio;
      offsetX = 0;
      offsetY = (pageHeight - drawH) / 2;
    }
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: WATERMARK_OPACITY }));
    doc.addImage(wm.dataUrl, "JPEG", offsetX, offsetY, drawW, drawH);
    doc.restoreGraphicsState();
  } catch (error) {
    console.error("No se pudo cargar la marca de agua de fondo para el PDF.", error);
  }

  // Encabezado (navy, opaco).
  const headerHeight = 30;
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  doc.setTextColor(...tan);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SMART STAY", 14, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text("Simulador de Rentabilidad — Sunno Blue", 14, 22);

  // Franja de tipología (tan translúcida).
  const barHeight = 14;
  const barY = headerHeight;
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.88 }));
  doc.setFillColor(...tan);
  doc.rect(0, barY, pageWidth, barHeight, "F");
  doc.restoreGraphicsState();
  doc.setDrawColor(...tanBorder);
  doc.setLineWidth(0.3);
  doc.line(0, barY + barHeight, pageWidth, barY + barHeight);

  doc.setFontSize(8);
  doc.setTextColor(...goldText);
  doc.setFont("helvetica", "bold");
  doc.text("TIPOLOGÍA", 14, barY + 6);
  doc.setFontSize(12.5);
  doc.setTextColor(...navy);
  doc.text(typology.label, 14 + doc.getTextWidth("TIPOLOGÍA") + 4, barY + 7);
  doc.setFontSize(8);
  doc.setTextColor(...goldText);
  doc.text("PROYECCIÓN DE RENTABILIDAD", pageWidth - 14, barY + 6, { align: "right" });

  let cursorY = barY + barHeight + 10;

  // Indicadores financieros.
  doc.setFontSize(10.5);
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.text("INDICADORES FINANCIEROS", 14, cursorY);
  cursorY += 5;

  const kpiHighlightRows = new Set([3, 5]);

  autoTable(doc, {
    startY: cursorY,
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
    headStyles: { fillColor: navy, textColor: [255, 255, 255] },
    styles: { fontSize: 10, textColor: dark },
    didParseCell: (data) => {
      if (data.section === "body" && kpiHighlightRows.has(data.row.index)) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = goldText;
      }
    },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Estado de resultados, con línea dorada divisoria junto al título.
  doc.setFontSize(10.5);
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.text("ESTADO DE RESULTADOS", 14, cursorY);
  const titleWidth = doc.getTextWidth("ESTADO DE RESULTADOS");
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(14 + titleWidth + 4, cursorY - 1.5, pageWidth - 14, cursorY - 1.5);
  cursorY += 5;

  autoTable(doc, {
    startY: cursorY,
    head: [["Concepto", "Mensual COP", "Anual COP", "%"]],
    body: result.table.map((row) => [
      row.label,
      row.key === "rentabilidad" ? "—" : formatCOP(row.monthlyCOP),
      row.key === "rentabilidad" ? "—" : formatCOP(row.annualCOP),
      row.percent === null ? "—" : formatPercent(row.percent),
    ]),
    headStyles: { fillColor: gold, textColor: navy },
    styles: { fontSize: 8.5, textColor: dark },
    didParseCell: (data) => {
      const row = result.table[data.row.index];
      if (data.section !== "body" || !row) return;

      if (row.emphasis) {
        data.cell.styles.fontStyle = "bold";
      }

      const valueByColumn: Record<number, number | null> = {
        1: row.key === "rentabilidad" ? null : row.monthlyCOP,
        2: row.key === "rentabilidad" ? null : row.annualCOP,
        3: row.percent,
      };
      const value = valueByColumn[data.column.index];
      if (typeof value === "number" && value < 0) {
        data.cell.styles.textColor = red;
      }
    },
    didDrawCell: (data) => {
      const row = result.table[data.row.index];
      if (data.section === "body" && row?.emphasis && data.column.index === 0) {
        doc.setDrawColor(...navy);
        doc.setLineWidth(0.4);
        doc.line(
          data.cell.x,
          data.cell.y,
          data.cell.x + data.table.getWidth(pageWidth),
          data.cell.y
        );
      }
    },
  });

  // Pie de página con aviso legal.
  doc.setDrawColor(...tanBorder);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text(
    "Proyecciones estimadas, sin garantía financiera ni oferta pública de valores. Sujetas a variaciones comerciales, operativas y de mercado.",
    14,
    pageHeight - 10,
    { maxWidth: pageWidth - 28 }
  );

  doc.save(`simulacion-sunno-blue-${typology.id.toLowerCase()}.pdf`);
}
