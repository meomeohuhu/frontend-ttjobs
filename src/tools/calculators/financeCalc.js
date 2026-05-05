const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const calculateCompoundInterest = ({ principal = 0, monthlyContribution = 0, annualRate = 0, years = 0 }) => {
  const initial = Math.max(0, safeNumber(principal));
  const monthly = Math.max(0, safeNumber(monthlyContribution));
  const totalMonths = Math.max(0, Math.floor(safeNumber(years) * 12));
  const monthlyRate = Math.max(0, safeNumber(annualRate)) / 100 / 12;
  const points = [];
  let balance = initial;

  for (let month = 1; month <= totalMonths; month += 1) {
    balance = balance * (1 + monthlyRate) + monthly;
    if (month % 12 === 0 || month === totalMonths) {
      points.push({ label: `Năm ${Math.ceil(month / 12)}`, value: Math.round(balance) });
    }
  }

  const totalContributed = initial + monthly * totalMonths;
  return {
    initial,
    totalAdded: monthly * totalMonths,
    interest: Math.max(0, Math.round(balance - totalContributed)),
    finalValue: Math.round(balance),
    points
  };
};

export const calculateSavingPlan = ({ principal = 0, target = 0, annualRate = 0, years = 0 }) => {
  const initial = Math.max(0, safeNumber(principal));
  const goal = Math.max(0, safeNumber(target));
  const totalMonths = Math.max(0, Math.floor(safeNumber(years) * 12));
  const monthlyRate = Math.max(0, safeNumber(annualRate)) / 100 / 12;

  if (goal <= initial || totalMonths === 0) {
    return {
      requiredMonthly: 0,
      totalAdded: 0,
      interestSupport: Math.max(0, goal - initial),
      finalValue: initial,
      points: [{ label: "Hiện tại", value: initial }]
    };
  }

  const growth = Math.pow(1 + monthlyRate, totalMonths);
  const annuityFactor = monthlyRate === 0 ? totalMonths : (growth - 1) / monthlyRate;
  const requiredMonthly = Math.max(0, Math.ceil((goal - initial * growth) / annuityFactor));
  const compound = calculateCompoundInterest({
    principal: initial,
    monthlyContribution: requiredMonthly,
    annualRate,
    years
  });

  return {
    requiredMonthly,
    totalAdded: requiredMonthly * totalMonths,
    interestSupport: Math.max(0, compound.finalValue - initial - requiredMonthly * totalMonths),
    finalValue: compound.finalValue,
    points: compound.points
  };
};
