import { useEffect, useState } from "react";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";

const storageKey = "ttjobs_community_threads";

const Community = () => {
  const [threads, setThreads] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", tag: "Hỏi đáp" });

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    setThreads(raw ? JSON.parse(raw) : []);
  }, []);

  const submitThread = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    const next = [{ id: Date.now(), ...form, createdAt: new Date().toISOString(), replies: [] }, ...threads];
    setThreads(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setForm({ title: "", body: "", tag: "Hỏi đáp" });
  };

  return (
    <div className="page-shell community-shell">
      <HomeHeader />
      <main className="community-page">
        <section className="community-hero">
          <span>TTJobs Community</span>
          <h1>Hỏi đáp nghề nghiệp và tuyển dụng</h1>
          <p>Nơi ứng viên và recruiter trao đổi câu hỏi phỏng vấn, CV, thị trường và kinh nghiệm đi làm.</p>
        </section>
        <section className="community-layout">
          <form className="community-form" onSubmit={submitThread}>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Tiêu đề câu hỏi" />
            <select value={form.tag} onChange={(event) => setForm((prev) => ({ ...prev, tag: event.target.value }))}>
              <option>Hỏi đáp</option>
              <option>CV</option>
              <option>Phỏng vấn</option>
              <option>Lương thưởng</option>
            </select>
            <textarea value={form.body} onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))} placeholder="Nội dung thảo luận" />
            <button type="submit">Đăng câu hỏi</button>
          </form>
          <div className="community-thread-list">
            {threads.length === 0 ? <p className="candidate-empty">Chưa có thảo luận nào.</p> : null}
            {threads.map((thread) => (
              <article key={thread.id} className="community-thread-card">
                <span>{thread.tag}</span>
                <h2>{thread.title}</h2>
                <p>{thread.body}</p>
                <small>{new Date(thread.createdAt).toLocaleString("vi-VN")}</small>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
