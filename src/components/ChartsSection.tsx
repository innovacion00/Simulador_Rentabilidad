"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCOP, formatPercent } from "@/lib/format";
import type { ScenarioResult, SimulationResult } from "@/lib/types";

const FLOW_COLORS = {
  ingresos: "#0074BC",
  gastos: "#B5533C",
  utilidad: "#C9A24B",
};

const SCENARIO_COLORS: Record<string, string> = {
  pesimista: "#4A5C99",
  conservador: "#1a94d6",
  optimista: "#C9A24B",
};

const COST_COLORS = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
];

const AXIS_TICK = { fill: "#7c8ba0", fontSize: 12 };

export function ChartsSection({
  result,
  scenarios,
}: {
  result: SimulationResult;
  scenarios: ScenarioResult[];
}) {
  const flowData = [
    { name: "Ingresos", value: result.ventasBrutasAnualCOP, fill: FLOW_COLORS.ingresos },
    {
      name: "Costos y gastos",
      value: result.totalCostoVentasAnualCOP + result.totalGastosOperacionAnualCOP,
      fill: FLOW_COLORS.gastos,
    },
    { name: "Utilidad neta", value: result.utilidadNetaAnualCOP, fill: FLOW_COLORS.utilidad },
  ];

  const costSlices = [
    { name: "Comisión online", value: result.comisionOnlineAnualCOP },
    { name: "FARA", value: result.faraAnualCOP },
    { name: "Aseo / lavandería", value: result.aseoAnualCOP },
    { name: "Mantenimiento", value: result.mantenimientoAnualCOP },
    { name: "Gastos financieros", value: result.gastosFinancierosAnualCOP },
    { name: "Servicios públicos", value: result.serviciosPublicosAnualCOP },
    { name: "Predial", value: result.predialAnualCOP },
    { name: "Seguros", value: result.segurosAnualCOP },
    { name: "Comisión Smart Stay", value: result.comisionSmartStayAnualCOP },
    { name: "Impuesto de renta", value: result.impuestoRentaAnualCOP },
  ]
    .filter((s) => s.value > 0)
    .map((s, i) => ({ ...s, fill: COST_COLORS[i % COST_COLORS.length] }));

  const scenarioData = scenarios.map((s) => ({
    name: s.label,
    rentabilidad: Number((s.result.rentabilidadAnual * 100).toFixed(2)),
    fill: SCENARIO_COLORS[s.key] ?? "#1a94d6",
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Ingresos, gastos y utilidad neta" subtitle="Proyección anual, en COP">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={flowData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e1e0d9" />
            <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
              width={48}
            />
            <Tooltip
              formatter={(value) => formatCOP(Number(value ?? 0))}
              contentStyle={{ borderRadius: 12, borderColor: "#e1e0d9", fontSize: 13 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
              {flowData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribución de costos y gastos" subtitle="Participación anual sobre el total">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={costSlices}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={100}
              paddingAngle={2}
              stroke="#fdfbf7"
              strokeWidth={2}
            >
              {costSlices.map((s) => (
                <Cell key={s.name} fill={s.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCOP(Number(value ?? 0))}
              contentStyle={{ borderRadius: 12, borderColor: "#e1e0d9", fontSize: 13 }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12, color: "#45566a" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Rentabilidad anual por escenario"
        subtitle="Pesimista, conservador y optimista"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={scenarioData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e1e0d9" />
            <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip
              formatter={(value) => formatPercent(Number(value ?? 0) / 100)}
              contentStyle={{ borderRadius: 12, borderColor: "#e1e0d9", fontSize: 13 }}
            />
            <Bar dataKey="rentabilidad" radius={[6, 6, 0, 0]} maxBarSize={90}>
              {scenarioData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl border border-navy-900/10 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="font-display text-lg font-medium text-navy-900">{title}</h3>
      <p className="mb-2 text-sm text-ink-400">{subtitle}</p>
      {children}
    </div>
  );
}
