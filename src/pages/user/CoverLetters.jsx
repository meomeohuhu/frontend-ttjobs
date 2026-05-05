import { useEffect, useMemo, useState } from "react";
import SettingsLayout from "./SettingsLayout.jsx";

const storageKey = "ttjobs_cover_letters";
const emptyLetter = { title: "", company: "", position: "", content: "" };

const CoverLetters = () => {
  const [letters, setLetters] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyLetter);
  const selected = useMemo(() => letters.find((item) => item.id === selectedId), [letters, selectedId]);

  useEffect(() => {
    try {
      setLetters(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch {
      setLetters([]);
    }
  }, []);

  const persist = (next) => {
    setLetters(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const saveLetter = (event) => {
    event.preventDefault();
    const nextLetter = {
      ...form,
      id: selectedId || String(Date.now()),
      updatedAt: new Date().toISOString()
    };
    persist(selectedId ? letters.map((item) => (item.id === selectedId ? nextLetter : item)) : [nextLetter, ...letters]);
    setSelectedId(nextLetter.id);
  };

  const editLetter = (letter) => {
    setSelectedId(letter.id);
    setForm({ title: letter.title || "", company: letter.company || "", position: letter.position || "", content: letter.content || "" });
  };

  const deleteLetter = (id) => {
    persist(letters.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId("");
      setForm(emptyLetter);
    }
  };

  const copyLetter = async () => {
    await navigator.clipboard.writeText(form.content || "");
  };

  return (
    <SettingsLayout title="Cover Letter của tôi" description="Tạo, lưu và tái sử dụng thư ứng tuyển cho từng công ty." activePath="/user/cover-letters" wide>
      <section className="cover-letter-layout">
        <div className="settings-card">
          <h2>Thư đã lưu</h2>
          {letters.length === 0 ? <p className="settings-state">Chưa có cover letter.</p> : null}
          <div className="cover-letter-list">
            {letters.map((letter) => (
              <button key={letter.id} type="button" className={letter.id === selectedId ? "active" : ""} onClick={() => editLetter(letter)}>
                <strong>{letter.title || "Chưa đặt tên"}</strong>
                <span>{letter.position || "Vị trí ứng tuyển"} · {letter.company || "Công ty"}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="settings-card settings-form" onSubmit={saveLetter}>
          <label>
            <span>Tên thư</span>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
          </label>
          <label>
            <span>Công ty</span>
            <input value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} />
          </label>
          <label>
            <span>Vị trí</span>
            <input value={form.position} onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))} />
          </label>
          <label className="wide">
            <span>Nội dung</span>
            <textarea rows="12" value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} required />
          </label>
          <div className="settings-form-footer">
            <button type="button" className="settings-secondary-button" onClick={() => { setSelectedId(""); setForm(emptyLetter); }}>Tạo mới</button>
            <button type="button" className="settings-secondary-button" disabled={!selected} onClick={copyLetter}>Sao chép</button>
            <button type="button" className="settings-secondary-button danger" disabled={!selected} onClick={() => deleteLetter(selectedId)}>Xóa</button>
            <button type="submit">Lưu cover letter</button>
          </div>
        </form>
      </section>
    </SettingsLayout>
  );
};

export default CoverLetters;
