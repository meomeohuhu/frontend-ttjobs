import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatDate, formatNumber } from "./recruiterUtils.js";

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
        if (active) setDashboard(data || null);
      } catch (err) {
        if (active) setError(err.message || "Không thể tải dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const activeStatusCount = useMemo(() => {
    const counts = dashboard?.applicationStatusCounts || {};
    return Object.entries(counts).filter(([, count]) => Number(count) > 0).length;
  }, [dashboard]);

  return (
    <RecruiterLayout
      title="Dashboard tuyển dụng"
      description="Tổng quan job, ứng viên và công ty đang quản lý."
      actions={<Link to="/recruiter/jobs" className="recruiter-primary-action">Tạo job</Link>}
    >
      {loading ? <p className="recruiter-state">Đang tải dashboard...</p> : null}
      {!loading && error ? <p className="recruiter-state error">{error}</p> : null}

      {!loading && !error && dashboard ? (
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
              <strong>{formatNumber(activeStatusCount)}</strong>
            </article>
          </section>

          <section className="recruiter-layout">
            <div className="recruiter-main-column">
              <article className="recruiter-panel">
                <header className="recruiter-panel-header">
                  <h2>Ứng viên theo trạng thái</h2>
                </header>
                <div className="recruiter-status-grid">
                  {Object.entries(dashboard.applicationStatusCounts || {}).map(([status, count]) => (
                    <Link
                      key={status}
                      to={`/recruiter/applications?status=${status}`}
                      className="recruiter-status-chip"
                    >
                      <strong>{status}</strong>
                      <span>{formatNumber(count)}</span>
                    </Link>
                  ))}
                </div>
              </article>

              <article className="recruiter-panel">
                <header className="recruiter-panel-header">
                  <h2>Ứng viên mới</h2>
                  <Link to="/recruiter/applications">Xem tất cả</Link>
                </header>
                <div className="recruiter-table">
                  {(dashboard.recentApplications || []).length > 0 ? (
                    dashboard.recentApplications.map((application) => (
                      <Link
                        key={application.id}
                        to={`/recruiter/applications/${application.id}`}
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
                  <Link to="/recruiter/jobs?status=open">Quản lý job</Link>
                </header>
                <div className="recruiter-side-list">
                  {(dashboard.expiringSoonJobs || []).length > 0 ? (
                    dashboard.expiringSoonJobs.map((job) => (
                      <Link key={job.id} to={`/recruiter/jobs?jobId=${job.id}`} className="recruiter-side-card">
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
                  <Link to="/recruiter/companies">Quản lý</Link>
                </header>
                <div className="recruiter-side-list">
                  {(dashboard.managedCompanies || []).length > 0 ? (
                    dashboard.managedCompanies.map((company) => (
                      <Link key={company.companyId} to="/recruiter/companies" className="recruiter-company-card">
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
      ) : null}
    </RecruiterLayout>
  );
};

export default RecruiterDashboard;
