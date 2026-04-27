import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import HomeHeader from "../../sections/HomeHeader.jsx";
import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const statusLabels = {
  submitted: "Mới nộp",
  reviewing: "Đang xem",
  shortlisted: "Duyệt hồ sơ",
  interviewed: "Đã phỏng vấn",
  offered: "Đã nhận offer",
  hired: "Đã tuyển",
  rejected: "Từ chối",
  withdrawn: "Đã hủy"
};

const statusFilters = [
  { value: "all", label: "Tất cả" },
  { value: "submitted", label: "Mới nộp" },
  { value: "reviewing", label: "Đang xem" },
  { value: "shortlisted", label: "Duyệt hồ sơ" },
  { value: "interviewed", label: "Phỏng vấn" },
  { value: "offered", label: "Offer" },
  { value: "withdrawn", label: "Đã hủy" }
];

const terminalStatuses = new Set(["withdrawn", "hired", "rejected"]);

const formatAppliedDate = (value) => {
  if (!value) return "Chưa có ngày";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const AppliedJobs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [withdrawingId, setWithdrawingId] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  const filteredItems = useMemo(() => {
    if (activeStatus === "all") {
      return items;
    }
    return items.filter((item) => String(item.status || "").toLowerCase() === activeStatus);
  }, [items, activeStatus]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/applications/me");
        if (active) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải danh sách ứng tuyển");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const withdrawApplication = async (item) => {
    const status = String(item?.status || "").toLowerCase();
    if (!item?.id || terminalStatuses.has(status)) {
      return;
    }

    const confirmed = window.confirm(`Bạn muốn hủy ứng tuyển "${item.jobTitle || "công việc này"}"?`);
    if (!confirmed) {
      return;
    }

    setWithdrawingId(String(item.id));
    setError("");
    setMessage("");
    try {
      const updated = await apiRequest(`/api/applications/${item.id}/withdraw`, { method: "PUT" });
      setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, ...updated } : current)));
      setMessage("Đã hủy ứng tuyển thành công.");
    } catch (err) {
      setError(err.message || "Không thể hủy ứng tuyển");
    } finally {
      setWithdrawingId("");
    }
  };

  return (
    <div className="user-page-shell">
      <HomeHeader />
      <AnnouncementBar />

      <div className="user-page-container">
        <div className="user-grid">
          <section className="user-card">
            <h2>Việc làm đã ứng tuyển</h2>
            <div className="status-tabs">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={activeStatus === filter.value ? "active" : ""}
                  onClick={() => setActiveStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && error && <p className="user-error-message">{error}</p>}
            {message ? <p className="user-success-message">{message}</p> : null}
            {!loading && !error && filteredItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-illustration" />
                <p>{items.length === 0 ? "Bạn chưa ứng tuyển công việc nào!" : "Không có hồ sơ ở trạng thái này."}</p>
                <Link to="/" className="primary-link">
                  Tìm việc ngay
                </Link>
              </div>
            )}

            {!loading &&
              !error &&
              filteredItems.map((item) => {
                const status = String(item.status || "submitted").toLowerCase();
                const canWithdraw = !terminalStatuses.has(status);
                const isWithdrawing = withdrawingId === String(item.id);

                return (
                  <article key={item.id} className="user-job-card">
                    <div className="job-logo">
                      <span>{(item.companyName || "C")[0]}</span>
                    </div>
                    <div className="user-job-main">
                      <Link to={`/jobs/${item.jobId}`} className="user-job-title-link">
                        <h3>{item.jobTitle}</h3>
                      </Link>
                      <p>{item.companyName || "Đang cập nhật"}</p>
                      <div className="job-meta">
                        <span>{statusLabels[status] || status}</span>
                        <span>{formatAppliedDate(item.applicationDate)}</span>
                      </div>
                    </div>
                    <div className="user-job-actions">
                      <Link to={`/jobs/${item.jobId}`} className="outline-btn small">Xem tin</Link>
                      <Link to="/messages" className="outline-btn small">Tin nhắn</Link>
                      <button
                        type="button"
                        className="danger-outline-btn"
                        disabled={!canWithdraw || isWithdrawing}
                        onClick={() => withdrawApplication(item)}
                      >
                        {status === "withdrawn" ? "Đã hủy" : isWithdrawing ? "Đang hủy..." : "Hủy ứng tuyển"}
                      </button>
                    </div>
                  </article>
                );
              })}
          </section>

          <aside className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar" />
              <div>
                <p>Chào bạn trở lại</p>
                <strong>Ứng viên</strong>
                <span className="verified">Tài khoản đã xác thực</span>
              </div>
            </div>
            <button type="button" className="outline-btn">Nâng cấp tài khoản</button>
            <div className="profile-section">
              <h4>Đang tắt tìm việc</h4>
              <p>Nhà tuyển dụng sẽ không nhìn thấy hồ sơ của bạn.</p>
            </div>
            <div className="profile-section">
              <h4>Cho phép NTD tìm kiếm hồ sơ</h4>
              <p>Khi bật, NTD sẽ dễ dàng liên hệ hơn.</p>
            </div>
          </aside>
        </div>
      </div>

      <FloatingActions />
    </div>
  );
};

export default AppliedJobs;
