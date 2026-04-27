import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import HomeHeader from "../../sections/HomeHeader.jsx";
import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const formatDate = (value) => {
  if (!value) return "Chưa có ngày";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return "Chưa có lịch";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có lịch";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const statusLabels = {
  submitted: "Mới nộp",
  reviewing: "Đang xem",
  shortlisted: "Duyệt hồ sơ",
  interviewed: "Đã phỏng vấn",
  offered: "Offer",
  hired: "Đã tuyển",
  rejected: "Từ chối",
  withdrawn: "Đã hủy",
  pending: "Đang chờ",
  scheduled: "Đã lên lịch",
  completed: "Hoàn tất",
  cancelled: "Đã hủy"
};

const CandidateDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/users/dashboard");
        if (active) setDashboard(data || {});
      } catch (err) {
        if (active) setError(err.message || "Không thể tải dashboard ứng viên");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const missingItems = dashboard?.missingProfileItems || [];
  const completion = Number(dashboard?.profileCompletionPercent || 0);
  const quickActions = useMemo(() => ([
    { label: "Cập nhật hồ sơ", to: "/user/profile" },
    { label: "Tạo/Sửa CV", to: "/create-cv" },
    { label: "Việc đã ứng tuyển", to: "/user/applied" },
    { label: "Tin nhắn", to: "/messages" },
    { label: "Lịch phỏng vấn", to: "/user/interviews" },
    { label: "Gợi ý việc làm", to: "/user/matching" }
  ]), []);

  return (
    <div className="user-page-shell candidate-dashboard-page">
      <HomeHeader />
      <AnnouncementBar />

      <main className="candidate-dashboard">
        <section className="candidate-dashboard-hero">
          <div>
            <span>Candidate Workspace</span>
            <h1>Dashboard ứng viên</h1>
            <p>Quản lý hồ sơ, việc đã ứng tuyển, phỏng vấn, tin nhắn và gợi ý việc làm trong một nơi.</p>
          </div>
          <div className="candidate-completion-card">
            <strong>{completion}%</strong>
            <span>Hoàn thiện hồ sơ</span>
            <div className="candidate-progress"><i style={{ width: `${Math.min(100, Math.max(0, completion))}%` }} /></div>
          </div>
        </section>

        {loading ? <p className="candidate-state">Đang tải dashboard...</p> : null}
        {!loading && error ? <p className="candidate-state error">{error}</p> : null}

        {!loading && !error && dashboard ? (
          <>
            <section className="candidate-kpi-grid">
              <Link to="/user/applied" className="candidate-kpi-card"><span>Đã ứng tuyển</span><strong>{dashboard.appliedCount || 0}</strong></Link>
              <Link to="/user/saved" className="candidate-kpi-card"><span>Việc đã lưu</span><strong>{dashboard.savedCount || 0}</strong></Link>
              <Link to="/user/interviews" className="candidate-kpi-card"><span>Phỏng vấn sắp tới</span><strong>{dashboard.upcomingInterviewCount || 0}</strong></Link>
              <Link to="/messages" className="candidate-kpi-card"><span>Tin nhắn chưa đọc</span><strong>{dashboard.unreadMessageCount || 0}</strong></Link>
            </section>

            <section className="candidate-quick-actions">
              {quickActions.map((action) => <Link key={action.to} to={action.to}>{action.label}</Link>)}
            </section>

            <section className="candidate-dashboard-grid">
              <article className="candidate-panel">
                <header>
                  <h2>Tổng quan hồ sơ</h2>
                  <Link to="/user/profile">Cập nhật</Link>
                </header>
                {missingItems.length > 0 ? (
                  <div className="candidate-checklist">
                    {missingItems.map((item) => <span key={item}>Thiếu {item}</span>)}
                  </div>
                ) : (
                  <p className="candidate-empty">Hồ sơ của bạn đã đủ thông tin cơ bản.</p>
                )}
              </article>

              <article className="candidate-panel">
                <header>
                  <h2>Việc ứng tuyển gần đây</h2>
                  <Link to="/user/applied">Xem tất cả</Link>
                </header>
                {(dashboard.recentApplications || []).length > 0 ? dashboard.recentApplications.map((item) => (
                  <Link key={item.id} to={`/jobs/${item.jobId}`} className="candidate-list-card">
                    <strong>{item.jobTitle || "Tin tuyển dụng"}</strong>
                    <span>{item.companyName || "Nhà tuyển dụng"} • {statusLabels[item.status] || item.status || "Đang xử lý"}</span>
                    <small>{formatDate(item.applicationDate)}</small>
                  </Link>
                )) : <p className="candidate-empty">Bạn chưa ứng tuyển công việc nào.</p>}
              </article>

              <article className="candidate-panel">
                <header>
                  <h2>Lịch phỏng vấn</h2>
                  <Link to="/user/interviews">Mở lịch</Link>
                </header>
                {(dashboard.upcomingInterviews || []).length > 0 ? dashboard.upcomingInterviews.map((item) => (
                  <Link key={item.id} to="/user/interviews" className="candidate-list-card">
                    <strong>{item.jobTitle || "Lịch phỏng vấn"}</strong>
                    <span>{item.companyName || "Nhà tuyển dụng"} • {statusLabels[item.status] || item.status || "scheduled"}</span>
                    <small>{formatDateTime(item.scheduledAt)}</small>
                  </Link>
                )) : <p className="candidate-empty">Chưa có lịch phỏng vấn sắp tới.</p>}
              </article>

              <article className="candidate-panel">
                <header>
                  <h2>Gợi ý việc làm</h2>
                  <Link to="/user/matching">Xem thêm</Link>
                </header>
                {(dashboard.recommendedJobs || []).length > 0 ? dashboard.recommendedJobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="candidate-list-card">
                    <strong>{job.title}</strong>
                    <span>{job.companyName || "Công ty"} • {job.location || "Toàn quốc"}</span>
                    <small>{job.jobType || "Việc làm"}</small>
                  </Link>
                )) : (
                  <div className="candidate-empty-action">
                    <p>Chưa có gợi ý phù hợp.</p>
                    <Link to="/user/job-needs">Cập nhật nhu cầu tìm việc</Link>
                  </div>
                )}
              </article>
            </section>
          </>
        ) : null}
      </main>

      <FloatingActions />
    </div>
  );
};

export default CandidateDashboard;
