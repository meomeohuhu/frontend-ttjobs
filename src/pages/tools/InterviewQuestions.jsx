import { useMemo, useState } from "react";
import { interviewQuestions, interviewTracks } from "../../tools/data/interviewData.js";
import { toolBySlug } from "../../tools/toolsCatalog.js";
import ToolPageShell from "./ToolPageShell.jsx";

const InterviewQuestions = () => {
  const [track, setTrack] = useState("all");
  const [level, setLevel] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [openId, setOpenId] = useState(1);
  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return interviewQuestions.filter((item) => {
      const matchTrack = track === "all" || item.track === track;
      const matchLevel = level === "all" || item.level === level;
      const matchKeyword = !query || item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query);
      return matchTrack && matchLevel && matchKeyword;
    });
  }, [keyword, level, track]);

  return (
    <ToolPageShell tool={toolBySlug["interview-questions"]}>
      <section className="tool-filter-bar">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm câu hỏi..." />
        <select value={track} onChange={(event) => setTrack(event.target.value)}>
          {interviewTracks.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="all">Tất cả cấp độ</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
      </section>
      <section className="accordion-list">
        {filtered.map((item) => (
          <article key={item.id}>
            <button type="button" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
              <span>{item.level} · {item.track}</span>
              <strong>{item.question}</strong>
            </button>
            {openId === item.id ? <p>{item.answer}</p> : null}
          </article>
        ))}
      </section>
    </ToolPageShell>
  );
};

export default InterviewQuestions;
