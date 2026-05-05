export const REGION_MINIMUM_WAGE_2026 = {
  1: 5_310_000,
  2: 4_730_000,
  3: 4_140_000,
  4: 3_700_000
};

export const PERSONAL_DEDUCTION = 11_000_000;
export const DEPENDENT_DEDUCTION = 4_400_000;

export const PIT_BRACKETS = [
  { label: "Đến 5 triệu", cap: 5_000_000, rate: 0.05 },
  { label: "Trên 5 - 10 triệu", cap: 5_000_000, rate: 0.1 },
  { label: "Trên 10 - 18 triệu", cap: 8_000_000, rate: 0.15 },
  { label: "Trên 18 - 32 triệu", cap: 14_000_000, rate: 0.2 },
  { label: "Trên 32 - 52 triệu", cap: 20_000_000, rate: 0.25 },
  { label: "Trên 52 - 80 triệu", cap: 28_000_000, rate: 0.3 },
  { label: "Trên 80 triệu", cap: Infinity, rate: 0.35 }
];

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const calculatePit = (taxableIncome) => {
  let remaining = Math.max(0, safeNumber(taxableIncome));
  const rows = [];
  let total = 0;

  for (const bracket of PIT_BRACKETS) {
    const amount = Math.min(remaining, bracket.cap);
    const tax = Math.round(amount * bracket.rate);
    rows.push({ ...bracket, amount, tax });
    total += tax;
    remaining -= amount;
    if (remaining <= 0) break;
  }

  return { total, rows };
};

export const calculateGrossNet = ({
  grossSalary = 0,
  insuranceSalary = grossSalary,
  dependents = 0,
  region = 1,
  contractType = "standard"
}) => {
  const gross = Math.max(0, safeNumber(grossSalary));
  const regionMinimum = REGION_MINIMUM_WAGE_2026[region] || REGION_MINIMUM_WAGE_2026[1];
  const insuranceCap = regionMinimum * 20;
  const base = contractType === "seasonal" ? 0 : Math.min(Math.max(0, safeNumber(insuranceSalary) || gross), insuranceCap);

  const bhxh = Math.round(base * 0.08);
  const bhyt = Math.round(base * 0.015);
  const bhtn = Math.round(Math.min(base, regionMinimum * 20) * 0.01);
  const totalInsurance = bhxh + bhyt + bhtn;
  const taxableIncome = Math.max(
    0,
    gross - totalInsurance - PERSONAL_DEDUCTION - Math.max(0, safeNumber(dependents)) * DEPENDENT_DEDUCTION
  );
  const pit = calculatePit(taxableIncome);
  const net = Math.max(0, gross - totalInsurance - pit.total);

  return {
    gross,
    regionMinimum,
    insuranceBase: base,
    bhxh,
    bhyt,
    bhtn,
    totalInsurance,
    taxableIncome,
    pit: pit.total,
    pitRows: pit.rows,
    net,
    sourceNote: "Tham khảo biểu thuế TNCN của Cục Thuế và mức lương tối thiểu vùng 2026 dùng cho trần đóng bảo hiểm."
  };
};
