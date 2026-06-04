import { useMemo, useState } from "react";
import { miGroups, miQuestions } from "../../tools/data/miData.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const MultipleIntelligence = () => {
  const [answers, setAnswers] = useState({});
  const scores = useMemo(() => miGroups.map((group) => {
    const groupQuestions = miQuestions.filter((question) => question.group === group.id);
    const score = groupQuestions.reduce((total, question) => total + Number(answers[question.id] || 3), 0);
    return { ...group, score };
  }).sort((a, b) => b.score - a.score), [answers]);

  return (
    <ToolPageShell tool={toolBySlug.mi}>
      <section className="quiz-panel">
        <div className="tool-section-heading">
          <p>24 câu hỏi</p>
          <h2>Đánh giá mức phù hợp từ 1 đến 5</h2>
        </div>
        {miQuestions.map((question) => (
          <label className="mi-question" key={question.id}>
            <span>{question.text}</span>
            <select value={answers[question.id] || 3} onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: Number(event.target.value) }))}>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        ))}
      </section>
      <section className="quiz-result">
        <p>Top nhóm nổi trội</p>
        <h2>{scores[0].label}</h2>
        <div className="mi-score-list">
          {scores.slice(0, 8).map((item) => (
            <div key={item.id}>
              <span>{item.label}</span>
              <strong>{item.score}/15</strong>
              <i style={{ width: `${(item.score / 15) * 100}%` }} />
            </div>
          ))}
        </div>
        <span className="label-value-line"><span>Gợi ý hướng nghề:</span><span>{scores.slice(0, 3).map((item) => item.career).join("; ")}.</span></span>
      </section>
    </ToolPageShell>
  );
};

export default MultipleIntelligence;
