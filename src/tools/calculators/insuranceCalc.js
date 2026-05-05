import { REGION_MINIMUM_WAGE_2026 } from "./salaryCalc.js";

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const calculateUnemploymentInsurance = ({ salary = 0, region = 1, paidMonths = 12 }) => {
  const regionMinimum = REGION_MINIMUM_WAGE_2026[region] || REGION_MINIMUM_WAGE_2026[1];
  const monthlyCap = regionMinimum * 5;
  const monthlyBenefit = Math.round(Math.min(Math.max(0, safeNumber(salary)) * 0.6, monthlyCap));
  const months = Math.max(0, Math.floor(safeNumber(paidMonths)));
  let benefitMonths = 0;

  if (months >= 12) {
    benefitMonths = 3 + Math.floor(Math.max(0, months - 36) / 12);
  }

  benefitMonths = Math.min(12, benefitMonths);

  return {
    regionMinimum,
    monthlyCap,
    monthlyBenefit,
    benefitMonths,
    totalBenefit: monthlyBenefit * benefitMonths,
    sourceNote: "Tham khảo quy định BHXH Việt Nam: mức hưởng BHTN bằng 60% lương đóng, có trần theo vùng."
  };
};

export const calculateSocialInsuranceOnce = ({
  yearsBeforeJuly2025 = 0,
  yearsFromJuly2025 = 0,
  averageSalary = 0
}) => {
  const before = Math.max(0, safeNumber(yearsBeforeJuly2025));
  const after = Math.max(0, safeNumber(yearsFromJuly2025));
  const salary = Math.max(0, safeNumber(averageSalary));
  const beforeAmount = Math.round(before * 1.5 * salary);
  const afterAmount = Math.round(after * 2 * salary);

  return {
    beforeAmount,
    afterAmount,
    total: beforeAmount + afterAmount,
    sourceNote: "Tham khảo Luật BHXH 2024; kết quả cần đối chiếu sổ BHXH và hệ số điều chỉnh thực tế."
  };
};
