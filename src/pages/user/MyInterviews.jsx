import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const statusLabels = {
  pending: "Đang chờ",
  scheduled: "Đã lên lịch",
  completed: "Hoàn tất",
  cancelled: "Đã hủy"
};

const MyInterviews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/users/me/interviews");
        if (active) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Không thể tải lịch phỏng vấn");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SettingsLayout
      title="Lịch phỏng vấn"
      description="Theo dõi lịch hẹn phỏng vấn từ các nhà tuyển dụng."
      activePath="/user/interviews"
    >
      <section className="settings-card">
        {loading ? <p>Đang tải lịch phỏng vấn...</p> : null}
        {!loading && error ? <p>{error}</p> : null}
        {!loading && !error && items.length === 0 ? <p>Bạn chưa có lịch phỏng vấn.</p> : null}
        {!loading && !error && items.map((item) => (
          <article key={item.id} className="user-interview-card">
            <div className="job-logo">
              <span>{(item.companyName || "T")[0]}</span>
            </div>
            <div className="user-job-main">
              <h3>{item.jobTitle || "Lịch phỏng vấn"}</h3>
              <p>{item.companyName || "Nhà tuyển dụng"}</p>
              <div className="job-meta">
                <span>{formatDate(item.scheduledAt)}</span>
                <span>{statusLabels[item.status] || item.status || "Đang chờ"}</span>
                {item.meetingLink ? <a href={item.meetingLink} target="_blank" rel="noreferrer">Meeting</a> : null}
              </div>
            </div>
            <div className="user-job-actions">
              {item.jobId ? <Link to={`/jobs/${item.jobId}`} className="outline-btn small">Xem tin</Link> : null}
              <Link to="/messages" className="outline-btn small">Tin nhắn</Link>
            </div>
          </article>
        ))}
      </section>
    </SettingsLayout>
  );
};

export default MyInterviews;
