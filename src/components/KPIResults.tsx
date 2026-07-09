"use client";

import type { SimulationResult } from "@/lib/types";
import { formatCOP, formatPercent, formatUSD } from "@/lib/format";

interface KPIResultsProps {
  result: SimulationResult;
}

export function KPIResults({ result }: KPIResultsProps) {
  const cards: {
    label: string;
    valueCOP: number | string;
    valueUSD?: number | string;
    isPercent?: boolean;
    icon: (props: { className?: string }) => React.ReactElement;
    accent?: "gold" | "caribbean";
  }[] = [
    {
      label: "Inversión total",
      valueCOP: formatCOP(result.purchaseValueCOP),
      valueUSD: formatUSD(result.purchaseValueUSD),
      icon: IconBuilding,
    },
    {
      label: "Ingresos mensuales proyectados",
      valueCOP: formatCOP(result.ventasBrutasAnualCOP / 12),
      valueUSD: formatUSD(result.ventasBrutasAnualCOP / 12 / result.exchangeRate),
      icon: IconTrendUp,
    },
    {
      label: "Ingresos anuales proyectados",
      valueCOP: formatCOP(result.ventasBrutasAnualCOP),
      valueUSD: formatUSD(result.ventasBrutasAnualCOP / result.exchangeRate),
      icon: IconTrendUp,
    },
    {
      label: "Costos y gastos mensuales",
      valueCOP: formatCOP(
        (result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP) / 12
      ),
      valueUSD: formatUSD(
        (result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP) /
          12 /
          result.exchangeRate
      ),
      icon: IconReceipt,
    },
    {
      label: "Costos y gastos anuales",
      valueCOP: formatCOP(result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP),
      valueUSD: formatUSD(
        (result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP) /
          result.exchangeRate
      ),
      icon: IconReceipt,
    },
    {
      label: "Utilidad neta mensual del propietario",
      valueCOP: formatCOP(result.utilidadNetaMensualCOP),
      valueUSD: formatUSD(result.utilidadNetaMensualCOP / result.exchangeRate),
      icon: IconWallet,
      accent: "caribbean",
    },
    {
      label: "Utilidad neta anual del propietario",
      valueCOP: formatCOP(result.utilidadNetaAnualCOP),
      valueUSD: formatUSD(result.utilidadNetaAnualCOP / result.exchangeRate),
      icon: IconWallet,
      accent: "caribbean",
    },
    {
      label: "Rentabilidad mensual",
      valueCOP: formatPercent(result.rentabilidadMensual),
      isPercent: true,
      icon: IconGauge,
      accent: "gold",
    },
    {
      label: "Rentabilidad anual",
      valueCOP: formatPercent(result.rentabilidadAnual),
      isPercent: true,
      icon: IconGauge,
      accent: "gold",
    },
    {
      label: "Equivalente utilidad neta anual en USD",
      valueCOP: formatUSD(result.utilidadNetaAnualCOP / result.exchangeRate),
      icon: IconDollar,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm shadow-navy-900/5 transition-shadow hover:shadow-md ${
            card.accent === "gold"
              ? "border-gold-400/30"
              : card.accent === "caribbean"
              ? "border-caribbean-400/30"
              : "border-navy-900/10"
          }`}
        >
          <div
            className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${
              card.accent === "gold"
                ? "bg-gold-400/15 text-gold-500"
                : card.accent === "caribbean"
                ? "bg-caribbean-500/10 text-caribbean-600"
                : "bg-navy-900/5 text-navy-800"
            }`}
          >
            <card.icon className="h-4.5 w-4.5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {card.label}
          </p>
          <p className="mt-1.5 font-display text-xl font-medium text-navy-900">
            {card.valueCOP}
          </p>
          {card.valueUSD ? (
            <p className="mt-0.5 text-xs font-medium text-ink-400">≈ {card.valueUSD}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 21V4.5A1.5 1.5 0 015.5 3h6A1.5 1.5 0 0113 4.5V21" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9.5h5A1.5 1.5 0 0119.5 11V21" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7h2M7 11h2M7 15h2M15 13h2M15 17h2" strokeLinecap="round" />
      <path d="M2 21h20" strokeLinecap="round" />
    </svg>
  );
}

function IconTrendUp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconReceipt({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

function IconWallet({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3 7.5A1.5 1.5 0 014.5 6h13A1.5 1.5 0 0119 7.5V9h-3.5a2.5 2.5 0 000 5H19v3.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 17.5v-10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.5" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconGauge({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 15a8 8 0 1116 0" strokeLinecap="round" />
      <path d="M12 15l4-5" strokeLinecap="round" />
      <path d="M4 15h1M19 15h1M12 5v1" strokeLinecap="round" />
    </svg>
  );
}

function IconDollar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v11M15 9.2c0-1.2-1.34-2.2-3-2.2s-3 .9-3 2.2 1.34 1.9 3 2.3 3 1 3 2.3-1.34 2.2-3 2.2-3-1-3-2.2" strokeLinecap="round" />
    </svg>
  );
}
