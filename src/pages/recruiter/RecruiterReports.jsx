import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatNumber } from "./recruiterUtils.js";

const RecruiterReports = () => {
  const [days, setDays] = useState("30");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/recruiter/reports?days=${encodeURIComponent(days)}`);
      setReport(data || null);
    } catch (err) {
      setError(err.message || "Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [days]);

  const statusRows = Object.entries(report?.applicationsByStatus || {});
  const jobRows = Object.entries(report?.applicationsByJob || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <RecruiterLayout
      title="Báo cáo tuyển dụng"
      description="Theo dõi hiệu quả tuyển dụng theo job, trạng thái và lịch phỏng vấn."
    >
      {error ? <p className="recruiter-state error">{error}</p> : null}

      <section className="recruiter-filters">
        <select value={days} onChange={(event) => setDays(event.target.value)}>
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
          <option value="365">365 ngày</option>
        </select>
      </section>

      {loading ? <p className="recruiter-empty">Đang tải báo cáo...</p> : null}
      {!loading && report ? (
        <>
          <section className="recruiter-kpi-grid">
            <article><span>Job đang mở</span><strong>{formatNumber(report.openJobs)}</strong></article>
            <article><span>Hồ sơ mới</span><strong>{formatNumber(report.newApplications)}</strong></article>
            <article><span>Tổng hồ sơ</span><strong>{formatNumber(report.totalApplications)}</strong></article>
            <article><span>Lịch phỏng vấn</span><strong>{formatNumber(report.interviewsScheduled)}</strong></article>
            <article><span>Đã tuyển</span><strong>{formatNumber(report.hiredApplications)}</strong></article>
            <article><span>Từ chối</span><strong>{formatNumber(report.rejectedApplications)}</strong></article>
          </section>

          <section className="recruiter-two-column">
            <div className="recruiter-panel">
              <header className="recruiter-panel-header">
                <h2>Theo trạng thái</h2>
              </header>
              <div className="recruiter-report-bars">
                {statusRows.map(([status, count]) => (
                  <div key={status}>
                    <span>{status}</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>
                ))}
                {statusRows.length === 0 ? <p className="recruiter-empty">Chưa có dữ liệu.</p> : null}
              </div>
            </div>

            <div className="recruiter-panel">
              <header className="recruiter-panel-header">
                <h2>Top job theo hồ sơ</h2>
              </header>
              <div className="recruiter-report-bars">
                {jobRows.map(([job, count]) => (
                  <div key={job}>
                    <span>{job}</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>
                ))}
                {jobRows.length === 0 ? <p className="recruiter-empty">Chưa có dữ liệu.</p> : null}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </RecruiterLayout>
  );
};

export default RecruiterReports;
