import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { applicationStatusLabels, applicationStatuses, formatDate, formatNumber } from "./recruiterUtils.js";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e", "#64748b", "#0f172a"];
const FUNNEL_STATUSES = ["submitted", "reviewing", "shortlisted", "interviewed", "offered", "hired"];

const toNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const pct = (value, total) => {
  const numberValue = toNumber(value);
  const numberTotal = toNumber(total);
  if (numberTotal <= 0) return "0%";
  return `${Math.round((numberValue / numberTotal) * 100)}%`;
};

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="report-chart-tooltip">
      <strong>{label || payload[0].name}</strong>
      <span>{formatNumber(payload[0].value)} hồ sơ</span>
    </div>
  );
};

const RecruiterReports = () => {
  const [days, setDays] = useState("30");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadReport = async () => {
      setLoading(true);
      setError("");
      try {
        const [reportData, applicationData, interviewData] = await Promise.all([
          apiRequest(`/api/recruiter/reports?days=${encodeURIComponent(days)}`),
          apiRequest("/api/recruiter/applications?size=500"),
          apiRequest("/api/recruiter/interviews")
        ]);
        if (!active) return;
        setReport(reportData || null);
        setApplications(Array.isArray(applicationData) ? applicationData : []);
        setInterviews(Array.isArray(interviewData) ? interviewData : []);
      } catch (err) {
        if (active) setError(err.message || "Không thể tải báo cáo");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadReport();
    return () => {
      active = false;
    };
  }, [days]);

  const cutoffDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - toNumber(days));
    return date;
  }, [days]);

  const visibleApplications = useMemo(() => {
    const keyword = normalize(query);
    return applications.filter((application) => {
      const createdAt = application.applicationDate ? new Date(application.applicationDate) : null;
      const inRange = !createdAt || Number.isNaN(createdAt.getTime()) || createdAt >= cutoffDate;
      const status = normalize(application.status || "submitted");
      const statusMatched = statusFilter === "all" || status === statusFilter;
      const text = normalize([
        application.candidateName,
        application.candidateEmail,
        application.jobTitle,
        application.companyName,
        application.status
      ].join(" "));
      return inRange && statusMatched && (!keyword || text.includes(keyword));
    });
  }, [applications, cutoffDate, query, statusFilter]);

  const filteredInterviews = useMemo(() => {
    const keyword = normalize(query);
    return interviews
      .filter((interview) => {
        const scheduledAt = interview.scheduledAt ? new Date(interview.scheduledAt) : null;
        const inRange = !scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt >= cutoffDate;
        const text = normalize([
          interview.candidateName,
          interview.jobTitle,
          interview.companyName,
          interview.status,
          interview.location
        ].join(" "));
        return inRange && (!keyword || text.includes(keyword));
      })
      .sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0));
  }, [cutoffDate, interviews, query]);

  const statusChartData = useMemo(() => {
    const counts = new Map(applicationStatuses.map((status) => [status, 0]));
    visibleApplications.forEach((application) => {
      const status = normalize(application.status || "submitted");
      counts.set(status, (counts.get(status) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([status, value]) => ({
        status,
        name: applicationStatusLabels[status] || status,
        value
      }))
      .filter((item) => item.value > 0);
  }, [visibleApplications]);

  const jobChartData = useMemo(() => {
    const counts = new Map();
    visibleApplications.forEach((application) => {
      const key = application.jobTitle || "Chưa rõ tin tuyển dụng";
      const item = counts.get(key) || {
        name: key,
        companyName: application.companyName || "Chưa rõ công ty",
        applications: 0,
        hired: 0,
        rejected: 0,
        interviews: 0,
        aiAverage: 0,
        aiCount: 0
      };
      item.applications += 1;
      if (normalize(application.status) === "hired") item.hired += 1;
      if (normalize(application.status) === "rejected") item.rejected += 1;
      if (["interviewed", "offered", "hired"].includes(normalize(application.status))) item.interviews += 1;
      if (application.aiScoreAvailable && application.aiScore != null) {
        item.aiAverage += toNumber(application.aiScore);
        item.aiCount += 1;
      }
      counts.set(key, item);
    });
    return Array.from(counts.values())
      .map((item) => ({
        ...item,
        aiAverage: item.aiCount > 0 ? Math.round(item.aiAverage / item.aiCount) : null
      }))
      .sort((a, b) => b.applications - a.applications);
  }, [visibleApplications]);

  const funnelData = useMemo(() => {
    const counts = new Map(statusChartData.map((item) => [item.status, item.value]));
    return FUNNEL_STATUSES.map((status) => ({
      status,
      name: applicationStatusLabels[status] || status,
      value: counts.get(status) || 0
    }));
  }, [statusChartData]);

  const totalVisible = visibleApplications.length;
  const hiredVisible = visibleApplications.filter((item) => normalize(item.status) === "hired").length;
  const rejectedVisible = visibleApplications.filter((item) => normalize(item.status) === "rejected").length;
  const interviewReady = visibleApplications.filter((item) =>
    ["interviewed", "offered", "hired"].includes(normalize(item.status))
  ).length;
  const topJobs = jobChartData.slice(0, 8);

  const buildReportDocument = () => {
    const generatedAt = new Date().toLocaleString("vi-VN");
    const statusRows = statusChartData.map((item) => `
      <tr><td>${escapeHtml(item.name)}</td><td>${formatNumber(item.value)}</td></tr>
    `).join("");
    const jobRows = jobChartData.map((job) => `
      <tr>
        <td>${escapeHtml(job.name)}</td>
        <td>${escapeHtml(job.companyName)}</td>
        <td>${formatNumber(job.applications)}</td>
        <td>${formatNumber(job.interviews)}</td>
        <td>${formatNumber(job.hired)}</td>
        <td>${formatNumber(job.rejected)}</td>
        <td>${job.aiAverage == null ? "Chưa chấm" : `${job.aiAverage}/100`}</td>
      </tr>
    `).join("");
    const interviewRows = filteredInterviews.map((interview) => `
      <tr>
        <td>${escapeHtml(interview.candidateName || "Ứng viên")}</td>
        <td>${escapeHtml(interview.jobTitle || "Chưa rõ job")}</td>
        <td>${formatDate(interview.scheduledAt)}</td>
        <td>${escapeHtml(interview.status || "pending")}</td>
      </tr>
    `).join("");

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Báo cáo tình hình tuyển dụng</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; }
            h1 { margin: 0 0 8px; color: #1d4ed8; }
            h2 { margin-top: 24px; color: #0f172a; }
            .meta { color: #475569; margin-bottom: 18px; }
            .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
            .kpi { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
            .kpi span { display: block; color: #475569; font-size: 12px; }
            .kpi strong { display: block; margin-top: 4px; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #eff6ff; color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h1>Báo cáo tình hình tuyển dụng công ty</h1>
          <div class="meta">Khoảng thời gian: ${escapeHtml(days)} ngày gần đây · Tạo lúc: ${escapeHtml(generatedAt)}</div>
          <div class="kpis">
            <div class="kpi"><span>Job đang mở</span><strong>${formatNumber(report?.openJobs)}</strong></div>
            <div class="kpi"><span>Hồ sơ trong bộ lọc</span><strong>${formatNumber(totalVisible)}</strong></div>
            <div class="kpi"><span>Tỷ lệ vào phỏng vấn</span><strong>${pct(interviewReady, totalVisible)}</strong></div>
            <div class="kpi"><span>Tỷ lệ tuyển</span><strong>${pct(hiredVisible, totalVisible)}</strong></div>
          </div>
          <h2>Phân bổ trạng thái</h2>
          <table><thead><tr><th>Trạng thái</th><th>Số hồ sơ</th></tr></thead><tbody>${statusRows || "<tr><td colspan='2'>Không có dữ liệu</td></tr>"}</tbody></table>
          <h2>Hiệu quả theo tin tuyển dụng</h2>
          <table>
            <thead><tr><th>Tin tuyển dụng</th><th>Công ty</th><th>Hồ sơ</th><th>Phỏng vấn</th><th>Đã tuyển</th><th>Từ chối</th><th>AI trung bình</th></tr></thead>
            <tbody>${jobRows || "<tr><td colspan='7'>Không có dữ liệu</td></tr>"}</tbody>
          </table>
          <h2>Lịch phỏng vấn</h2>
          <table><thead><tr><th>Ứng viên</th><th>Job</th><th>Ngày</th><th>Trạng thái</th></tr></thead><tbody>${interviewRows || "<tr><td colspan='4'>Không có lịch phỏng vấn</td></tr>"}</tbody></table>
        </body>
      </html>`;
  };

  const exportWord = () => {
    if (!report) return;
    const blob = new Blob([buildReportDocument()], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bao-cao-tuyen-dung-${days}-ngay.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!report) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(buildReportDocument());
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 250);
  };

  return (
    <RecruiterLayout
      title="Báo cáo tuyển dụng"
      description="Theo dõi hiệu quả tuyển dụng theo trạng thái, tin tuyển dụng, phỏng vấn và chất lượng hồ sơ."
      actions={(
        <div className="report-export-actions">
          <button type="button" className="recruiter-secondary-action" onClick={exportWord} disabled={!report || loading}>
            Xuất Word
          </button>
          <button type="button" className="recruiter-primary-action" onClick={exportPdf} disabled={!report || loading}>
            Xuất PDF
          </button>
        </div>
      )}
    >
      {error ? <p className="recruiter-state error">{error}</p> : null}

      <section className="recruiter-filters recruiter-report-filters">
        <label>
          Khoảng thời gian
          <select value={days} onChange={(event) => setDays(event.target.value)}>
            <option value="7">7 ngày gần đây</option>
            <option value="30">30 ngày gần đây</option>
            <option value="90">90 ngày gần đây</option>
            <option value="365">365 ngày gần đây</option>
          </select>
        </label>
        <label>
          Trạng thái hồ sơ
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>{applicationStatusLabels[status] || status}</option>
            ))}
          </select>
        </label>
        <label className="report-search-field">
          Tìm kiếm
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tên ứng viên, job, công ty..."
          />
        </label>
      </section>

      {loading ? <p className="recruiter-empty">Đang tải báo cáo...</p> : null}
      {!loading && report ? (
        <>
          <section className="recruiter-kpi-grid report-kpi-grid">
            <article className="recruiter-kpi-card">
              <span>Job đang mở</span>
              <strong>{formatNumber(report.openJobs)}</strong>
              <small>Tổng job đang nhận hồ sơ</small>
            </article>
            <article className="recruiter-kpi-card">
              <span>Hồ sơ trong bộ lọc</span>
              <strong>{formatNumber(totalVisible)}</strong>
              <small>{formatNumber(report.newApplications)} hồ sơ mới theo API</small>
            </article>
            <article className="recruiter-kpi-card">
              <span>Tỷ lệ vào phỏng vấn</span>
              <strong>{pct(interviewReady, totalVisible)}</strong>
              <small>{formatNumber(interviewReady)} hồ sơ đã qua vòng phỏng vấn</small>
            </article>
            <article className="recruiter-kpi-card">
              <span>Tỷ lệ tuyển</span>
              <strong>{pct(hiredVisible, totalVisible)}</strong>
              <small>{formatNumber(hiredVisible)} đã tuyển, {formatNumber(rejectedVisible)} từ chối</small>
            </article>
          </section>

          <section className="report-chart-grid">
            <article className="recruiter-panel report-chart-card">
              <header className="recruiter-panel-header">
                <h2>Phân bổ trạng thái</h2>
                <span>{formatNumber(totalVisible)} hồ sơ</span>
              </header>
              {statusChartData.length > 0 ? (
                <div className="report-donut-layout">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={64}
                        outerRadius={104}
                        paddingAngle={2}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="report-legend">
                    {statusChartData.map((item, index) => (
                      <div key={item.status}>
                        <i style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{item.name}</span>
                        <strong>{formatNumber(item.value)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="recruiter-empty">Không có hồ sơ phù hợp bộ lọc.</p>
              )}
            </article>

            <article className="recruiter-panel report-chart-card">
              <header className="recruiter-panel-header">
                <h2>Top job theo hồ sơ</h2>
                <span>{formatNumber(topJobs.length)} job</span>
              </header>
              {topJobs.length > 0 ? (
                <div className="report-top-job-columns">
                  {topJobs.map((job, index) => {
                    const max = Math.max(...topJobs.map((item) => item.applications), 1);
                    return (
                      <div key={job.name} className="report-top-job-column">
                        <strong className="report-top-job-value">{formatNumber(job.applications)}</strong>
                        <div className="report-top-job-column-track" aria-label={`${job.applications} hồ sơ`}>
                          <i
                            style={{
                              height: `${Math.max(12, (job.applications / max) * 100)}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <div className="report-top-job-label">
                          <strong>{job.name}</strong>
                          <span>{job.companyName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="recruiter-empty">Không có job phù hợp bộ lọc.</p>
              )}
            </article>
          </section>

          <section className="report-chart-grid report-chart-grid-compact">
            <article className="recruiter-panel report-chart-card">
              <header className="recruiter-panel-header">
                <h2>Funnel tuyển dụng</h2>
                <span>Từ nộp hồ sơ đến tuyển</span>
              </header>
              <div className="report-funnel">
                {funnelData.map((item, index) => {
                  const max = Math.max(...funnelData.map((entry) => entry.value), 1);
                  return (
                    <div key={item.status} className="report-funnel-row">
                      <span>{item.name}</span>
                      <div>
                        <i style={{ width: `${Math.max(8, (item.value / max) * 100)}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                      </div>
                      <strong>{formatNumber(item.value)}</strong>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="recruiter-panel report-chart-card">
              <header className="recruiter-panel-header">
                <h2>Lịch phỏng vấn</h2>
                <span>{formatNumber(filteredInterviews.length)} lịch</span>
              </header>
              <div className="report-interview-list">
                {filteredInterviews.slice(0, 6).map((interview) => (
                  <div key={interview.id}>
                    <strong>{interview.candidateName || "Ứng viên"}</strong>
                    <span>{interview.jobTitle || "Chưa rõ job"}</span>
                    <small>{formatDate(interview.scheduledAt)} · {interview.status || "pending"}</small>
                  </div>
                ))}
                {filteredInterviews.length === 0 ? <p className="recruiter-empty">Chưa có lịch phỏng vấn phù hợp.</p> : null}
              </div>
            </article>
          </section>

          <section className="recruiter-panel report-table-panel">
            <header className="recruiter-panel-header">
              <h2>Hiệu quả theo tin tuyển dụng</h2>
              <span>{formatNumber(jobChartData.length)} tin</span>
            </header>
            <div className="report-job-table">
              <div className="report-job-table-head">
                <span>Tin tuyển dụng</span>
                <span>Hồ sơ</span>
                <span>Phỏng vấn</span>
                <span>Đã tuyển</span>
                <span>Từ chối</span>
                <span>AI trung bình</span>
              </div>
              {jobChartData.map((job) => (
                <div key={job.name} className="report-job-row">
                  <div>
                    <strong>{job.name}</strong>
                    <small>{job.companyName}</small>
                  </div>
                  <span>{formatNumber(job.applications)}</span>
                  <span>{formatNumber(job.interviews)}</span>
                  <span>{formatNumber(job.hired)}</span>
                  <span>{formatNumber(job.rejected)}</span>
                  <span>{job.aiAverage == null ? "Chưa chấm" : `${job.aiAverage}/100`}</span>
                </div>
              ))}
              {jobChartData.length === 0 ? <p className="recruiter-empty">Không có dữ liệu trong bộ lọc hiện tại.</p> : null}
            </div>
          </section>
        </>
      ) : null}
    </RecruiterLayout>
  );
};

export default RecruiterReports;
