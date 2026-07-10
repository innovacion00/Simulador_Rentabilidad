"use client";

import type { FinancialLineItem, SimulationResult, SimulatorInputs } from "@/lib/types";
import { formatCOP, formatPercent, formatPercentValue, formatUSD } from "@/lib/format";

/** Campo de `SimulatorInputs` que gobierna el % editable de cada fila de costo/gasto. */
const PCT_FIELD_BY_ROW: Partial<Record<string, keyof SimulatorInputs>> = {
  comisionOnline: "comisionOnlinePct",
  fara: "faraPct",
  aseo: "aseoAmenitiesPct",
  mantenimiento: "mantenimientoPct",
  gastosFinancieros: "gastosFinancierosPct",
  serviciosPublicos: "serviciosPublicosPct",
  predial: "predialPct",
  seguros: "segurosPct",
  comisionSmartStay: "comisionSmartStayPct",
  impuestoRenta: "impuestoRentaPct",
};

export function DetailedTable({
  result,
  inputs,
  onChange,
}: {
  result: SimulationResult;
  inputs: SimulatorInputs;
  onChange: (patch: Partial<SimulatorInputs>) => void;
}) {
  const handlePercentChange = (row: FinancialLineItem, nextPercentAbs: number) => {
    const field = PCT_FIELD_BY_ROW[row.key];
    if (!field || !Number.isFinite(nextPercentAbs)) return;
    onChange({ [field]: nextPercentAbs / 100 } as Partial<SimulatorInputs>);
  };

  const handleToggleRow = (row: FinancialLineItem) => {
    const isOn = inputs.rowEnabled[row.key] !== false;
    onChange({ rowEnabled: { ...inputs.rowEnabled, [row.key]: !isOn } });
  };

  return (
    <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5">
        <h2 className="font-display text-xl font-medium text-navy-900">
          Tabla financiera detallada
        </h2>
        <p className="text-sm text-ink-400">
          Desglose mensual y anual de ingresos, costos y gastos en COP y USD. Los costos y gastos
          se pueden editar (%) y activar/desactivar.
        </p>
      </div>

      <div className="scrollbar-thin -mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="py-3 pr-4">Concepto</th>
              <th className="py-3 pr-4 text-right">Mensual COP</th>
              <th className="py-3 pr-4 text-right">Anual COP</th>
              <th className="py-3 pr-4 text-right">Mensual USD</th>
              <th className="py-3 pr-4 text-right">Anual USD</th>
              <th className="py-3 pl-4 text-right">%</th>
              <th className="py-3 pl-4 text-center">Activo</th>
            </tr>
          </thead>
          <tbody>
            {result.table.map((row) => {
              const isRentabilidad = row.key === "rentabilidad";
              const pctField = PCT_FIELD_BY_ROW[row.key];
              const isEnabled = row.enabled !== false;
              return (
                <tr
                  key={row.key}
                  className={`border-b border-navy-900/5 last:border-0 ${
                    row.emphasis === "total"
                      ? "bg-caribbean-500/5 font-semibold text-navy-900"
                      : row.emphasis === "subtotal"
                      ? "font-semibold text-navy-900"
                      : "text-ink-600"
                  } ${!isEnabled ? "opacity-50" : ""}`}
                >
                  <td className="py-2.5 pr-4">{row.label}</td>
                  {isRentabilidad ? (
                    <>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pl-4 text-right">
                        {formatPercentValue(result.rentabilidadAnual)} EF Anual ·{" "}
                        {formatPercent(result.rentabilidadMensual)} Mensual
                      </td>
                      <td className="py-2.5 pl-4 text-center text-ink-400">—</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatCOP(row.monthlyCOP)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatCOP(row.annualCOP)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatUSD(row.monthlyUSD)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatUSD(row.annualUSD)}</td>
                      <td className="py-2.5 pl-4 text-right">
                        {pctField ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min={0}
                              value={
                                Number.isFinite(row.percent)
                                  ? Math.round(Math.abs(row.percent ?? 0) * 10000) / 100
                                  : ""
                              }
                              onChange={(e) => handlePercentChange(row, e.target.valueAsNumber)}
                              className="w-16 rounded-lg border border-navy-900/10 bg-white px-2 py-1 text-right text-sm tabular-nums text-ink-900 outline-none transition-colors focus:border-caribbean-500 focus:ring-2 focus:ring-caribbean-500/20"
                            />
                            <span className="text-ink-400">%</span>
                          </div>
                        ) : row.percent === null ? (
                          "—"
                        ) : (
                          formatPercent(row.percent)
                        )}
                      </td>
                      <td className="py-2.5 pl-4 text-center">
                        {pctField ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            aria-label={`Activar o desactivar ${row.label}`}
                            onClick={() => handleToggleRow(row)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              isEnabled ? "bg-caribbean-500" : "bg-navy-900/20"
                            }`}
                          >
                            <span
                              className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                              style={{ transform: `translateX(${isEnabled ? 18 : 3}px)` }}
                            />
                          </button>
                        ) : null}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
