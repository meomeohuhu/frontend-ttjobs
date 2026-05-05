import { useMemo, useState } from "react";
import CalculatorPanel from "../../tools/components/CalculatorPanel.jsx";
import ResultPanel, { formatVnd } from "../../tools/components/ResultPanel.jsx";
import { calculateSocialInsuranceOnce } from "../../tools/calculators/insuranceCalc.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const SocialInsuranceOnce = () => {
  const [values, setValues] = useState({ yearsBeforeJuly2025: 3, yearsFromJuly2025: 1, averageSalary: 12000000 });
  const result = useMemo(() => calculateSocialInsuranceOnce(values), [values]);

  return (
    <ToolPageShell tool={toolBySlug["social-insurance-once"]}>
      <CalculatorPanel
        title="Tính BHXH một lần"
        values={values}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        fields={[
          { name: "yearsBeforeJuly2025", label: "Số năm trước 01/07/2025" },
          { name: "yearsFromJuly2025", label: "Số năm từ 01/07/2025" },
          { name: "averageSalary", label: "Lương bình quân đóng", unit: "VND" }
        ]}
      >
        <ResultPanel
          title="Khoản nhận ước tính"
          rows={[
            { label: "Tổng tham khảo", value: formatVnd(result.total), highlight: true },
            { label: "Phần trước 01/07/2025", value: formatVnd(result.beforeAmount) },
            { label: "Phần từ 01/07/2025", value: formatVnd(result.afterAmount) }
          ]}
          note={result.sourceNote}
        />
      </CalculatorPanel>
    </ToolPageShell>
  );
};

export default SocialInsuranceOnce;
