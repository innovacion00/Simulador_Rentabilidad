"use client";

import { formatCOP, formatPercent, formatUSD } from "@/lib/format";
import type { ScenarioResult } from "@/lib/types";

const ACCENTS: Record<string, { ring: string; badge: string; dot: string }> = {
  pesimista: {
    ring: "border-ink-400/20",
    badge: "bg-ink-400/10 text-ink-600",
    dot: "bg-ink-400",
  },
  conservador: {
    ring: "border-caribbean-400/30",
    badge: "bg-caribbean-500/10 text-caribbean-600",
    dot: "bg-caribbean-500",
  },
  optimista: {
    ring: "border-gold-400/40",
    badge: "bg-gold-400/15 text-gold-500",
    dot: "bg-gold-500",
  },
};

export function ScenarioComparison({ scenarios }: { scenarios: ScenarioResult[] }) {
  return (
    <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-xl font-medium text-navy-900">
          Comparador de escenarios
        </h2>
        <p className="text-sm text-ink-400">
          Pesimista, conservador y optimista, con ajuste de ADR y ocupación sobre tu tipología
          seleccionada.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {scenarios.map((s) => {
          const accent = ACCENTS[s.key] ?? ACCENTS.conservador;
          return (
            <div
              key={s.key}
              className={`rounded-2xl border bg-sand-50/60 p-5 ${accent.ring}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accent.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                  {s.label}
                </span>
                <span className="text-xs font-medium text-ink-400">
                  Ocup. {s.occupancyPct}%
                </span>
              </div>

              <p className="text-xs uppercase tracking-wide text-ink-400">ADR aplicado</p>
              <p className="mb-4 font-display text-lg font-medium text-navy-900">
                {formatCOP(s.adrCOP)}
              </p>

              <dl className="space-y-2.5 text-sm">
                <Row label="Ingreso anual" value={formatCOP(s.result.ventasBrutasAnualCOP)} />
                <Row
                  label="Utilidad neta anual"
                  value={formatCOP(s.result.utilidadNetaAnualCOP)}
                />
                <Row
                  label="Utilidad neta mensual"
                  value={formatCOP(s.result.utilidadNetaMensualCOP)}
                />
                <Row
                  label="Utilidad neta anual (USD)"
                  value={formatUSD(s.result.utilidadNetaAnualCOP / s.result.exchangeRate)}
                />
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-900/10 pt-4">
                <div>
                  <p className="text-xs text-ink-400">Rentab. anual</p>
                  <p className="font-display text-base font-semibold text-navy-900">
                    {formatPercent(s.result.rentabilidadAnual)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Rentab. mensual</p>
                  <p className="font-display text-base font-semibold text-navy-900">
                    {formatPercent(s.result.rentabilidadMensual)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-medium text-navy-900">{value}</dd>
    </div>
  );
}
