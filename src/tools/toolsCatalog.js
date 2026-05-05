export const legacyToolSlugMap = {
  "gross-net": "gross-net",
  pit: "personal-income-tax",
  unemployment: "unemployment-insurance",
  "social-insurance": "social-insurance-once",
  "social-once": "social-insurance-once",
  compound: "compound-interest",
  "saving-plan": "saving-plan",
  mbti: "mbti",
  mi: "mi",
  "interview-questions": "interview-questions",
  "salary-lookup": "salary-lookup"
};

export const toolGroups = [
  {
    id: "finance",
    title: "Công cụ tài chính",
    eyebrow: "CÔNG CỤ",
    summary: "Tính nhanh lương, thuế, bảo hiểm và kế hoạch tiền bạc trước khi ra quyết định nghề nghiệp."
  },
  {
    id: "selfdev",
    title: "Khám phá bản thân",
    eyebrow: "KHÁM PHÁ VÀ NÂNG CẤP BẢN THÂN",
    summary: "Các bài trắc nghiệm tham khảo giúp gọi tên điểm mạnh, phong cách làm việc và hướng phát triển."
  },
  {
    id: "career",
    title: "Tham khảo nghề nghiệp",
    eyebrow: "THAM KHẢO NHANH",
    summary: "Tra cứu câu hỏi phỏng vấn, mức lương và các tài nguyên hỗ trợ ứng tuyển."
  }
];

export const toolsCatalog = [
  {
    id: "gross-net",
    slug: "gross-net",
    group: "finance",
    icon: "wallet",
    title: "Tính lương Gross - Net",
    summary: "Ước tính lương thực nhận sau bảo hiểm và thuế thu nhập cá nhân.",
    badge: "Phổ biến",
    to: "/tools/gross-net"
  },
  {
    id: "pit",
    slug: "personal-income-tax",
    group: "finance",
    icon: "receipt",
    title: "Tính thuế thu nhập cá nhân",
    summary: "Xem nhanh thuế TNCN theo thu nhập, giảm trừ bản thân và người phụ thuộc.",
    to: "/tools/personal-income-tax"
  },
  {
    id: "unemployment",
    slug: "unemployment-insurance",
    group: "finance",
    icon: "shield",
    title: "Tính bảo hiểm thất nghiệp",
    summary: "Ước tính mức hưởng BHTN theo lương đóng, vùng lương và thời gian tham gia.",
    to: "/tools/unemployment-insurance"
  },
  {
    id: "social-once",
    slug: "social-insurance-once",
    group: "finance",
    icon: "archive",
    title: "Tính BHXH một lần",
    summary: "Tính tham khảo khoản BHXH một lần theo số năm đóng trước và sau 01/07/2025.",
    to: "/tools/social-insurance-once"
  },
  {
    id: "compound",
    slug: "compound-interest",
    group: "finance",
    icon: "trend",
    title: "Tính lãi suất kép",
    summary: "Mô phỏng tăng trưởng khoản tiết kiệm theo vốn ban đầu, góp thêm và lãi suất.",
    badge: "Phổ biến",
    to: "/tools/compound-interest"
  },
  {
    id: "saving-plan",
    slug: "saving-plan",
    group: "finance",
    icon: "target",
    title: "Lập kế hoạch tiết kiệm",
    summary: "Tính số tiền cần tiết kiệm mỗi tháng để đạt mục tiêu tài chính.",
    to: "/tools/saving-plan"
  },
  {
    id: "mbti",
    slug: "mbti",
    group: "selfdev",
    icon: "spark",
    title: "Trắc nghiệm MBTI",
    summary: "Bài test tham khảo 16 câu để nhận diện phong cách làm việc và môi trường phù hợp.",
    badge: "Beta",
    to: "/tools/mbti"
  },
  {
    id: "mi",
    slug: "mi",
    group: "selfdev",
    icon: "radar",
    title: "Trắc nghiệm đa trí thông minh MI",
    summary: "Khám phá nhóm năng lực nổi trội theo 8 loại trí thông minh Howard Gardner.",
    badge: "Beta",
    to: "/tools/mi"
  },
  {
    id: "interview",
    slug: "interview-questions",
    group: "career",
    icon: "chat",
    title: "Bộ câu hỏi phỏng vấn",
    summary: "Lọc câu hỏi theo ngành, vị trí, mức độ và xem gợi ý trả lời ngắn gọn.",
    badge: "Mới",
    to: "/tools/interview-questions"
  },
  {
    id: "salary-lookup",
    slug: "salary-lookup",
    group: "career",
    icon: "search",
    title: "Tra cứu lương",
    summary: "Bảng lương tham khảo theo ngành, khu vực và số năm kinh nghiệm.",
    badge: "Mới",
    to: "/tools/salary-lookup"
  }
];

export const toolBySlug = Object.fromEntries(toolsCatalog.map((tool) => [tool.slug, tool]));
export const toolsByGroup = toolGroups.map((group) => ({
  ...group,
  tools: toolsCatalog.filter((tool) => tool.group === group.id)
}));
