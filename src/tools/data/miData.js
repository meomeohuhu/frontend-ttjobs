export const miGroups = [
  { id: "linguistic", label: "Ngôn ngữ", career: "Content, truyền thông, luật, đào tạo" },
  { id: "logical", label: "Logic - toán học", career: "Kỹ thuật, dữ liệu, tài chính, phân tích" },
  { id: "spatial", label: "Không gian", career: "Thiết kế, kiến trúc, UI/UX, dựng hình" },
  { id: "bodily", label: "Vận động", career: "Thể thao, y tế vận động, sự kiện, sản xuất" },
  { id: "musical", label: "Âm nhạc", career: "Âm thanh, sản xuất nội dung, biểu diễn" },
  { id: "interpersonal", label: "Tương tác", career: "Nhân sự, sales, customer success, quản lý" },
  { id: "intrapersonal", label: "Nội tâm", career: "Tư vấn, nghiên cứu, viết, chiến lược cá nhân" },
  { id: "naturalist", label: "Tự nhiên", career: "Môi trường, nông nghiệp, sinh học, bền vững" }
];

export const miQuestions = miGroups.flatMap((group) => [
  { id: `${group.id}-1`, group: group.id, text: `Tôi thường nhận ra điểm mạnh liên quan đến ${group.label.toLowerCase()} trong công việc hằng ngày.` },
  { id: `${group.id}-2`, group: group.id, text: `Tôi học nhanh hơn khi nội dung được trình bày qua ${group.label.toLowerCase()}.` },
  { id: `${group.id}-3`, group: group.id, text: `Tôi có thể duy trì tập trung lâu với hoạt động thuộc nhóm ${group.label.toLowerCase()}.` }
]);
