import type { SimulatorInputs } from "./types";

export type ValidationErrors = Partial<Record<keyof SimulatorInputs, string>>;

export function validateInputs(inputs: SimulatorInputs): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!Number.isFinite(inputs.purchaseValue) || inputs.purchaseValue <= 0) {
    errors.purchaseValue = "El valor de inversión debe ser mayor a 0.";
  }
  if (!Number.isFinite(inputs.exchangeRate) || inputs.exchangeRate <= 0) {
    errors.exchangeRate = "La tasa de cambio debe ser mayor a 0.";
  }
  if (!Number.isFinite(inputs.adr) || inputs.adr <= 0) {
    errors.adr = "La tarifa promedio diaria (ADR) debe ser mayor a 0.";
  }
  if (
    !Number.isFinite(inputs.occupancyPct) ||
    inputs.occupancyPct < 0 ||
    inputs.occupancyPct > 100
  ) {
    errors.occupancyPct = "La ocupación debe estar entre 0% y 100%.";
  }
  if (!Number.isFinite(inputs.availableDays) || inputs.availableDays < 0 || inputs.availableDays > 365) {
    errors.availableDays = "Los días disponibles deben estar entre 0 y 365.";
  }

  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
