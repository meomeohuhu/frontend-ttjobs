import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const PAGE_SIZE = 6;
const filters = ["Toàn quốc", "Hà Nội", "Thành phố Hồ Chí Minh", "Miền Bắc", "Miền Nam"];

const fallbackBestJobs = [
  {
    id: "demo-best-backend",
    title: "Java Backend Developer",
    companyName: "TTJobs Demo Company",
    location: "Hà Nội",
    salaryMin: 20000000,
    salaryMax: 35000000,
    currency: "VND"
  },
  {
    id: "demo-best-sales",
    title: "Business Development Executive",
    companyName: "Growth Lab",
    location: "Thành phố Hồ Chí Minh",
    salaryMin: 15000000,
    salaryMax: 28000000,
    currency: "VND"
  },
  {
    id: "demo-best-hr",
    title: "Recruitment Specialist",
    companyName: "People Studio",
    location: "Đà Nẵng",
    salaryMin: 12000000,
    salaryMax: 22000000,
    currency: "VND"
  }
];

const formatNumber = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "";
  }
  return numberValue.toLocaleString("vi-VN");
};

const formatSalary = (job) => {
  const min = formatNumber(job.salaryMin);
  const max = formatNumber(job.salaryMax);
  const salary = formatNumber(job.salary);
  const currency = job.currency || "VND";

  if (min && max) {
    return `${min} - ${max} ${currency}`;
  }
  if (salary) {
    return `${salary} ${currency}`;
  }
  return "Thỏa thuận";
};

const filterJobsByRegion = (jobs, region) => {
  if (!region || region === "Toàn quốc") {
    return jobs;
  }
  const normalized = region.toLowerCase();
  if (normalized.includes("miền bắc")) {
    return jobs.filter((job) =>
      ["hà nội", "hải phòng", "bắc ninh", "hưng yên", "quảng ninh"].some((city) =>
        (job.location || "").toLowerCase().includes(city)
      )
    );
  }
  if (normalized.includes("miền nam")) {
    return jobs.filter((job) =>
      ["hồ chí minh", "tp.hcm", "bình dương", "đồng nai", "cần thơ"].some((city) =>
        (job.location || "").toLowerCase().includes(city)
      )
    );
  }
  return jobs.filter((job) => (job.location || "").toLowerCase().includes(normalized));
};

const markLogoFailed = (event) => {
  event.currentTarget.closest("[data-fallback]")?.setAttribute("data-logo-failed", "true");
};

const BestJobsSection = ({
  jobs = [],
  loading,
  error,
  savedIdSet,
  savingIds,
  onToggleSave
}) => {
  const [activeRegion, setActiveRegion] = useState(filters[0]);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const displayJobs = error && jobs.length === 0 ? fallbackBestJobs : jobs;
  const isDemoMode = error && jobs.length === 0;

  const filteredJobs = useMemo(
    () => filterJobsByRegion(displayJobs, activeRegion),
    [displayJobs, activeRegion]
  );

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const visibleJobs = useMemo(() => {
    if (expanded) return filteredJobs;
    const safePage = Math.min(page, pageCount - 1);
    return filteredJobs.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  }, [expanded, filteredJobs, page, pageCount]);

  const canGoPrev = !expanded && page > 0;
  const canGoNext = !expanded && page < pageCount - 1;

  const selectRegion = (region) => {
    setActiveRegion(region);
    setPage(0);
    setExpanded(false);
  };

  const toggleExpanded = () => {
    setExpanded((current) => !current);
    setPage(0);
  };

  return (
    <section className="best-jobs">
      <div className="section-head section-head-inline">
        <div className="section-head-copy">
          <h2>Việc làm được lưu nhiều</h2>
          <span className="ai-tag">Dựa trên mức độ quan tâm thực tế của ứng viên</span>
        </div>
        <div className="best-jobs-toolbar">
          <div className="filter-chips best-jobs-filter-chips">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${item === activeRegion ? "active" : ""}`}
                onClick={() => selectRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="section-actions">
            {filteredJobs.length > PAGE_SIZE ? (
              <button type="button" className="highlight-toggle" onClick={toggleExpanded}>
                {expanded ? "Thu gọn" : "Xem tất cả"}
              </button>
            ) : null}
            <div className="nav-circles">
              <button type="button" aria-label="Trước" disabled={!canGoPrev} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
                <span />
              </button>
              <button type="button" aria-label="Sau" disabled={!canGoNext} onClick={() => setPage((current) => Math.min(current + 1, pageCount - 1))}>
                <span />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTip ? (
        <div className="tip-box best-jobs-tip saved-alert">
          <span className="tip-icon" />
          <p>Chọn khu vực để xem nhanh những việc làm đang được lưu nhiều nhất theo vùng bạn quan tâm.</p>
          <button type="button" aria-label="Đóng" onClick={() => setShowTip(false)}>
            ×
          </button>
        </div>
      ) : null}

      <div className="job-cards best-job-cards">
        {loading && <p className="highlight-state">Đang tải danh sách việc làm được quan tâm...</p>}
        {!loading && isDemoMode && (
          <div className="highlight-state demo-state">
            <strong>Đang hiển thị việc làm mẫu</strong>
            <span>Backend chưa phản hồi, TTJobs giữ bố cục card để demo không bị trống.</span>
          </div>
        )}
        {!loading && error && !isDemoMode && <p className="highlight-state error">Không thể tải danh sách việc làm được lưu nhiều.</p>}
        {!loading && !error && filteredJobs.length === 0 && (
          <p className="highlight-state">Chưa có việc làm nổi bật cho khu vực này.</p>
        )}
        {!loading &&
          visibleJobs.map((job) => {
            const isSaved = savedIdSet?.has(job.id);
            const isSaving = savingIds?.includes(job.id);
            const isDemoJob = String(job.id || "").startsWith("demo-");

            return (
              <article className="job-card best-job-card saved-job-card" key={job.id ?? job.title}>
                <Link to={isDemoJob ? "/jobs" : `/jobs/${job.id}`} className="job-card-link">
                  <div className="job-logo" data-fallback={(job.companyName || "C").trim().charAt(0).toUpperCase()}>
                    {job.companyLogoUrl ? (
                      <img src={job.companyLogoUrl} alt={job.companyName || "Logo"} onError={markLogoFailed} />
                    ) : (
                      <span>{(job.companyName || "C")[0]}</span>
                    )}
                  </div>
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p>{job.companyName || "Đang cập nhật"}</p>
                    <div className="job-meta">
                      <span>{formatSalary(job)}</span>
                      <span>{job.location || "Toàn quốc"}</span>
                    </div>
                  </div>
                </Link>
                <button
                  className={`heart-btn ${isSaved ? "saved" : ""}`}
                  type="button"
                  aria-label={isSaved ? "Bỏ lưu" : "Lưu"}
                  disabled={isSaving}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!isDemoJob) {
                      onToggleSave?.(job.id);
                    }
                  }}
                >
                  <span />
                </button>
              </article>
            );
          })}
      </div>
    </section>
  );
};

export default BestJobsSection;
