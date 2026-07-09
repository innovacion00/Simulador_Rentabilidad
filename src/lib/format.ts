const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("es-CO", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return copFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatUSD(value: number): string {
  return usdFormatter.format(Number.isFinite(value) ? value : 0);
}

/** `value` es una fracción (0.145 -> 14.5%). */
export function formatPercent(value: number): string {
  return percentFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function convertCOPtoUSD(valueCOP: number, exchangeRate: number): number {
  if (!exchangeRate || exchangeRate <= 0) return 0;
  return valueCOP / exchangeRate;
}

export function convertUSDtoCOP(valueUSD: number, exchangeRate: number): number {
  if (!exchangeRate || exchangeRate <= 0) return 0;
  return valueUSD * exchangeRate;
}
