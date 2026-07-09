"use client";

import type { SimulationResult } from "@/lib/types";
import { formatCOP, formatPercent, formatUSD } from "@/lib/format";

export function DetailedTable({ result }: { result: SimulationResult }) {
  return (
    <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5">
        <h2 className="font-display text-xl font-medium text-navy-900">
          Tabla financiera detallada
        </h2>
        <p className="text-sm text-ink-400">
          Desglose mensual y anual de ingresos, costos y gastos en COP y USD.
        </p>
      </div>

      <div className="scrollbar-thin -mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="py-3 pr-4">Concepto</th>
              <th className="py-3 pr-4 text-right">Mensual COP</th>
              <th className="py-3 pr-4 text-right">Anual COP</th>
              <th className="py-3 pr-4 text-right">Mensual USD</th>
              <th className="py-3 pr-4 text-right">Anual USD</th>
              <th className="py-3 pl-4 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {result.table.map((row) => {
              const isRentabilidad = row.key === "rentabilidad";
              return (
                <tr
                  key={row.key}
                  className={`border-b border-navy-900/5 last:border-0 ${
                    row.emphasis === "total"
                      ? "bg-caribbean-500/5 font-semibold text-navy-900"
                      : row.emphasis === "subtotal"
                      ? "font-semibold text-navy-900"
                      : "text-ink-600"
                  }`}
                >
                  <td className="py-2.5 pr-4">{row.label}</td>
                  {isRentabilidad ? (
                    <>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pr-4 text-right text-ink-400">—</td>
                      <td className="py-2.5 pl-4 text-right">
                        {formatPercent(result.rentabilidadAnual)} anual ·{" "}
                        {formatPercent(result.rentabilidadMensual)} mensual
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatCOP(row.monthlyCOP)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatCOP(row.annualCOP)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatUSD(row.monthlyUSD)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{formatUSD(row.annualUSD)}</td>
                      <td className="py-2.5 pl-4 text-right">
                        {row.key === "predial"
                          ? "s/ valor"
                          : row.percent === null
                          ? "—"
                          : formatPercent(row.percent)}
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
