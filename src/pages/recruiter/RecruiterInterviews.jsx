import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatDate } from "./recruiterUtils.js";

const emptyForm = {
  applicationId: "",
  scheduledAt: "",
  durationMinutes: 30,
  location: "",
  meetingLink: "",
  note: ""
};

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [interviewData, applicationData] = await Promise.all([
        apiRequest("/api/recruiter/interviews"),
        apiRequest("/api/recruiter/applications?size=200")
      ]);
      setInterviews(Array.isArray(interviewData) ? interviewData : []);
      setApplications(Array.isArray(applicationData) ? applicationData : []);
    } catch (err) {
      setError(err.message || "Không thể tải lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createInterview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiRequest("/api/recruiter/interviews", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          applicationId: Number(form.applicationId),
          durationMinutes: Number(form.durationMinutes),
          scheduledAt: new Date(form.scheduledAt).toISOString()
        })
      });
      setForm(emptyForm);
      setMessage("Đã tạo lịch phỏng vấn.");
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể tạo lịch phỏng vấn");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
    setMessage("");
    try {
      await apiRequest(`/api/recruiter/interviews/${id}/status?status=${encodeURIComponent(status)}`, {
        method: "PUT"
      });
      setMessage("Đã cập nhật lịch phỏng vấn.");
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể cập nhật lịch phỏng vấn");
    }
  };

  return (
    <RecruiterLayout
      title="Lịch phỏng vấn"
      description="Tạo lịch hẹn từ hồ sơ ứng tuyển và theo dõi trạng thái phỏng vấn."
    >
      {error ? <p className="recruiter-state error">{error}</p> : null}
      {message ? <p className="recruiter-state success">{message}</p> : null}

      <section className="recruiter-two-column recruiter-two-column-wide">
        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>Lịch sắp tới</h2>
          </header>
          <div className="recruiter-table">
            {loading ? <p className="recruiter-empty">Đang tải lịch...</p> : null}
            {!loading && interviews.length === 0 ? <p className="recruiter-empty">Chưa có lịch phỏng vấn.</p> : null}
            {!loading && interviews.map((item) => (
              <div key={item.id} className="recruiter-table-row">
                <div>
                  <strong>{item.candidateName || "Ứng viên"}</strong>
                  <span>{item.jobTitle || "Job"} · {item.companyName || "Công ty"}</span>
                </div>
                <div>
                  <strong>{formatDate(item.scheduledAt)}</strong>
                  <span>{item.durationMinutes || 30} phút · {item.status}</span>
                </div>
                <div className="recruiter-row-actions">
                  <button type="button" onClick={() => updateStatus(item.id, "confirmed")}>Confirm</button>
                  <button type="button" onClick={() => updateStatus(item.id, "cancelled")}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>Tạo lịch</h2>
          </header>
          <form className="recruiter-form" onSubmit={createInterview}>
            <label className="wide">
              <span>Hồ sơ ứng tuyển</span>
              <select name="applicationId" value={form.applicationId} onChange={handleChange} required>
                <option value="">Chọn hồ sơ</option>
                {applications.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.candidateName || "Ứng viên"} - {item.jobTitle}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Thời gian</span>
              <input name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={handleChange} required />
            </label>
            <label>
              <span>Thời lượng</span>
              <input name="durationMinutes" type="number" min="15" value={form.durationMinutes} onChange={handleChange} />
            </label>
            <label>
              <span>Địa điểm</span>
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
            <label>
              <span>Meeting link</span>
              <input name="meetingLink" value={form.meetingLink} onChange={handleChange} />
            </label>
            <label className="wide">
              <span>Ghi chú</span>
              <textarea name="note" rows="4" value={form.note} onChange={handleChange} />
            </label>
            <div className="recruiter-form-actions">
              <button type="submit" className="recruiter-primary-action" disabled={saving}>
                {saving ? "Đang tạo..." : "Tạo lịch"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterInterviews;
