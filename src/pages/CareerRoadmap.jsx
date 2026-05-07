import { useState } from "react";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import { API_BASE_URL } from "../lib/api.js";

const emptyForm = {
  mbti: "ENFP",
  currentRole: "",
  targetRole: "",
  skills: "",
  experienceYears: 1
};

const CareerRoadmap = () => {
  const [form, setForm] = useState(emptyForm);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generateRoadmap = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/career-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experienceYears: Number(form.experienceYears),
          skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
        })
      });
      if (!response.ok) {
        throw new Error("Không thể tạo roadmap");
      }
      setRoadmap(await response.json());
    } catch (err) {
      setError(err.message || "AI service chưa sẵn sàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell roadmap-shell">
      <HomeHeader />
      <main className="roadmap-page">
        <section className="roadmap-intro">
          <div>
            <span>AI Career Roadmap</span>
            <h1>Lộ trình sự nghiệp theo MBTI và kỹ năng</h1>
            <p>Nhập vai trò hiện tại, mục tiêu và kỹ năng đang có để nhận timeline phát triển rõ từng giai đoạn.</p>
          </div>
          <form className="roadmap-form" onSubmit={generateRoadmap}>
            <label>
              MBTI
              <input name="mbti" value={form.mbti} onChange={updateField} />
            </label>
            <label>
              Vai trò hiện tại
              <input name="currentRole" value={form.currentRole} onChange={updateField} placeholder="Backend Intern" />
            </label>
            <label>
              Vai trò mục tiêu
              <input name="targetRole" value={form.targetRole} onChange={updateField} placeholder="Backend Engineer" />
            </label>
            <label>
              Kỹ năng hiện có
              <input name="skills" value={form.skills} onChange={updateField} placeholder="Java, SQL, Spring" />
            </label>
            <label>
              Số năm kinh nghiệm
              <input name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={updateField} />
            </label>
            <button type="submit" disabled={loading}>{loading ? "Đang tạo..." : "Tạo roadmap"}</button>
          </form>
        </section>

        {error ? <p className="roadmap-error">{error}</p> : null}

        {roadmap ? (
          <section className="roadmap-result">
            <div className="roadmap-summary">
              <span>{roadmap.currentLevel}</span>
              <h2>{roadmap.title}</h2>
              <p>{roadmap.summary}</p>
              <strong>{roadmap.estimatedTimeline}</strong>
            </div>
            <div className="roadmap-timeline">
              {(roadmap.milestones || []).map((item, index) => (
                <article key={`${item.phase}-${index}`} className="roadmap-node">
                  <div className="roadmap-dot">{index + 1}</div>
                  <div>
                    <span>{item.phase}</span>
                    <h3>{item.title}</h3>
                    <ul>
                      {(item.goals || []).map((goal) => <li key={goal}>{goal}</li>)}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default CareerRoadmap;
