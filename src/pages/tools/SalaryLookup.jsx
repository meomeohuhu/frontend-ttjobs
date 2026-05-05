import { useMemo, useState } from "react";
import { salaryRows } from "../../tools/data/salaryData.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const unique = (key) => ["Tất cả", ...Array.from(new Set(salaryRows.map((row) => row[key])))];

const SalaryLookup = () => {
  const [industry, setIndustry] = useState("Tất cả");
  const [location, setLocation] = useState("Tất cả");
  const [level, setLevel] = useState("Tất cả");
  const rows = useMemo(() => salaryRows.filter((row) => (
    (industry === "Tất cả" || row.industry === industry) &&
    (location === "Tất cả" || row.location === location) &&
    (level === "Tất cả" || row.level === level)
  )), [industry, level, location]);

  return (
    <ToolPageShell tool={toolBySlug["salary-lookup"]}>
      <section className="tool-filter-bar">
        <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
          {unique("industry").map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={location} onChange={(event) => setLocation(event.target.value)}>
          {unique("location").map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          {unique("level").map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>
      <section className="salary-table">
        <div className="salary-table-head">
          <span>Ngành</span>
          <span>Khu vực</span>
          <span>Kinh nghiệm</span>
          <span>P25</span>
          <span>P50</span>
          <span>P75</span>
        </div>
        {rows.map((row) => (
          <div key={row.id}>
            <span>{row.industry}</span>
            <span>{row.location}</span>
            <span>{row.level}</span>
            <strong>{row.p25}tr</strong>
            <strong>{row.p50}tr</strong>
            <strong>{row.p75}tr</strong>
          </div>
        ))}
      </section>
      <p className="result-note">Dữ liệu tham khảo V1, cập nhật Q1/2026. Chưa thay thế khảo sát lương chính thức.</p>
    </ToolPageShell>
  );
};

export default SalaryLookup;
