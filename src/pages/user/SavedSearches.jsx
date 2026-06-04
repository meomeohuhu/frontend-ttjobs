import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import HomeHeader from "../../sections/HomeHeader.jsx";
import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const emptyForm = {
  name: "",
  keyword: "",
  location: "",
  category: "",
  jobType: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  skills: "",
  alertFrequency: "DAILY",
  active: true
};

const formatMoney = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? `${numberValue.toLocaleString("vi-VN")} VND` : "";
};

const toForm = (item) => ({
  name: item.name || "",
  keyword: item.keyword || "",
  location: item.location || "",
  category: item.category || "",
  jobType: item.jobType || "",
  experienceLevel: item.experienceLevel || "",
  salaryMin: item.salaryMin || "",
  salaryMax: item.salaryMax || "",
  skills: Array.isArray(item.skills) ? item.skills.join(", ") : "",
  alertFrequency: item.alertFrequency || "DAILY",
  active: item.active !== false
});

const toRequest = (form) => ({
  name: form.name.trim(),
  keyword: form.keyword.trim() || null,
  location: form.location.trim() || null,
  category: form.category.trim() || null,
  jobType: form.jobType.trim() || null,
  experienceLevel: form.experienceLevel.trim() || null,
  salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
  salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
  skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
  alertFrequency: form.alertFrequency || "DAILY",
  active: Boolean(form.active)
});

const SavedSearches = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [runResults, setRunResults] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const editingItem = useMemo(() => items.find((item) => item.id === editingId), [editingId, items]);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/saved-searches");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải tìm kiếm đã lưu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm(toForm(item));
    setMessage("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = toRequest(form);
      if (!payload.name) {
        setError("Tên tìm kiếm là bắt buộc.");
        return;
      }
      await apiRequest(editingId ? `/api/saved-searches/${editingId}` : "/api/saved-searches", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setMessage(editingId ? "Đã cập nhật tìm kiếm đã lưu." : "Đã tạo tìm kiếm đã lưu.");
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể lưu tìm kiếm.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setMessage("");
    setError("");
    try {
      await apiRequest(`/api/saved-searches/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...toRequest(toForm(item)), active: item.active === false })
      });
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể đổi trạng thái alert.");
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Xóa tìm kiếm "${item.name}"?`)) return;
    setMessage("");
    setError("");
    try {
      await apiRequest(`/api/saved-searches/${item.id}`, { method: "DELETE" });
      if (editingId === item.id) resetForm();
      setRunResults((current) => (selectedRunId === item.id ? [] : current));
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể xóa tìm kiếm.");
    }
  };

  const runSearch = async (item) => {
    setSelectedRunId(item.id);
    setRunResults([]);
    setMessage("");
    setError("");
    try {
      const data = await apiRequest(`/api/saved-searches/${item.id}/run`, { method: "POST" });
      setRunResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể chạy tìm kiếm.");
    }
  };

  return (
    <div className="user-page-shell">
      <HomeHeader />
      <AnnouncementBar />

      <main className="user-page-container saved-search-page">
        <section className="user-card saved-search-hero">
          <div>
            <span>Job Alert</span>
            <h2>Tìm kiếm đã lưu</h2>
            <p>Lưu nhiều bộ lọc việc làm, bật thông báo và chạy lại khi cần.</p>
          </div>
          <Link to="/jobs" className="outline-btn">Tìm việc mới</Link>
        </section>

        {message ? <p className="jobs-list-action-state success">{message}</p> : null}
        {error ? <p className="jobs-list-action-state error">{error}</p> : null}

        <div className="saved-search-layout">
          <section className="user-card">
            <h3>{editingItem ? `Sửa: ${editingItem.name}` : "Tạo tìm kiếm mới"}</h3>
            <form className="saved-search-form" onSubmit={submit}>
              <label>Tên tìm kiếm<input name="name" value={form.name} onChange={updateField} placeholder="Backend Java Hà Nội" /></label>
              <label>Từ khóa<input name="keyword" value={form.keyword} onChange={updateField} placeholder="Java, React, HR..." /></label>
              <label>Khu vực<input name="location" value={form.location} onChange={updateField} placeholder="Hà Nội, Remote..." /></label>
              <label>Ngành<input name="category" value={form.category} onChange={updateField} placeholder="INFORMATION-TECHNOLOGY" /></label>
              <label>Loại việc<input name="jobType" value={form.jobType} onChange={updateField} placeholder="Full-time" /></label>
              <label>Kinh nghiệm<input name="experienceLevel" value={form.experienceLevel} onChange={updateField} placeholder="Junior, Senior..." /></label>
              <label>Lương tối thiểu<input name="salaryMin" type="number" min="0" value={form.salaryMin} onChange={updateField} /></label>
              <label>Lương tối đa<input name="salaryMax" type="number" min="0" value={form.salaryMax} onChange={updateField} /></label>
              <label className="saved-search-wide">Kỹ năng<input name="skills" value={form.skills} onChange={updateField} placeholder="Java, Spring Boot, SQL" /></label>
              <label>Tần suất
                <select name="alertFrequency" value={form.alertFrequency} onChange={updateField}>
                  <option value="DAILY">Hằng ngày</option>
                  <option value="WEEKLY">Hằng tuần</option>
                  <option value="MANUAL">Chỉ chạy thủ công</option>
                </select>
              </label>
              <label className="saved-search-check"><input name="active" type="checkbox" checked={form.active} onChange={updateField} /> Bật job alert</label>
              <div className="saved-search-actions">
                <button type="submit" disabled={saving}>{saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}</button>
                {editingId ? <button type="button" onClick={resetForm}>Hủy sửa</button> : null}
              </div>
            </form>
          </section>

          <section className="user-card">
            <h3>Danh sách đã lưu</h3>
            {loading ? <p>Đang tải dữ liệu...</p> : null}
            {!loading && items.length === 0 ? <p className="candidate-empty">Bạn chưa có tìm kiếm đã lưu.</p> : null}
            <div className="saved-search-list">
              {items.map((item) => (
                <article key={item.id} className="saved-search-card">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{[item.keyword, item.location, item.category].filter(Boolean).join(" • ") || "Không có bộ lọc phụ"}</span>
                    <small>{item.alertFrequency || "DAILY"} • {item.active === false ? "Đang tắt" : "Đang bật"}</small>
                  </div>
                  <div className="saved-search-card-actions">
                    <button type="button" onClick={() => runSearch(item)}>Chạy thử</button>
                    <button type="button" onClick={() => startEdit(item)}>Sửa</button>
                    <button type="button" onClick={() => toggleActive(item)}>{item.active === false ? "Bật" : "Tắt"}</button>
                    <button type="button" onClick={() => deleteItem(item)}>Xóa</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {selectedRunId ? (
          <section className="user-card">
            <h3>Kết quả chạy thử</h3>
            {runResults.length === 0 ? <p className="candidate-empty">Không có việc phù hợp với tìm kiếm này.</p> : null}
            <div className="saved-search-results">
              {runResults.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="user-job-card">
                  <div className="job-logo"><span>{(job.companyName || "C")[0]}</span></div>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.companyName || "Đang cập nhật"}</p>
                    <div className="job-meta">
                      <span>{formatMoney(job.salaryMin) || formatMoney(job.salary) || "Thỏa thuận"}</span>
                      <span>{job.location || "Toàn quốc"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <FloatingActions />
    </div>
  );
};

export default SavedSearches;
