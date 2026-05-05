import { useMemo, useState } from "react";
import CalculatorPanel from "../../tools/components/CalculatorPanel.jsx";
import ResultPanel, { formatVnd } from "../../tools/components/ResultPanel.jsx";
import { calculateCompoundInterest } from "../../tools/calculators/financeCalc.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const CompoundInterest = () => {
  const [values, setValues] = useState({ principal: 50000000, monthlyContribution: 5000000, annualRate: 8, years: 5 });
  const result = useMemo(() => calculateCompoundInterest(values), [values]);

  return (
    <ToolPageShell tool={toolBySlug["compound-interest"]}>
      <CalculatorPanel
        title="Mô phỏng lãi kép"
        values={values}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        fields={[
          { name: "principal", label: "Vốn ban đầu", unit: "VND" },
          { name: "monthlyContribution", label: "Gửi thêm mỗi tháng", unit: "VND" },
          { name: "annualRate", label: "Lãi suất năm", unit: "%" },
          { name: "years", label: "Số năm" }
        ]}
      >
        <ResultPanel
          title="Giá trị tương lai"
          rows={[
            { label: "Giá trị cuối kỳ", value: formatVnd(result.finalValue), highlight: true },
            { label: "Vốn ban đầu", value: formatVnd(result.initial) },
            { label: "Tổng góp thêm", value: formatVnd(result.totalAdded) },
            { label: "Lãi tích lũy", value: formatVnd(result.interest) }
          ]}
          points={result.points}
          note="Kết quả chỉ mang tính tham khảo, chưa bao gồm thuế/phí và biến động lãi suất."
        />
      </CalculatorPanel>
    </ToolPageShell>
  );
};

export default CompoundInterest;
