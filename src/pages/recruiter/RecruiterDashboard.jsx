import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import HomeHeader from "../../sections/HomeHeader.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const formatNumber = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "0";
  }
  return numberValue.toLocaleString("vi-VN");
};

const formatDate = (value) => {
  if (!value) return "Chưa có hạn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có hạn";
  return date.toLocaleDateString("vi-VN");
};

const RecruiterDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/recruiter/dashboard");
        if (active) {
          setDashboard(data || null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải recruiter dashboard");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const applicationStatusCards = useMemo(() => {
    const entries = dashboard?.applicationStatusCounts
      ? Object.entries(dashboard.applicationStatusCounts)
      : [];
    return entries
      .filter(([, count]) => Number(count) > 0)
      .map(([status, count]) => ({
        status,
        count: Number(count)
      }));
  }, [dashboard?.applicationStatusCounts]);

  const handleComingSoon = () => {
    window.alert("Phần này sẽ mở ở task tiếp theo.");
  };

  return (
    <div className="recruiter-shell">
      <HomeHeader />

      <div className="recruiter-container">
        <section className="recruiter-hero">
          <div>
            <span className="recruiter-kicker">Recruiter Workspace</span>
            <h1>Dashboard tuyển dụng</h1>
            <p>Theo dõi job mở, hồ sơ mới, trạng thái ứng viên và hạn nộp trong một màn hình.</p>
          </div>
          <div className="recruiter-hero-actions">
            <button type="button" className="recruiter-primary-action" onClick={handleComingSoon}>
              Quản lý job
            </button>
            <button type="button" className="recruiter-secondary-action" onClick={handleComingSoon}>
              Quản lý công ty
            </button>
          </div>
        </section>

        {loading && <p className="recruiter-state">Đang tải dashboard...</p>}
        {!loading && error && <p className="recruiter-state error">{error}</p>}

        {!loading && !error && dashboard && (
          <>
            <section className="recruiter-kpi-grid">
              <article className="recruiter-kpi-card">
                <span>Job đang mở</span>
                <strong>{formatNumber(dashboard.openJobCount)}</strong>
              </article>
              <article className="recruiter-kpi-card">
                <span>Hồ sơ mới 7 ngày</span>
                <strong>{formatNumber(dashboard.newApplicationCount)}</strong>
              </article>
              <article className="recruiter-kpi-card">
                <span>Job sắp hết hạn</span>
                <strong>{formatNumber(dashboard.expiringSoonJobCount)}</strong>
              </article>
              <article className="recruiter-kpi-card">
                <span>Trạng thái đang xử lý</span>
                <strong>{formatNumber(applicationStatusCards.length)}</strong>
              </article>
            </section>

            <section className="recruiter-layout">
              <div className="recruiter-main-column">
                <article className="recruiter-panel">
                  <header className="recruiter-panel-header">
                    <h2>Ứng viên theo trạng thái</h2>
                  </header>
                  <div className="recruiter-status-grid">
                    {applicationStatusCards.length > 0 ? (
                      applicationStatusCards.map((item) => (
                        <div key={item.status} className="recruiter-status-chip">
                          <strong>{item.status}</strong>
                          <span>{formatNumber(item.count)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="recruiter-empty">Chưa có dữ liệu trạng thái ứng viên.</p>
                    )}
                  </div>
                </article>

                <article className="recruiter-panel">
                  <header className="recruiter-panel-header">
                    <h2>Ứng viên mới</h2>
                  </header>
                  <div className="recruiter-table">
                    {dashboard.recentApplications.length > 0 ? (
                      dashboard.recentApplications.map((application) => (
                        <Link
                          key={application.id}
                          to={`/jobs/${application.jobId}`}
                          className="recruiter-table-row"
                        >
                          <div>
                            <strong>{application.userName || "Ứng viên"}</strong>
                            <span>{application.jobTitle}</span>
                          </div>
                          <div>
                            <strong>{application.status}</strong>
                            <span>{formatDate(application.applicationDate)}</span>
                          </div>
                          <div>
                            <strong>{application.companyName}</strong>
                            <span>{application.hasCv ? "Có CV" : "Chưa có CV"}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="recruiter-empty">Chưa có hồ sơ mới.</p>
                    )}
                  </div>
                </article>
              </div>

              <aside className="recruiter-side-column">
                <article className="recruiter-panel">
                  <header className="recruiter-panel-header">
                    <h2>Job sắp hết hạn</h2>
                  </header>
                  <div className="recruiter-side-list">
                    {dashboard.expiringSoonJobs.length > 0 ? (
                      dashboard.expiringSoonJobs.map((job) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="recruiter-side-card">
                          <strong>{job.title}</strong>
                          <span>{job.companyName}</span>
                          <small>{job.location || "Toàn quốc"} - Hạn {formatDate(job.applicationDeadline)}</small>
                        </Link>
                      ))
                    ) : (
                      <p className="recruiter-empty">Không có job sắp hết hạn.</p>
                    )}
                  </div>
                </article>

                <article className="recruiter-panel">
                  <header className="recruiter-panel-header">
                    <h2>Công ty đang quản lý</h2>
                  </header>
                  <div className="recruiter-side-list">
                    {dashboard.managedCompanies.length > 0 ? (
                      dashboard.managedCompanies.map((company) => (
                        <Link key={company.companyId} to={`/companies/${company.companyId}`} className="recruiter-company-card">
                          <strong>{company.companyName}</strong>
                          <span>{formatNumber(company.jobCount)} job</span>
                          <small>{formatNumber(company.memberCount)} thành viên</small>
                        </Link>
                      ))
                    ) : (
                      <p className="recruiter-empty">Chưa có công ty nào được gán.</p>
                    )}
                  </div>
                </article>
              </aside>
            </section>
          </>
        )}
      </div>

      <FloatingActions />
    </div>
  );
};

export default RecruiterDashboard;
