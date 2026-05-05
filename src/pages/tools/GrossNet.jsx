import { useMemo, useState } from "react";
import CalculatorPanel from "../../tools/components/CalculatorPanel.jsx";
import ResultPanel, { formatVnd } from "../../tools/components/ResultPanel.jsx";
import { calculateGrossNet } from "../../tools/calculators/salaryCalc.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const fields = [
  { name: "grossSalary", label: "Lương Gross", unit: "VND" },
  { name: "insuranceSalary", label: "Lương đóng bảo hiểm", unit: "VND", helper: "Mặc định nên bằng gross, có trần theo vùng." },
  { name: "region", label: "Vùng", type: "select", options: [1, 2, 3, 4].map((value) => ({ value, label: `Vùng ${value}` })) },
  { name: "dependents", label: "Người phụ thuộc" },
  { name: "contractType", label: "Loại hợp đồng", type: "select", options: [
    { value: "standard", label: "Từ 3 tháng trở lên" },
    { value: "seasonal", label: "Thời vụ / không đóng BH" }
  ] }
];

const GrossNet = () => {
  const [values, setValues] = useState({ grossSalary: 25000000, insuranceSalary: 25000000, region: 1, dependents: 0, contractType: "standard" });
  const result = useMemo(() => calculateGrossNet(values), [values]);
  const total = Math.max(result.gross, 1);

  return (
    <ToolPageShell tool={toolBySlug["gross-net"]}>
      <CalculatorPanel title="Tính lương thực nhận" fields={fields} values={values} onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}>
        <ResultPanel
          title="Kết quả Gross - Net"
          rows={[
            { label: "Lương Net", value: formatVnd(result.net), highlight: true },
            { label: "Tổng bảo hiểm", value: formatVnd(result.totalInsurance) },
            { label: "Thuế TNCN", value: formatVnd(result.pit) },
            { label: "Thu nhập tính thuế", value: formatVnd(result.taxableIncome) }
          ]}
          chartRows={[
            { label: "Net", percent: (result.net / total) * 100, color: "#2563eb" },
            { label: "Thuế", percent: (result.pit / total) * 100, color: "#f97316" },
            { label: "Bảo hiểm", percent: (result.totalInsurance / total) * 100, color: "#ef4444" }
          ]}
          note={result.sourceNote}
        />
      </CalculatorPanel>
    </ToolPageShell>
  );
};

export default GrossNet;
