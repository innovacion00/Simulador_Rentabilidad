"use client";

import type { ReactNode } from "react";

export function FieldShell({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-800/80">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="text-xs leading-snug text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm outline-none transition-colors focus:border-caribbean-500 focus:ring-2 focus:ring-caribbean-500/20";

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  error,
  placeholder,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  error?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-ink-400">
          {prefix}
        </span>
      ) : null}
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step ?? "any"}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        style={prefix ? { paddingLeft: `${prefix.length * 8 + 20}px` } : undefined}
        className={`${inputBase} ${error ? "border-rose-400" : "border-navy-900/10"}`}
      />
    </div>
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`${inputBase} border-navy-900/10 pr-9`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function PillToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-navy-900/10 bg-white p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            value === opt.value
              ? "bg-navy-900 text-sand-50"
              : "text-ink-600 hover:text-navy-900"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ChipGroup({
  value,
  onSelect,
  options,
  formatOption,
}: {
  value: number | null;
  onSelect: (value: number) => void;
  options: number[];
  formatOption: (value: number) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === opt
              ? "border-caribbean-500 bg-caribbean-500/10 text-caribbean-600"
              : "border-navy-900/10 bg-white text-ink-600 hover:border-caribbean-400/60"
          }`}
        >
          {formatOption(opt)}
        </button>
      ))}
    </div>
  );
}
