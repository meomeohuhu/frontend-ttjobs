import { useMemo, useState } from "react";
import CalculatorPanel from "../../tools/components/CalculatorPanel.jsx";
import ResultPanel, { formatVnd } from "../../tools/components/ResultPanel.jsx";
import { calculateGrossNet } from "../../tools/calculators/salaryCalc.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const PersonalIncomeTax = () => {
  const [values, setValues] = useState({ grossSalary: 30000000, insuranceSalary: 30000000, region: 1, dependents: 0, contractType: "standard" });
  const result = useMemo(() => calculateGrossNet(values), [values]);

  return (
    <ToolPageShell tool={toolBySlug["personal-income-tax"]}>
      <CalculatorPanel
        title="Tính thuế TNCN"
        description="Biểu thuế lũy tiến từng phần cho cá nhân cư trú."
        values={values}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        fields={[
          { name: "grossSalary", label: "Thu nhập Gross", unit: "VND" },
          { name: "insuranceSalary", label: "Lương đóng bảo hiểm", unit: "VND" },
          { name: "dependents", label: "Người phụ thuộc" },
          { name: "region", label: "Vùng", type: "select", options: [1, 2, 3, 4].map((value) => ({ value, label: `Vùng ${value}` })) }
        ]}
      >
        <ResultPanel
          title="Thuế dự kiến"
          rows={[
            { label: "Thuế TNCN", value: formatVnd(result.pit), highlight: true },
            { label: "Thu nhập tính thuế", value: formatVnd(result.taxableIncome) },
            { label: "Tỷ lệ thuế hiệu dụng", value: `${(((result.pit || 0) / Math.max(result.gross, 1)) * 100).toFixed(2)}%` }
          ]}
          note={result.sourceNote}
        />
        <div className="tax-bracket-table">
          {result.pitRows.map((row) => (
            <div key={row.label}>
              <span>{row.label}</span>
              <strong>{formatVnd(row.tax)}</strong>
              <em>{Math.round(row.rate * 100)}%</em>
            </div>
          ))}
        </div>
      </CalculatorPanel>
    </ToolPageShell>
  );
};

export default PersonalIncomeTax;
