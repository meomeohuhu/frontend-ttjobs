const baseQuestions = [
  ["general", "Junior", "Hãy giới thiệu ngắn gọn về bản thân.", "Tập trung vào nền tảng, kỹ năng liên quan và lý do phù hợp với vị trí."],
  ["general", "Junior", "Vì sao bạn muốn làm ở công ty này?", "Nêu sản phẩm, môi trường, cơ hội học hỏi và điểm bạn có thể đóng góp."],
  ["general", "Mid", "Bạn xử lý mâu thuẫn trong nhóm như thế nào?", "Mô tả tình huống, cách lắng nghe, dữ kiện, quyết định và kết quả."],
  ["general", "Senior", "Bạn đo lường hiệu quả công việc của mình bằng gì?", "Nêu metric, chất lượng đầu ra, tác động kinh doanh và phản hồi stakeholder."],
  ["engineering", "Junior", "REST API là gì?", "Giải thích resource, HTTP method, status code và ví dụ endpoint."],
  ["engineering", "Junior", "Bạn debug một lỗi production như thế nào?", "Khoanh vùng log, tái hiện, kiểm tra thay đổi gần nhất, hotfix và viết postmortem."],
  ["engineering", "Mid", "Bạn thiết kế phân trang API như thế nào?", "Nêu page/size hoặc cursor, sort ổn định, index database và contract response."],
  ["engineering", "Mid", "Khi nào cần cache?", "Dùng khi dữ liệu đọc nhiều, tính toán tốn kém; nói thêm invalidation và TTL."],
  ["engineering", "Senior", "Bạn review code tập trung vào gì?", "Correctness, security, maintainability, tests, observability và backward compatibility."],
  ["engineering", "Senior", "Thiết kế hệ thống job recommendation V1.", "Nêu data source, matching, scoring, cache, feedback loop và monitoring."],
  ["product", "Junior", "User story tốt cần có gì?", "Có user, need, value, acceptance criteria và edge cases chính."],
  ["product", "Mid", "Bạn ưu tiên backlog thế nào?", "Kết hợp impact, effort, risk, urgency, dependency và dữ liệu người dùng."],
  ["product", "Senior", "Bạn xử lý khi stakeholder mâu thuẫn mục tiêu?", "Làm rõ metric, trade-off, quyết định minh bạch và follow-up bằng dữ liệu."],
  ["marketing", "Junior", "Bạn đánh giá một campaign ra sao?", "Nêu mục tiêu, channel, conversion, CAC, retention hoặc brand lift."],
  ["marketing", "Mid", "SEO và content strategy liên quan thế nào?", "SEO định hướng nhu cầu tìm kiếm, content giải quyết intent và tạo trust."],
  ["sales", "Junior", "Bạn xử lý khách hàng từ chối thế nào?", "Xác nhận lý do, hỏi thêm, phản hồi đúng pain point và giữ quan hệ."],
  ["sales", "Mid", "Pipeline khỏe là pipeline như thế nào?", "Có stage rõ, next step, probability thực tế, deal age và forecast đáng tin."],
  ["hr", "Junior", "Bạn sàng lọc CV theo tiêu chí nào?", "So với JD: kỹ năng, kinh nghiệm, domain, động lực, salary range và notice period."],
  ["hr", "Mid", "Bạn giảm time-to-hire bằng cách nào?", "Chuẩn hóa JD, scorecard, pipeline, scheduling và phản hồi nhanh."],
  ["design", "Junior", "Bạn trình bày portfolio thế nào?", "Nói rõ problem, process, decision, trade-off và impact."],
  ["design", "Mid", "Bạn xử lý feedback trái chiều ra sao?", "Quay về mục tiêu người dùng, dữ liệu, constraint và thử nghiệm nhanh."]
];

const extras = Array.from({ length: 32 }, (_, index) => {
  const tracks = ["engineering", "product", "marketing", "sales", "hr", "design", "general"];
  const levels = ["Junior", "Mid", "Senior"];
  const track = tracks[index % tracks.length];
  const level = levels[index % levels.length];
  return [
    track,
    level,
    `Tình huống ${index + 1}: Bạn sẽ xử lý một yêu cầu khó trong nhóm ${track} như thế nào?`,
    "Trả lời theo cấu trúc STAR: Situation, Task, Action, Result; thêm bài học và cách cải thiện."
  ];
});

export const interviewQuestions = [...baseQuestions, ...extras].map(([track, level, question, answer], index) => ({
  id: index + 1,
  track,
  level,
  question,
  answer
}));

export const interviewTracks = [
  { value: "all", label: "Tất cả ngành" },
  { value: "engineering", label: "Công nghệ" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "Nhân sự" },
  { value: "design", label: "Thiết kế" },
  { value: "general", label: "Câu hỏi chung" }
];
