"use client";

import { useMemo, useRef, useState } from "react";
import { ChartsSection } from "@/components/ChartsSection";
import { DetailedTable } from "@/components/DetailedTable";
import { Disclaimer } from "@/components/Disclaimer";
import { ExplanationSection } from "@/components/ExplanationSection";
import { FooterCTA } from "@/components/FooterCTA";
import { Hero } from "@/components/Hero";
import { KPIResults } from "@/components/KPIResults";
import { ScenarioComparison } from "@/components/ScenarioComparison";
import { SimulatorForm } from "@/components/SimulatorForm";
import {
  DEFAULT_AVAILABLE_DAYS,
  DEFAULT_EXCHANGE_RATE_COP_USD,
  FINANCIAL_RATES,
  QUICK_TYPOLOGIES,
  getTypologyById,
} from "@/lib/constants";
import { calculateScenario, runSimulation } from "@/lib/calculations";
import type { OccupancyScenarioKey, SimulatorInputs } from "@/lib/types";
import { isValid, validateInputs } from "@/lib/validation";

const initialTypology = QUICK_TYPOLOGIES[0];

const INITIAL_INPUTS: SimulatorInputs = {
  typologyId: initialTypology.id,
  purchaseValue: initialTypology.baseValueCOP,
  purchaseCurrency: "COP",
  displayCurrency: "COP",
  exchangeRate: DEFAULT_EXCHANGE_RATE_COP_USD,
  adr: initialTypology.baseADRCOP,
  occupancyScenario: "conservador",
  occupancyPct: 70,
  availableDays: DEFAULT_AVAILABLE_DAYS,
  serviciosPublicosPct: FINANCIAL_RATES.serviciosPublicosPct,
  predialPct: FINANCIAL_RATES.predialPctAnualSobreValor,
  segurosPct: FINANCIAL_RATES.segurosPct,
  impuestoRentaPct: FINANCIAL_RATES.impuestoRentaPct,
  comisionSmartStayPct: FINANCIAL_RATES.comisionSmartStayPct,
};

const SCENARIO_KEYS: OccupancyScenarioKey[] = ["pesimista", "conservador", "optimista"];

export default function Home() {
  const [inputs, setInputs] = useState<SimulatorInputs>(INITIAL_INPUTS);
  const simulatorRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => validateInputs(inputs), [inputs]);
  const typology = useMemo(() => getTypologyById(inputs.typologyId), [inputs.typologyId]);

  const result = useMemo(() => runSimulation(inputs), [inputs]);

  const scenarios = useMemo(
    () => SCENARIO_KEYS.map((key) => calculateScenario(key, inputs)),
    [inputs]
  );

  const handleChange = (patch: Partial<SimulatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...patch }));
  };

  const scrollToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resultsReady = isValid(errors);

  return (
    <div className="flex flex-1 flex-col bg-sand-50">
      <Hero onSimulate={scrollToSimulator} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12 sm:px-8 lg:px-10">
        <div ref={simulatorRef} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
          <SimulatorForm inputs={inputs} errors={errors} onChange={handleChange} />
        </div>

        {resultsReady ? (
          <>
            <section className="flex flex-col gap-4">
              <SectionHeading
                eyebrow="Resultados"
                title="Proyección de rentabilidad"
                description={`Tipología ${typology.label} · Escenario ${scenarioLabel(
                  inputs.occupancyScenario
                )}`}
              />
              <KPIResults result={result} displayCurrency={inputs.displayCurrency} />
            </section>

            <DetailedTable result={result} />

            <ScenarioComparison scenarios={scenarios} />

            <section className="flex flex-col gap-4">
              <SectionHeading
                eyebrow="Visualización"
                title="Gráficas de la simulación"
                description="Ingresos, gastos, distribución de costos y comparación de escenarios."
              />
              <ChartsSection result={result} scenarios={scenarios} />
            </section>

            <ExplanationSection />
            <Disclaimer />
          </>
        ) : (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            Revisa los campos marcados en rojo para ver la proyección de rentabilidad.
          </div>
        )}
      </main>

      {resultsReady ? <FooterCTA typology={typology} result={result} /> : null}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-caribbean-600">
        {eyebrow}
      </span>
      <h2 className="mt-1 font-display text-2xl font-medium text-navy-900">{title}</h2>
      <p className="mt-1 text-sm text-ink-400">{description}</p>
    </div>
  );
}

function scenarioLabel(key: OccupancyScenarioKey): string {
  switch (key) {
    case "pesimista":
      return "Pesimista";
    case "conservador":
      return "Conservador";
    case "optimista":
      return "Optimista";
    default:
      return "Personalizado";
  }
}
