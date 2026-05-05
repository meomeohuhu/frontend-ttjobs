export const salaryRows = [
  ["Công nghệ thông tin", "Hà Nội", "Junior", 12, 18, 25],
  ["Công nghệ thông tin", "TP Hồ Chí Minh", "Mid", 25, 38, 55],
  ["Công nghệ thông tin", "Remote", "Senior", 45, 65, 90],
  ["Kinh doanh - Bán hàng", "Hà Nội", "Junior", 8, 12, 18],
  ["Kinh doanh - Bán hàng", "TP Hồ Chí Minh", "Mid", 16, 24, 38],
  ["Marketing - PR", "Hà Nội", "Junior", 9, 14, 20],
  ["Marketing - PR", "TP Hồ Chí Minh", "Mid", 18, 28, 42],
  ["Nhân sự - Hành chính", "Hà Nội", "Junior", 8, 12, 17],
  ["Nhân sự - Hành chính", "TP Hồ Chí Minh", "Mid", 15, 22, 32],
  ["Tài chính - Kế toán", "Hà Nội", "Junior", 9, 13, 19],
  ["Tài chính - Kế toán", "TP Hồ Chí Minh", "Senior", 30, 45, 70],
  ["Thiết kế", "Hà Nội", "Junior", 10, 15, 22],
  ["Thiết kế", "TP Hồ Chí Minh", "Mid", 20, 30, 45],
  ["Chăm sóc khách hàng", "Hà Nội", "Junior", 7, 10, 14],
  ["Vận hành", "TP Hồ Chí Minh", "Senior", 28, 40, 60]
].map(([industry, location, level, p25, p50, p75], index) => ({
  id: index + 1,
  industry,
  location,
  level,
  p25,
  p50,
  p75
}));
