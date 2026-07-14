import { formatCOP, formatPercent, formatUSD } from "./format";
import type { SimulationResult, Typology } from "./types";

/** Fotos de portada del PDF, en orden de izquierda a derecha (archivos servidos desde /public). */
const COVER_PHOTO_SOURCES = [
  "/piscina patio con rejas alta final 2.jpg",
  "/piscina estudios alta.jpg",
];

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
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const navy: [number, number, number] = [10, 37, 64];
  const gold: [number, number, number] = [201, 162, 75];
  const pageWidthMM = doc.internal.pageSize.getWidth();

  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Simulador de Rentabilidad — Sunno Blue", 14, 13);
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text("Smart Stay", 14, 20);

  let photoBottomY = 28;
  try {
    const photoWidthMM = 55;
    const photoGapMM = 6;
    const photoY = 28 + 8;
    const totalWidthMM = photoWidthMM * COVER_PHOTO_SOURCES.length + photoGapMM * (COVER_PHOTO_SOURCES.length - 1);
    const startX = (pageWidthMM - totalWidthMM) / 2;

    const photos = await Promise.all(
      COVER_PHOTO_SOURCES.map((src) => loadImageAsJPEG(src, 700, 0.75))
    );

    photos.forEach(({ dataUrl, width, height }, i) => {
      const photoHeightMM = (height / width) * photoWidthMM;
      const photoX = startX + i * (photoWidthMM + photoGapMM);
      doc.addImage(dataUrl, "JPEG", photoX, photoY, photoWidthMM, photoHeightMM);
      photoBottomY = Math.max(photoBottomY, photoY + photoHeightMM);
    });
  } catch (error) {
    console.error("No se pudieron cargar las fotos de portada para el PDF.", error);
  }

  doc.setTextColor(...navy);
  doc.setFontSize(12);
  doc.text(`Tipología: ${typology.label}`, 14, photoBottomY + 10);

  autoTable(doc, {
    startY: photoBottomY + 16,
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

  const boldRowKeys = new Set([
    "ventasBrutas",
    "totalCostoVentas",
    "utilidadBruta",
    "totalGastosOperacion",
    "utilidadOperacional",
    "utilidadNeta",
    "rentabilidad",
  ]);

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
    didParseCell: (data) => {
      if (data.section === "body" && boldRowKeys.has(result.table[data.row.index]?.key)) {
        data.cell.styles.fontStyle = "bold";
      }
    },
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
