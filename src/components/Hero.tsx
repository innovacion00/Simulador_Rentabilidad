"use client";

import { BrandBar } from "./Logos";

export function Hero({ onSimulate }: { onSimulate: () => void }) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-caribbean-600)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_var(--color-navy-700)_0%,_transparent_60%)] opacity-80"
        aria-hidden
      />
      <div className="bg-grain absolute inset-0 opacity-40" aria-hidden />
      <div
        className="animate-float-slow absolute -right-24 top-16 h-72 w-72 rounded-full bg-caribbean-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-10 sm:px-8 lg:px-10">
        <BrandBar className="animate-fade-up text-sand-50 [&_span]:text-sand-50" />

        <div className="max-w-3xl">
          <span
            className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300"
            style={{ animationDelay: "80ms" }}
          >
            Inversión inmobiliaria · Renta corta · Cartagena
          </span>

          <h1
            className="animate-fade-up font-display text-4xl font-medium leading-[1.08] text-sand-50 sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "140ms" }}
          >
            Simulador de rentabilidad {" "}
            <span className="text-caribbean-300"></span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-sand-100/85"
            style={{ animationDelay: "200ms" }}
          >
            Proyecta tus ingresos por renta corta, costos operativos y
            rentabilidad estimada mensual y anual de acuerdo con el valor de
            inversión de tu casa vacacional.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "260ms" }}
          >
            <button
              onClick={onSimulate}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-navy-950 shadow-lg shadow-gold-500/20 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Simular mi rentabilidad
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-sand-100/70">
              <IconCoins className="h-5 w-5 text-caribbean-300" />
              <span className="text-sm">Casas de 2 y 3 alcobas · Swim up y piscina privada</span>
            </div>
          </div>

          <p
            className="animate-fade-up mt-8 max-w-xl text-xs leading-relaxed text-sand-100/55"
            style={{ animationDelay: "320ms" }}
          >
            Modelo financiero estimado sujeto a variaciones comerciales,
            operativas y de mercado.
          </p>
        </div>
      </div>

      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
    </section>
  );
}

function IconCoins({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
    >
      <ellipse cx="9" cy="7" rx="6" ry="3.5" />
      <path d="M3 7v4c0 1.93 2.69 3.5 6 3.5s6-1.57 6-3.5V7" />
      <path d="M3 11v4c0 1.93 2.69 3.5 6 3.5.62 0 1.22-.05 1.78-.15" />
      <ellipse cx="17" cy="13.5" rx="4.5" ry="2.7" />
      <path d="M12.5 13.5v3.2c0 1.49 2.01 2.7 4.5 2.7s4.5-1.21 4.5-2.7v-3.2" />
    </svg>
  );
}
