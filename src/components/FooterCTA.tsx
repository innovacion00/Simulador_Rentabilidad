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
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-navy-950 transition-transform hover:scale-[1.03]"
            >
              <IconWhatsApp className="h-4 w-4" />
              Enviar por WhatsApp
            </a>
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

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.35a9.9 9.9 0 004.62 1.15c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.02c-1.5 0-2.94-.4-4.2-1.15l-.3-.18-3.22.8.86-3.14-.2-.32a8.15 8.15 0 01-1.25-4.32c0-4.5 3.66-8.16 8.15-8.16 4.5 0 8.16 3.66 8.16 8.16 0 4.5-3.66 8.31-8.16 8.31zm4.48-6.12c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}
