// src/utils/financial.ts

export type Currency = "CLP" | "UF";
export type RateType = "MONTHLY" | "ANNUAL";
export type TermType = "MONTHS" | "YEARS";
export type DownPaymentType = "PERCENTAGE" | "FIXED";

export interface MortgageParams {
  propertyValue: number;
  propertyCurrency: Currency;
  ufValue: number;

  downPaymentType: DownPaymentType;
  downPaymentValue: number;
  downPaymentCurrency?: Currency;

  interestRate: number;
  rateType: RateType;

  termValue: number;
  termType: TermType;
}

export interface MortgageResult {
  monthlyPaymentUF: number;
  monthlyPaymentCLP: number;
  monthlyPaymentSalaryCLP: number;
  totalPaidUF: number;
  totalInterestUF: number;
  loanAmountUF: number;
}

/**
 * Convierte cualquier monto a UF
 */
function toUF(value: number, currency: Currency, ufValue: number): number {
  return currency === "UF" ? value : value / ufValue;
}

/**
 * Convierte tasa a tasa mensual decimal
 */
function toMonthlyRate(rate: number, rateType: RateType): number {
  const decimal = rate / 100;
  return rateType === "ANNUAL" ? decimal / 12 : decimal;
}

/**
 * Convierte plazo a meses
 */
function toMonths(value: number, type: TermType): number {
  return type === "YEARS" ? value * 12 : value;
}

/**
 * Calculadora hipotecaria principal
 */
export function calculateMortgage(params: MortgageParams): MortgageResult {
  const {
    propertyValue,
    propertyCurrency,
    ufValue,
    downPaymentType,
    downPaymentValue,
    downPaymentCurrency,
    interestRate,
    rateType,
    termValue,
    termType,
  } = params;

  if (ufValue <= 0) {
    throw new Error("El valor de la UF debe ser mayor a 0");
  }

  const propertyUF = toUF(propertyValue, propertyCurrency, ufValue);

  let downPaymentUF = 0;

  if (downPaymentType === "PERCENTAGE") {
    downPaymentUF = propertyUF * (downPaymentValue / 100);
  } else {
    if (!downPaymentCurrency) {
      throw new Error("Debe especificar moneda del pie");
    }
    downPaymentUF = toUF(downPaymentValue, downPaymentCurrency, ufValue);
  }

  if (downPaymentUF > propertyUF) {
    throw new Error("El pie no puede ser mayor al valor de la propiedad");
  }

  const loanAmountUF = propertyUF - downPaymentUF;
  const monthlyRate = toMonthlyRate(interestRate, rateType);
  const months = toMonths(termValue, termType);

  let monthlyPaymentUF = 0;

  if (monthlyRate === 0) {
    monthlyPaymentUF = loanAmountUF / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPaymentUF =
      loanAmountUF *
      ((monthlyRate * factor) / (factor - 1));
  }

  const totalPaidUF = monthlyPaymentUF * months;
  const totalInterestUF = totalPaidUF - loanAmountUF;

  return {
    monthlyPaymentUF,
    monthlyPaymentCLP: monthlyPaymentUF * ufValue,
    monthlyPaymentSalaryCLP: monthlyPaymentUF * ufValue * 4,
    totalPaidUF,
    totalInterestUF,
    loanAmountUF,
  };
}
