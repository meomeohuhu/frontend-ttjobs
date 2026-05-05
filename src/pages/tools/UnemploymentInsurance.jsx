import { useMemo, useState } from "react";
import CalculatorPanel from "../../tools/components/CalculatorPanel.jsx";
import ResultPanel, { formatVnd } from "../../tools/components/ResultPanel.jsx";
import { calculateUnemploymentInsurance } from "../../tools/calculators/insuranceCalc.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const UnemploymentInsurance = () => {
  const [values, setValues] = useState({ salary: 30000000, region: 1, paidMonths: 48 });
  const result = useMemo(() => calculateUnemploymentInsurance(values), [values]);

  return (
    <ToolPageShell tool={toolBySlug["unemployment-insurance"]}>
      <CalculatorPanel
        title="Tính trợ cấp thất nghiệp"
        values={values}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        fields={[
          { name: "salary", label: "Lương đóng BHTN", unit: "VND" },
          { name: "region", label: "Vùng", type: "select", options: [1, 2, 3, 4].map((value) => ({ value, label: `Vùng ${value}` })) },
          { name: "paidMonths", label: "Số tháng đã đóng" }
        ]}
      >
        <ResultPanel
          title="Mức hưởng tham khảo"
          rows={[
            { label: "Hưởng mỗi tháng", value: formatVnd(result.monthlyBenefit), highlight: true },
            { label: "Số tháng hưởng", value: `${result.benefitMonths} tháng` },
            { label: "Tổng ước tính", value: formatVnd(result.totalBenefit) },
            { label: "Trần vùng", value: formatVnd(result.monthlyCap) }
          ]}
          note={result.sourceNote}
        />
      </CalculatorPanel>
    </ToolPageShell>
  );
};

export default UnemploymentInsurance;
