"use client";

import { useId, useMemo, useState } from "react";
import {
  ADR_PRESETS_COP,
  HOME_TYPOLOGIES,
  OCCUPANCY_SCENARIOS,
  OWNER_USAGE_DAYS_MAX,
  OWNER_USAGE_DAYS_MIN,
  QUICK_TYPOLOGIES,
} from "@/lib/constants";
import { formatCOP, formatNumber } from "@/lib/format";
import type { OccupancyScenarioKey, SimulatorInputs } from "@/lib/types";
import type { ValidationErrors } from "@/lib/validation";
import { ChipGroup, FieldShell, NumberInput, PillToggle } from "./FormControls";

const OCCUPANCY_OPTIONS: { value: OccupancyScenarioKey; label: string }[] = [
  { value: "pesimista", label: `Pesimista · ${OCCUPANCY_SCENARIOS.pesimista.occupancyPct}%` },
  { value: "conservador", label: `Conservador · ${OCCUPANCY_SCENARIOS.conservador.occupancyPct}%` },
  { value: "optimista", label: `Optimista · ${OCCUPANCY_SCENARIOS.optimista.occupancyPct}%` },
  { value: "personalizado", label: "Personalizado" },
];

interface SimulatorFormProps {
  inputs: SimulatorInputs;
  errors: ValidationErrors;
  onChange: (patch: Partial<SimulatorInputs>) => void;
}

export function SimulatorForm({ inputs, errors, onChange }: SimulatorFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const groupId = useId();

  const groupedHomes = useMemo(() => {
    const groups = new Map<string, typeof HOME_TYPOLOGIES>();
    for (const t of HOME_TYPOLOGIES) {
      const list = groups.get(t.group) ?? [];
      list.push(t);
      groups.set(t.group, list);
    }
    return groups;
  }, []);

  const handleTypologyChange = (id: string) => {
    const typology = [...QUICK_TYPOLOGIES, ...HOME_TYPOLOGIES].find((t) => t.id === id);
    if (!typology) return;
    onChange({
      typologyId: id,
      purchaseValue:
        inputs.purchaseCurrency === "USD"
          ? Math.round((typology.baseValueCOP / inputs.exchangeRate) * 100) / 100
          : typology.baseValueCOP,
      adr: typology.baseADRCOP,
    });
  };

  const handlePurchaseCurrencyToggle = (currency: "COP" | "USD") => {
    if (currency === inputs.purchaseCurrency) return;
    const valueCOP =
      inputs.purchaseCurrency === "USD"
        ? inputs.purchaseValue * inputs.exchangeRate
        : inputs.purchaseValue;
    const nextValue =
      currency === "USD" ? valueCOP / inputs.exchangeRate : valueCOP;
    onChange({
      purchaseCurrency: currency,
      purchaseValue: Math.round(nextValue * 100) / 100,
    });
  };

  const handleOccupancyScenario = (scenario: OccupancyScenarioKey) => {
    if (scenario === "personalizado") {
      onChange({ occupancyScenario: scenario });
      return;
    }
    onChange({
      occupancyScenario: scenario,
      occupancyPct: OCCUPANCY_SCENARIOS[scenario].occupancyPct,
    });
  };

  return (
    <div className="rounded-3xl border border-navy-900/10 bg-white/70 p-6 shadow-xl shadow-navy-900/5 backdrop-blur sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-caribbean-500/10 text-caribbean-600">
          <IconSliders className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-medium text-navy-900">
            Parámetros de la simulación
          </h2>
          <p className="text-sm text-ink-400">
            Ajusta los valores según tu tipología y escenario comercial.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell label="Tipo de casa" className="sm:col-span-2">
          <select
            id={groupId}
            value={inputs.typologyId}
            onChange={(e) => handleTypologyChange(e.target.value)}
            className="w-full rounded-xl border border-navy-900/10 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm outline-none transition-colors focus:border-caribbean-500 focus:ring-2 focus:ring-caribbean-500/20"
          >
            <optgroup label="Cálculo rápido por casa">
              {QUICK_TYPOLOGIES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
            {[...groupedHomes.entries()].map(([group, list]) => (
              <optgroup key={group} label={`Tipologías · ${group}`}>
                {list.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                    {t.isEstimated ? " (estimado)" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          label="Valor de compra de la casa"
          error={errors.purchaseValue}
          hint="Se sugiere automáticamente al elegir la tipología; puedes editarlo."
        >
          <div className="flex gap-2">
            <NumberInput
              value={inputs.purchaseValue}
              onChange={(v) => onChange({ purchaseValue: v })}
              min={0}
              error={Boolean(errors.purchaseValue)}
              prefix={inputs.purchaseCurrency}
            />
            <PillToggle
              value={inputs.purchaseCurrency}
              onChange={handlePurchaseCurrencyToggle}
              options={[
                { value: "COP", label: "COP" },
                { value: "USD", label: "USD" },
              ]}
            />
          </div>
        </FieldShell>

        <FieldShell
          label="Moneda de visualización"
          hint="Los resultados se muestran siempre en COP y USD; esta define la moneda principal."
        >
          <PillToggle
            value={inputs.displayCurrency}
            onChange={(v) => onChange({ displayCurrency: v })}
            options={[
              { value: "COP", label: "COP" },
              { value: "USD", label: "USD" },
            ]}
          />
        </FieldShell>

        <FieldShell
          label="Tasa de cambio COP/USD"
          error={errors.exchangeRate}
          hint="Digite la tasa de cambio vigente o de referencia. Puede actualizarse manualmente según la TRM o tasa comercial aplicable."
          className="sm:col-span-2"
        >
          <NumberInput
            value={inputs.exchangeRate}
            onChange={(v) => onChange({ exchangeRate: v })}
            min={0}
            prefix="COP $"
            error={Boolean(errors.exchangeRate)}
          />
        </FieldShell>

        <FieldShell
          label="Tarifa promedio diaria (ADR)"
          error={errors.adr}
          className="sm:col-span-2"
        >
          <div className="flex flex-col gap-3">
            <NumberInput
              value={inputs.adr}
              onChange={(v) => onChange({ adr: v })}
              min={0}
              prefix="COP $"
              error={Boolean(errors.adr)}
            />
            <ChipGroup
              value={ADR_PRESETS_COP.includes(inputs.adr) ? inputs.adr : null}
              onSelect={(v) => onChange({ adr: v })}
              options={ADR_PRESETS_COP}
              formatOption={(v) => formatCOP(v)}
            />
          </div>
        </FieldShell>

        <FieldShell label="Ocupación estimada" className="sm:col-span-2">
          <div className="flex flex-col gap-3">
            <PillToggle
              value={inputs.occupancyScenario}
              onChange={handleOccupancyScenario}
              options={OCCUPANCY_OPTIONS}
            />
            {inputs.occupancyScenario === "personalizado" ? (
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={inputs.occupancyPct}
                  onChange={(e) => onChange({ occupancyPct: Number(e.target.value) })}
                  className="h-1.5 flex-1 accent-caribbean-500"
                />
                <span className="w-14 text-right text-sm font-semibold text-navy-900">
                  {formatNumber(inputs.occupancyPct)}%
                </span>
              </div>
            ) : null}
            {errors.occupancyPct ? (
              <span className="text-xs font-medium text-rose-600">{errors.occupancyPct}</span>
            ) : null}
          </div>
        </FieldShell>

        <FieldShell
          label="Días disponibles para venta al año"
          error={errors.availableDays}
        >
          <NumberInput
            value={inputs.availableDays}
            onChange={(v) => onChange({ availableDays: v })}
            min={0}
            max={365}
            error={Boolean(errors.availableDays)}
          />
        </FieldShell>

        <FieldShell label="Uso del propietario">
          <div className="flex h-full items-center rounded-xl border border-dashed border-navy-900/15 bg-sand-100/60 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600">
            Modelo base contempla entre {OWNER_USAGE_DAYS_MIN} y {OWNER_USAGE_DAYS_MAX} días de
            uso del propietario al año.
          </div>
        </FieldShell>
      </div>

      <button
        type="button"
        onClick={() => setAdvancedOpen((v) => !v)}
        className="mt-6 flex items-center gap-2 text-sm font-semibold text-caribbean-600 hover:text-caribbean-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-90" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        Parámetros avanzados de gastos e impuestos
      </button>

      {advancedOpen ? (
        <div className="mt-4 grid gap-5 rounded-2xl bg-sand-100/60 p-5 sm:grid-cols-2">
          <FieldShell
            label="Servicios públicos — base Casa A y B / Pesimista (%)"
            hint="Base sugerida 19% sobre ventas de Casa A y B en escenario pesimista. Conservador y optimista suman 5% en cascada; Casa C y D parten de esta base con un incremento fijo por tipología."
          >
            <NumberInput
              value={inputs.serviciosPublicosPct * 100}
              onChange={(v) => onChange({ serviciosPublicosPct: v / 100 })}
              min={0}
              max={100}
              prefix="%"
            />
          </FieldShell>
          <FieldShell
            label="Predial (% anual s/ valor propiedad)"
            hint="Base sugerida 0,6% anual sobre el valor comercial."
          >
            <NumberInput
              value={inputs.predialPct * 100}
              onChange={(v) => onChange({ predialPct: v / 100 })}
              min={0}
              max={100}
              prefix="%"
            />
          </FieldShell>
          <FieldShell
            label="Comisión Smart Stay / GEH (% utilidad operacional)"
            hint="Base sugerida 11%; comisión de administración sobre la utilidad operacional."
          >
            <NumberInput
              value={inputs.comisionSmartStayPct * 100}
              onChange={(v) => onChange({ comisionSmartStayPct: v / 100 })}
              min={0}
              max={100}
              prefix="%"
            />
          </FieldShell>
          <FieldShell
            label="Impuesto de renta (% utilidad operacional)"
            hint="Inicialmente en 0%; disponible para futuras versiones del modelo."
          >
            <NumberInput
              value={inputs.impuestoRentaPct * 100}
              onChange={(v) => onChange({ impuestoRentaPct: v / 100 })}
              min={0}
              max={100}
              prefix="%"
            />
          </FieldShell>
        </div>
      ) : null}
    </div>
  );
}

function IconSliders({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={className}
    >
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h13M20 18h.01" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
