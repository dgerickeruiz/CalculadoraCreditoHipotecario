import React, { useState } from "react";
import { calculateMortgage } from "../utils/financial";
import type {
  MortgageParams,
  Currency,
  RateType,
  TermType,
  DownPaymentType,
} from "../utils/financial";
import "./MortgageCalculator.css";

// Helpers to format and parse numbers with thousands separators
function formatNumber(value: number, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toLocaleString("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function parseFormattedNumber(input: string) {
  if (!input) return 0;
  // Remove spaces, remove thousand separators (.) and support comma as decimal
  const normalized = input
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.\-]/g, "");
  const n = parseFloat(normalized);
  return Number.isNaN(n) ? 0 : n;
}

export default function MortgageCalculator() {
  const [form, setForm] = useState<MortgageParams>({
    propertyValue: 3500,
    propertyCurrency: "UF",
    // Provide a sensible default for UF so users see values immediately
    ufValue: 39723,
    downPaymentType: "PERCENTAGE",
    downPaymentValue: 10,
    downPaymentCurrency: "UF",
    interestRate: 3.27,
    rateType: "ANNUAL",
    termValue: 30,
    termType: "YEARS",
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // Display state for UF input to allow free editing without reformatting on every keystroke
  const [ufDisplay, setUfDisplay] = useState(() => formatNumber(form.ufValue, 2));

  React.useEffect(() => {
    setUfDisplay(formatNumber(form.ufValue, 2));
  }, [form.ufValue]);

  // Display states for other numeric fields so users can clear the input without it snapping to 0
  const [downPaymentDisplay, setDownPaymentDisplay] = useState(() => formatNumber(form.downPaymentValue, 0));
  const [interestDisplay, setInterestDisplay] = useState(() => formatNumber(form.interestRate, 2));
  const [termDisplay, setTermDisplay] = useState(() => formatNumber(form.termValue, 0));

  React.useEffect(() => {
    setDownPaymentDisplay(formatNumber(form.downPaymentValue, 0));
  }, [form.downPaymentValue]);
  React.useEffect(() => {
    setInterestDisplay(formatNumber(form.interestRate, 2));
  }, [form.interestRate]);
  React.useEffect(() => {
    setTermDisplay(formatNumber(form.termValue, 0));
  }, [form.termValue]);

  const handleCalculate = () => {
    try {
      setError("");
      const calculation = calculateMortgage(form);
      setResult(calculation);
    } catch (err: any) {
      setResult(null);
      setError(err.message);
    }
  };

  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL").format(Math.round(value));

  const formatUF = (value: number) =>
    value.toFixed(2);

  return (
    <div className="container">
      <h2>Calculadora Crédito Hipotecario</h2>

      <div className="grid">
        <label>Valor propiedad</label>
        <input
          type="text"
          value={formatNumber(form.propertyValue, 0)}
          onChange={(e) =>
            setForm({ ...form, propertyValue: parseFormattedNumber(e.target.value) })
          }
        />
        <select
          value={form.propertyCurrency}
          onChange={(e) =>
            setForm({ ...form, propertyCurrency: e.target.value as Currency })
          }
        >
          <option value="UF">UF</option>
          <option value="CLP">CLP</option>
        </select>

        <label>Valor UF</label>
        <input
          className="span-2"
          type="text"
          value={ufDisplay}
          onChange={(e) => setUfDisplay(e.target.value)}
          onBlur={() => {
            const n = parseFormattedNumber(ufDisplay);
            setForm({ ...form, ufValue: n });
            setUfDisplay(formatNumber(n, 2));
          }}
        />

        <label>Pie</label>
        <input
          type="text"
          value={downPaymentDisplay}
          onChange={(e) => setDownPaymentDisplay(e.target.value)}
          onBlur={() => {
            if (downPaymentDisplay.trim() === "") {
              // keep previous form value but leave input visually empty
              return;
            }
            const n = parseFormattedNumber(downPaymentDisplay);
            setForm({ ...form, downPaymentValue: n });
            setDownPaymentDisplay(formatNumber(n, 0));
          }}
        />
        <select
          value={form.downPaymentType}
          onChange={(e) =>
            setForm({
              ...form,
              downPaymentType: e.target.value as DownPaymentType,
            })
          }
        >
          <option value="PERCENTAGE">%</option>
          <option value="FIXED">Monto fijo</option>
        </select>

        <label>Tasa</label>
        <input
          type="text"
          value={interestDisplay}
          onChange={(e) => setInterestDisplay(e.target.value)}
          onBlur={() => {
            if (interestDisplay.trim() === "") return;
            const n = parseFormattedNumber(interestDisplay);
            setForm({ ...form, interestRate: n });
            setInterestDisplay(formatNumber(n, 2));
          }}
        />
        <select
          value={form.rateType}
          onChange={(e) =>
            setForm({ ...form, rateType: e.target.value as RateType })
          }
        >
          <option value="ANNUAL">Anual</option>
          <option value="MONTHLY">Mensual</option>
        </select>

        <label>Plazo</label>
        <input
          type="text"
          value={termDisplay}
          onChange={(e) => setTermDisplay(e.target.value)}
          onBlur={() => {
            if (termDisplay.trim() === "") return;
            const n = parseFormattedNumber(termDisplay);
            setForm({ ...form, termValue: Math.round(n) });
            setTermDisplay(formatNumber(Math.round(n), 0));
          }}
        />
        <select
          value={form.termType}
          onChange={(e) =>
            setForm({ ...form, termType: e.target.value as TermType })
          }
        >
          <option value="YEARS">Años</option>
          <option value="MONTHS">Meses</option>
        </select>
      </div>

      <button onClick={handleCalculate}>Calcular</button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="results">
          <p><strong>Sueldo Sugerido: ${formatCLP(result.monthlyPaymentSalaryCLP)} CLP</strong></p>
          <p>Dividendo mensual: ${formatCLP(result.monthlyPaymentCLP)} CLP</p>
          <p>Dividendo mensual: {formatUF(result.monthlyPaymentUF)} UF</p>
          <p>Monto solicitado: {formatUF(result.loanAmountUF)} UF</p>
          <p>Total pagado: {formatUF(result.totalPaidUF)} UF</p>
          <p>Total intereses: {formatUF(result.totalInterestUF)} UF</p>
        </div>
      )}

      <footer className="footer">
        <p>
          Desarrollado por{" "}
          <a href="https://www.linkedin.com/in/danielgericke/" target="_blank" rel="noopener noreferrer">
            Daniel Gericke Ruiz
          </a>
        </p>
        <p> Version 0.1.5</p>
      </footer>
    </div>
  );
}
