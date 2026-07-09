const STEPS = [
  {
    title: "Ingresos por hospedaje",
    body: "Tarifa promedio diaria (ADR) x días disponibles de venta x ocupación proyectada.",
  },
  {
    title: "Costos comerciales",
    body: "Comisión de canales online y aporte a fondo de ahorro (FARA) sobre las ventas brutas.",
  },
  {
    title: "Gastos operativos",
    body: "Aseo, mantenimiento, gastos financieros, servicios públicos, predial y seguros de la unidad.",
  },
  {
    title: "Comisión de administración",
    body: "Comisión de Smart Stay / GEH sobre la utilidad operacional, por la gestión hotelera de la casa.",
  },
  {
    title: "Utilidad y rentabilidad",
    body: "Utilidad neta del propietario frente al valor de inversión, en términos mensuales y anuales.",
  },
];

export function ExplanationSection() {
  return (
    <div className="rounded-3xl border border-navy-900/10 bg-sand-100/50 p-6 sm:p-8">
      <h2 className="font-display text-xl font-medium text-navy-900">
        ¿Cómo se calcula la rentabilidad?
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
        Este simulador estima los ingresos potenciales de una casa vacacional en operación de
        renta corta, tomando como base una tarifa promedio diaria, días disponibles de venta,
        ocupación proyectada, costos comerciales, gastos operativos y comisión de administración.
        El resultado permite visualizar la utilidad neta estimada del propietario y su
        rentabilidad frente al valor de inversión.
      </p>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-navy-900/10 bg-white p-4"
          >
            <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-caribbean-500/10 text-xs font-semibold text-caribbean-600">
              {i + 1}
            </span>
            <p className="text-sm font-semibold text-navy-900">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
