"use client";

import { useState } from "react";
import { WHATSAPP_ADVISOR_NUMBER } from "@/lib/constants";
import { downloadSimulationPDF } from "@/lib/pdf";
import { buildSummaryText, buildWhatsAppMessage } from "@/lib/summary";
import type { SimulationResult, Typology } from "@/lib/types";
import { BrandBar } from "./Logos";

export function FooterCTA({
  typology,
  result,
}: {
  typology: Typology;
  result: SimulationResult;
}) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(typology, result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handlePDF = async () => {
    setGenerating(true);
    try {
      await downloadSimulationPDF(typology, result);
    } finally {
      setGenerating(false);
    }
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_ADVISOR_NUMBER}?text=${encodeURIComponent(
    buildWhatsAppMessage(result)
  )}`;

  return (
    <footer className="relative overflow-hidden bg-navy-900 text-sand-50">
      <div className="bg-grain absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 border-b border-sand-50/10 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-medium">
              ¿Listo para invertir en tu casa Sunno Blue?
            </h2>
            <p className="mt-2 text-sm text-sand-100/70">
              Comparte tu simulación con nuestro equipo o guárdala para tomar la mejor decisión de
              inversión.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePDF}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-full border border-sand-50/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-sand-50 transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              <IconDownload className="h-4 w-4" />
              {generating ? "Generando…" : "Descargar PDF"}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-sand-50/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-sand-50 transition-colors hover:bg-white/10"
            >
              <IconCopy className="h-4 w-4" />
              {copied ? "¡Copiado!" : "Copiar resumen"}
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-transform hover:scale-[1.03]"
            >
              Solicitar asesoría
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <BrandBar className="[&_span]:text-sand-50" />
          <p className="text-xs text-sand-100/50">
            © {new Date().getFullYear()} Sunno Blue · Comercializado por Smart
            Stay. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
    </svg>
  );
}
