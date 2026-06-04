import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import AdminLayout from "./AdminLayout.jsx";

const numberFormat = new Intl.NumberFormat("vi-VN");

const formatNumber = (value) => numberFormat.format(Number(value || 0));

const formatRatio = (value) => {
  const number = Number(value || 0);
  return Number.isInteger(number) ? number.toString() : number.toFixed(2);
};

const statusLabel = (value) => {
  if (!value) return "Không xác định";
  const labels = {
    submitted: "Đã nộp",
    pending: "Đang chờ",
    reviewing: "Đang xem xét",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
    scheduled: "Đã lên lịch",
    completed: "Đã hoàn tất",
    open: "Đang mở",
    closed: "Đã đóng",
    unknown: "Không xác định"
  };
  return labels[String(value).toLowerCase()] || String(value).replace(/_/g, " ");
};

const aiStatusLabel = (value) => {
  const status = String(value || "").toLowerCase();
  if (status === "ok") return "Ổn định";
  if (status === "degraded") return "Gián đoạn";
  return "Đang kiểm tra";
};

const periodOptions = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
  { value: "custom", label: "Tùy chọn" }
];

const chartMetrics = [
  { key: "newUsers", label: "Người dùng mới", color: "#2563eb" },
  { key: "newJobs", label: "Tin tuyển dụng mới", color: "#0f766e" },
  { key: "newApplications", label: "Hồ sơ ứng tuyển", color: "#d97706" },
  { key: "newInterviews", label: "Lịch phỏng vấn mới", color: "#7c3aed" },
  { key: "scheduledInterviews", label: "Phỏng vấn đã lên lịch", color: "#dc2626" }
];

const StatCard = ({ label, value, tone = "default", hint }) => (
  <article className={`admin-kpi-card ${tone !== "default" ? `admin-kpi-card-${tone}` : ""}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);

const StatusList = ({ title, items }) => {
  const entries = Object.entries(items || {});
  return (
    <article className="admin-insight-card">
      <h2>{title}</h2>
      {entries.length === 0 ? (
        <p>Chưa có dữ liệu.</p>
      ) : (
        <div className="admin-status-list">
          {entries.map(([status, count]) => (
            <div key={status}>
              <span>{statusLabel(status)}</span>
              <strong>{formatNumber(count)}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

const AdminBarChart = ({ metrics }) => {
  const maxValue = Math.max(...chartMetrics.map((item) => Number(metrics?.[item.key] || 0)), 1);

  return (
    <article className="admin-chart-card admin-chart-card-wide">
      <div className="admin-chart-card-head">
        <div>
          <h2>Biểu đồ vận hành</h2>
          <p>{metrics?.label || "Chọn kỳ thống kê để xem dữ liệu"}</p>
        </div>
      </div>
      <div className="admin-bar-chart" role="img" aria-label="Biểu đồ thống kê vận hành">
        {chartMetrics.map((item) => {
          const value = Number(metrics?.[item.key] || 0);
          const height = Math.max(8, Math.round((value / maxValue) * 180));
          const width = Math.max(8, Math.round((value / maxValue) * 100));
          return (
            <div className="admin-bar-item" key={item.key}>
              <strong>{formatNumber(value)}</strong>
              <div className="admin-bar-track">
                <span style={{ height: `${height}px`, "--bar-width": `${width}%`, background: item.color }} />
              </div>
              <small>{item.label}</small>
            </div>
          );
        })}
      </div>
    </article>
  );
};

const AdminDonutChart = ({ title, items }) => {
  const entries = Object.entries(items || {});
  const total = entries.reduce((sum, [, count]) => sum + Number(count || 0), 0);
  const palette = ["#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626"];

  return (
    <article className="admin-chart-card">
      <h2>{title}</h2>
      <div className="admin-donut-wrap">
        <div className="admin-donut">
          <strong>{formatNumber(total)}</strong>
          <span>Tổng</span>
        </div>
        <div className="admin-donut-legend">
          {entries.length === 0 ? <p>Chưa có dữ liệu.</p> : entries.map(([status, count], index) => (
            <div key={status}>
              <i style={{ background: palette[index % palette.length] }} />
              <span>{statusLabel(status)}</span>
              <strong>{formatNumber(count)}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("summary");
  const [period, setPeriod] = useState("week");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (period === "custom") {
          if (fromDate) params.set("from", fromDate);
          if (toDate) params.set("to", toDate);
        }
        const suffix = params.toString();
        const data = await apiRequest(`/api/admin/stats${suffix ? `?${suffix}` : ""}`);
        if (active) {
          setStats(data || {});
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải dashboard admin");
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
  }, [fromDate, period, toDate]);

  return (
    <AdminLayout
      title="Tổng quan hệ thống"
      description="Theo dõi người dùng, doanh nghiệp, tin tuyển dụng và hồ sơ ứng tuyển."
    >
      <section className="admin-overview-hero">
        <div>
          <span>Trung tâm điều hành</span>
          <h2>Giám sát toàn bộ TTJobs trong một màn hình</h2>
          <p>Quản trị người dùng, doanh nghiệp, tin tuyển dụng, phỏng vấn và sức khỏe AI matching.</p>
        </div>
        <strong>{aiStatusLabel(stats?.aiServiceStatus)}</strong>
      </section>

      {loading ? <p className="admin-state">Đang tải dữ liệu...</p> : null}
      {!loading && error ? <p className="admin-state error">{error}</p> : null}

      {!loading && !error && stats ? (
        <section className="admin-dashboard-controls" aria-label="Chế độ xem dashboard">
          <div className="admin-view-toggle">
            <button type="button" className={viewMode === "summary" ? "active" : ""} onClick={() => setViewMode("summary")}>
              Tổng quan
            </button>
            <button type="button" className={viewMode === "charts" ? "active" : ""} onClick={() => setViewMode("charts")}>
              Biểu đồ trực quan
            </button>
          </div>
          {viewMode === "charts" ? (
            <div className="admin-period-filter">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={period === option.value ? "active" : ""}
                  onClick={() => setPeriod(option.value)}
                >
                  {option.label}
                </button>
              ))}
              {period === "custom" ? (
                <div className="admin-date-range-filter">
                  <label>
                    Từ ngày
                    <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                  </label>
                  <label>
                    Đến ngày
                    <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && !error && stats && viewMode === "summary" ? (
        <section className="admin-kpi-grid">
          <StatCard label="Người dùng" value={formatNumber(stats.totalUsers)} hint={`+${formatNumber(stats.newUsersLast7Days)} trong 7 ngày`} />
          <StatCard label="Ứng viên" value={formatNumber(stats.totalCandidates)} />
          <StatCard label="Nhà tuyển dụng" value={formatNumber(stats.totalRecruiters)} />
          <StatCard label="Doanh nghiệp" value={formatNumber(stats.totalCompanies)} />
          <StatCard label="Tin tuyển dụng" value={formatNumber(stats.totalJobs)} hint={`${formatNumber(stats.openJobs)} đang mở`} />
          <StatCard label="Ứng tuyển" value={formatNumber(stats.totalApplications)} hint={`${formatRatio(stats.applicationPerJobRatio)} hồ sơ / tin`} />
          <StatCard label="Phỏng vấn" value={formatNumber(stats.totalInterviews)} hint={`${formatNumber(stats.upcomingInterviews)} sắp diễn ra`} />
          <StatCard label="AI matches" value={formatNumber(stats.storedCandidateMatches)} hint="Kết quả đã lưu" />
          <StatCard
            label="AI service"
            value={aiStatusLabel(stats.aiServiceStatus)}
            tone={stats.aiServiceStatus === "ok" ? "success" : "warning"}
            hint={stats.aiServiceMessage}
          />
        </section>
      ) : null}

      {!loading && !error && stats && viewMode === "charts" ? (
        <section className="admin-chart-grid">
          <AdminBarChart metrics={period === "custom" ? stats.customPeriodMetrics : stats.periodMetrics?.[period]} />
          <AdminDonutChart title="Phễu ứng tuyển" items={stats.applicationStatusCounts} />
          <AdminDonutChart title="Trạng thái phỏng vấn" items={stats.interviewStatusCounts} />
          <article className="admin-chart-card">
            <h2>Tỷ lệ chính</h2>
            <div className="admin-ratio-grid">
              <span><strong>{formatRatio(stats.applicationPerJobRatio)}</strong> hồ sơ / tin</span>
              <span><strong>{formatNumber(stats.openJobs)}</strong> tin đang mở</span>
              <span><strong>{formatNumber(stats.storedCandidateMatches)}</strong> AI matches</span>
            </div>
          </article>
        </section>
      ) : null}

      {!loading && !error && stats && viewMode === "summary" ? (
        <section className="admin-dashboard-grid">
          <article className="admin-insight-card">
            <h2>Tổng quan vận hành</h2>
            <p>Theo dõi tăng trưởng người dùng, tin tuyển dụng, hồ sơ ứng tuyển và phỏng vấn trên toàn hệ thống.</p>
            <div className="admin-metric-strip">
              <span>30 ngày: <strong>{formatNumber(stats.newUsersLast30Days)} người dùng mới</strong></span>
              <span>Tin đã đóng: <strong>{formatNumber(stats.closedJobs)}</strong></span>
            </div>
          </article>

          <article className="admin-insight-card">
            <h2>Quản lý người dùng</h2>
            <p>Quản lý candidate, recruiter, admin; hỗ trợ khóa tài khoản, soft delete và audit.</p>
            <div className="admin-metric-strip">
              <span>Quản trị viên: <strong>{formatNumber(stats.totalAdmins)}</strong></span>
              <span>Nhà tuyển dụng: <strong>{formatNumber(stats.totalRecruiters)}</strong></span>
            </div>
          </article>

          <article className="admin-insight-card">
            <h2>Quản lý phỏng vấn</h2>
            <p>Theo dõi lịch phỏng vấn, pending schedule và trạng thái phỏng vấn trực tiếp.</p>
            <div className="admin-metric-strip">
              <span>Đang chờ: <strong>{formatNumber(stats.pendingInterviews)}</strong></span>
              <span>Sắp diễn ra: <strong>{formatNumber(stats.upcomingInterviews)}</strong></span>
            </div>
          </article>

          <article className="admin-insight-card">
            <h2>Giám sát hệ thống & AI</h2>
            <p>{stats.aiServiceMessage || "Chưa có trạng thái AI service."}</p>
            <div className="admin-health-grid">
              <span className={stats.aiClassifierReady ? "ok" : "warn"}>Bộ phân loại {stats.aiClassifierReady ? "sẵn sàng" : "gián đoạn"}</span>
              <span className={stats.aiMatcherReady ? "ok" : "warn"}>Bộ matching {stats.aiMatcherReady ? "sẵn sàng" : "gián đoạn"}</span>
            </div>
          </article>

          <StatusList title="Phễu ứng tuyển" items={stats.applicationStatusCounts} />
          <StatusList title="Trạng thái phỏng vấn" items={stats.interviewStatusCounts} />

          <article className="admin-insight-card">
            <h2>Quy trình kiểm duyệt</h2>
            <p>Diễn đàn, báo cáo vi phạm, duyệt tin và xác minh doanh nghiệp dùng chung hàng chờ kiểm duyệt để admin xử lý nhanh.</p>
            <div className="admin-metric-strip">
              <span>Báo cáo diễn đàn: <strong>0</strong></span>
              <span>Tin bị gắn cờ: <strong>0</strong></span>
            </div>
          </article>

          <article className="admin-insight-card">
            <h2>Nhật ký & tuân thủ</h2>
            <p>Ghi nhật ký role change, delete, moderation, AI scoring và interview consent.</p>
            <div className="admin-metric-strip">
              <span>Sao lưu: <strong>đã cấu hình</strong></span>
              <span>Phân quyền: <strong>chỉ admin</strong></span>
            </div>
          </article>
        </section>
      ) : null}
    </AdminLayout>
  );
};

export default AdminDashboard;
