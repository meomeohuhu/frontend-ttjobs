export const mbtiQuestions = [
  { id: 1, axis: "EI", left: "Tôi nạp năng lượng khi ở một mình", right: "Tôi nạp năng lượng khi tương tác với người khác", leftType: "I", rightType: "E" },
  { id: 2, axis: "EI", left: "Tôi thích suy nghĩ kỹ rồi mới nói", right: "Tôi thường nghĩ trong lúc trao đổi", leftType: "I", rightType: "E" },
  { id: 3, axis: "EI", left: "Tôi thích nhóm nhỏ, sâu", right: "Tôi thích môi trường nhiều kết nối", leftType: "I", rightType: "E" },
  { id: 4, axis: "EI", left: "Tôi cần khoảng lặng sau ngày dài", right: "Tôi thích thêm hoạt động sau giờ làm", leftType: "I", rightType: "E" },
  { id: 5, axis: "SN", left: "Tôi tin vào dữ kiện cụ thể", right: "Tôi chú ý khả năng và xu hướng", leftType: "S", rightType: "N" },
  { id: 6, axis: "SN", left: "Tôi thích hướng dẫn rõ từng bước", right: "Tôi thích tự tìm cách mới", leftType: "S", rightType: "N" },
  { id: 7, axis: "SN", left: "Tôi kiểm tra chi tiết hiện tại", right: "Tôi nhìn bức tranh dài hạn", leftType: "S", rightType: "N" },
  { id: 8, axis: "SN", left: "Tôi học tốt qua ví dụ thực tế", right: "Tôi học tốt qua mô hình và ý tưởng", leftType: "S", rightType: "N" },
  { id: 9, axis: "TF", left: "Tôi ưu tiên logic và tiêu chuẩn", right: "Tôi ưu tiên tác động đến con người", leftType: "T", rightType: "F" },
  { id: 10, axis: "TF", left: "Tôi góp ý thẳng vào vấn đề", right: "Tôi cân nhắc cảm xúc khi góp ý", leftType: "T", rightType: "F" },
  { id: 11, axis: "TF", left: "Tôi quyết định bằng phân tích", right: "Tôi quyết định bằng giá trị cá nhân", leftType: "T", rightType: "F" },
  { id: 12, axis: "TF", left: "Công bằng là áp dụng nguyên tắc", right: "Công bằng là xét hoàn cảnh", leftType: "T", rightType: "F" },
  { id: 13, axis: "JP", left: "Tôi thích kế hoạch rõ ràng", right: "Tôi thích linh hoạt tùy tình huống", leftType: "J", rightType: "P" },
  { id: 14, axis: "JP", left: "Tôi muốn chốt quyết định sớm", right: "Tôi muốn giữ thêm lựa chọn", leftType: "J", rightType: "P" },
  { id: 15, axis: "JP", left: "Deadline giúp tôi tập trung", right: "Áp lực cuối kỳ giúp tôi bật ý tưởng", leftType: "J", rightType: "P" },
  { id: 16, axis: "JP", left: "Tôi thích checklist và quy trình", right: "Tôi thích thử nghiệm và điều chỉnh", leftType: "J", rightType: "P" }
];

const fallback = {
  title: "Nhóm cân bằng",
  summary: "Bạn có xu hướng linh hoạt theo ngữ cảnh. Hãy dùng kết quả này như điểm bắt đầu để quan sát cách mình làm việc.",
  careers: ["Business Analyst", "Product Executive", "Project Coordinator"]
};

export const mbtiResults = {
  INTJ: { title: "Chiến lược gia", summary: "Phù hợp việc cần hệ thống, tự chủ, tư duy dài hạn và tiêu chuẩn cao.", careers: ["Software Architect", "Data Analyst", "Product Strategist"] },
  INTP: { title: "Nhà phân tích", summary: "Mạnh ở mô hình hóa, giải quyết vấn đề phức tạp và khám phá ý tưởng mới.", careers: ["Backend Engineer", "Researcher", "Data Scientist"] },
  ENTJ: { title: "Nhà dẫn dắt", summary: "Phù hợp vai trò định hướng mục tiêu, tổ chức nguồn lực và ra quyết định.", careers: ["Product Manager", "Team Lead", "Operations Manager"] },
  ENTP: { title: "Người khai phá", summary: "Hợp môi trường đổi mới, tranh luận ý tưởng và thử nghiệm giải pháp.", careers: ["Growth Marketer", "Startup Founder", "Solution Consultant"] },
  INFJ: { title: "Cố vấn", summary: "Mạnh ở hiểu con người, nhìn hệ thống giá trị và tạo ảnh hưởng tích cực.", careers: ["UX Researcher", "HR Business Partner", "Career Coach"] },
  INFP: { title: "Người kiến tạo ý nghĩa", summary: "Phù hợp công việc sáng tạo, nhân văn và có không gian thể hiện cá tính.", careers: ["Content Strategist", "Designer", "Community Specialist"] },
  ENFJ: { title: "Người truyền cảm hứng", summary: "Mạnh ở kết nối, huấn luyện, dẫn dắt nhóm và phát triển con người.", careers: ["HR Manager", "Trainer", "Customer Success"] },
  ENFP: { title: "Người khởi xướng", summary: "Hợp môi trường năng động, nhiều ý tưởng, giao tiếp và tạo động lực.", careers: ["Marketing Executive", "Recruiter", "Product Evangelist"] },
  ISTJ: { title: "Người tổ chức", summary: "Mạnh ở trách nhiệm, quy trình, độ tin cậy và kiểm soát chất lượng.", careers: ["QA Engineer", "Accountant", "Operations Specialist"] },
  ISFJ: { title: "Người hỗ trợ", summary: "Phù hợp vai trò cần chăm sóc chi tiết, ổn định và hỗ trợ người khác.", careers: ["HR Admin", "Customer Support", "Office Manager"] },
  ESTJ: { title: "Người điều phối", summary: "Mạnh ở vận hành, tiêu chuẩn rõ ràng, quản trị tiến độ và hiệu suất.", careers: ["Project Manager", "Sales Manager", "Operations Lead"] },
  ESFJ: { title: "Người kết nối", summary: "Hợp công việc phối hợp, dịch vụ, truyền thông nội bộ và chăm sóc khách hàng.", careers: ["Account Executive", "HR Specialist", "Event Coordinator"] },
  ISTP: { title: "Người giải quyết", summary: "Mạnh ở xử lý thực tế, tối ưu hệ thống và phản ứng nhanh với vấn đề.", careers: ["DevOps Engineer", "Technical Support", "Security Analyst"] },
  ISFP: { title: "Người tinh tế", summary: "Phù hợp công việc cần cảm nhận thẩm mỹ, trải nghiệm và sự linh hoạt.", careers: ["UI Designer", "Photographer", "Brand Executive"] },
  ESTP: { title: "Người hành động", summary: "Mạnh ở môi trường tốc độ cao, giao tiếp trực tiếp và xử lý tình huống.", careers: ["Sales Executive", "Business Development", "Field Operations"] },
  ESFP: { title: "Người lan tỏa", summary: "Hợp vai trò nhiều tương tác, năng lượng tích cực và trải nghiệm khách hàng.", careers: ["Community Manager", "Host", "Customer Experience"] }
};

export const getMbtiResult = (type) => mbtiResults[type] || fallback;
