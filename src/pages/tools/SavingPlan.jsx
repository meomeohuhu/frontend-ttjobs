import { useMemo, useState } from "react";
import CalculatorPanel from "../../tools/components/CalculatorPanel.jsx";
import ResultPanel, { formatVnd } from "../../tools/components/ResultPanel.jsx";
import { calculateSavingPlan } from "../../tools/calculators/financeCalc.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const SavingPlan = () => {
  const [values, setValues] = useState({ principal: 30000000, target: 300000000, annualRate: 7, years: 4 });
  const result = useMemo(() => calculateSavingPlan(values), [values]);

  return (
    <ToolPageShell tool={toolBySlug["saving-plan"]}>
      <CalculatorPanel
        title="Lập kế hoạch tiết kiệm"
        values={values}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        fields={[
          { name: "principal", label: "Số tiền hiện có", unit: "VND" },
          { name: "target", label: "Mục tiêu", unit: "VND" },
          { name: "annualRate", label: "Lãi suất năm", unit: "%" },
          { name: "years", label: "Số năm" }
        ]}
      >
        <ResultPanel
          title="Kế hoạch đề xuất"
          rows={[
            { label: "Cần tiết kiệm mỗi tháng", value: formatVnd(result.requiredMonthly), highlight: true },
            { label: "Tổng góp thêm", value: formatVnd(result.totalAdded) },
            { label: "Lãi hỗ trợ", value: formatVnd(result.interestSupport) },
            { label: "Giá trị dự kiến", value: formatVnd(result.finalValue) }
          ]}
          points={result.points}
          note="Nếu mục tiêu nhỏ hơn số tiền hiện có, hệ thống trả về 0 VND/tháng."
        />
      </CalculatorPanel>
    </ToolPageShell>
  );
};

export default SavingPlan;
