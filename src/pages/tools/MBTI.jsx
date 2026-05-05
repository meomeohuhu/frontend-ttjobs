import { useMemo, useState } from "react";
import { mbtiQuestions, getMbtiResult } from "../../tools/data/mbtiData.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const MBTI = () => {
  const [answers, setAnswers] = useState({});
  const type = useMemo(() => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    mbtiQuestions.forEach((question) => {
      const value = answers[question.id] || 0;
      if (value < 0) scores[question.leftType] += Math.abs(value);
      if (value > 0) scores[question.rightType] += value;
    });
    return `${scores.E >= scores.I ? "E" : "I"}${scores.S >= scores.N ? "S" : "N"}${scores.T >= scores.F ? "T" : "F"}${scores.J >= scores.P ? "J" : "P"}`;
  }, [answers]);
  const result = getMbtiResult(type);
  const completed = Object.keys(answers).length === mbtiQuestions.length;

  return (
    <ToolPageShell tool={toolBySlug.mbti}>
      <section className="quiz-panel">
        <div className="tool-section-heading">
          <p>16 câu hỏi</p>
          <h2>Chọn phía giống bạn hơn</h2>
          <span>Kéo về trái/phải theo mức độ đồng ý. Đây là bài tham khảo, không phải đánh giá tâm lý chính thức.</span>
        </div>
        {mbtiQuestions.map((question) => (
          <div className="mbti-question" key={question.id}>
            <span>{question.left}</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              value={answers[question.id] ?? 0}
              onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: Number(event.target.value) }))}
            />
            <span>{question.right}</span>
          </div>
        ))}
      </section>
      <section className="quiz-result">
        <p>Kết quả hiện tại</p>
        <h2>{type} - {result.title}</h2>
        <span>{completed ? result.summary : "Hoàn thành tất cả câu hỏi để kết quả ổn định hơn."}</span>
        <div className="career-chip-list">
          {result.careers.map((career) => <em key={career}>{career}</em>)}
        </div>
      </section>
    </ToolPageShell>
  );
};

export default MBTI;
