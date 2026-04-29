import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 4;

const fallbackHighlightJobs = [
  {
    id: "demo-highlight-backend",
    title: "Java Backend Developer",
    companyName: "TTJobs Demo Company",
    jobType: "Full-time",
    location: "Hà Nội",
    salaryMin: 20000000,
    salaryMax: 35000000,
    currency: "VND",
    description: "Cơ hội demo với mức đãi ngộ tốt, phù hợp để xem bố cục khi backend chưa phản hồi."
  },
  {
    id: "demo-highlight-product",
    title: "Product Operations Executive",
    companyName: "Career Growth Lab",
    jobType: "Hybrid",
    location: "Đà Nẵng",
    salaryMin: 16000000,
    salaryMax: 26000000,
    currency: "VND",
    description: "Theo dõi vận hành sản phẩm tuyển dụng và phối hợp cùng đội dữ liệu để cải thiện trải nghiệm ứng viên."
  },
  {
    id: "demo-highlight-hr",
    title: "Recruitment Specialist",
    companyName: "People Studio",
    jobType: "Full-time",
    location: "TP. Hồ Chí Minh",
    salaryMin: 14000000,
    salaryMax: 24000000,
    currency: "VND",
    description: "Quản lý nguồn ứng viên, sàng lọc hồ sơ và đồng hành cùng hiring manager trong từng vòng tuyển dụng."
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

const formatJobBadge = (job) => {
  const raw = String(job?.jobType || job?.workType || job?.employmentType || "").trim();
  if (raw) {
    return raw;
  }
  if (String(job?.location || "").toLowerCase().includes("remote")) {
    return "Remote";
  }
  return "Full-time";
};

const formatDescription = (job) => {
  const raw = String(job?.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) {
    return "Cơ hội phù hợp cho ứng viên đang tìm công việc có đãi ngộ tốt và thông tin rõ ràng.";
  }
  return raw.length > 84 ? `${raw.slice(0, 81)}...` : raw;
};

const markLogoFailed = (event) => {
  event.currentTarget.closest("[data-fallback]")?.setAttribute("data-logo-failed", "true");
};

const HighlightJobsSection = ({
  jobs = [],
  loading,
  error,
  savedIdSet,
  savingIds,
  onToggleSave
}) => {
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const displayJobs = error && jobs.length === 0 ? fallbackHighlightJobs : jobs;
  const isDemoMode = error && jobs.length === 0;

  const pageCount = Math.max(1, Math.ceil(displayJobs.length / PAGE_SIZE));
  const visibleJobs = useMemo(() => {
    if (expanded) return displayJobs;
    const safePage = Math.min(page, pageCount - 1);
    return displayJobs.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  }, [displayJobs, expanded, page, pageCount]);

  const canGoPrev = !expanded && page > 0;
  const canGoNext = !expanded && page < pageCount - 1;
  const featuredLayoutClass = `highlight-grid ${visibleJobs.length < 4 ? "is-compact" : "is-balanced"}`;

  const goPrev = () => setPage((current) => Math.max(current - 1, 0));
  const goNext = () => setPage((current) => Math.min(current + 1, pageCount - 1));

  const toggleExpanded = () => {
    setExpanded((current) => !current);
    setPage(0);
  };

  return (
    <section className="highlight-jobs">
      <div className="highlight-header">
        <div>
          <h2>Việc làm nổi bật hôm nay</h2>
          <span className="ai-tag">Ưu tiên mức lương cao và phúc lợi tốt</span>
        </div>
        <div className="highlight-actions">
          {displayJobs.length > PAGE_SIZE ? (
            <button type="button" className="highlight-toggle" onClick={toggleExpanded}>
              {expanded ? "Thu gọn" : "Xem tất cả"}
            </button>
          ) : null}
          <div className="nav-circles">
            <button type="button" aria-label="Trước" disabled={!canGoPrev} onClick={goPrev}>
              <span />
            </button>
            <button type="button" aria-label="Sau" disabled={!canGoNext} onClick={goNext}>
              <span />
            </button>
          </div>
        </div>
      </div>

      <div className={featuredLayoutClass}>
        <div className="highlight-list">
          {loading && <p className="highlight-state">Đang tải các cơ hội nổi bật...</p>}
          {!loading && isDemoMode && (
            <div className="highlight-state demo-state">
              <strong>Đang hiển thị bố cục demo</strong>
              <span>Máy chủ chưa phản hồi, nhưng danh sách vẫn giữ layout hoàn chỉnh để bạn xem giao diện.</span>
            </div>
          )}
          {!loading && error && !isDemoMode && <p className="highlight-state error">Không thể tải danh sách việc làm nổi bật.</p>}
          {!loading && !error && displayJobs.length === 0 && (
            <p className="highlight-state">Hiện chưa có việc làm nổi bật phù hợp để hiển thị.</p>
          )}
          {!loading &&
            visibleJobs.map((job) => {
              const isSaved = savedIdSet?.has(job.id);
              const isSaving = savingIds?.includes(job.id);
              const isDemoJob = String(job.id || "").startsWith("demo-");

              return (
                <article className="job-card highlight-job-card" key={job.id ?? job.title}>
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
                  <Link to={isDemoJob ? "/jobs" : `/jobs/${job.id}`} className="job-card-link highlight-job-link">
                    <div className="job-logo" data-fallback={(job.companyName || "C").trim().charAt(0).toUpperCase()}>
                      {job.companyLogoUrl ? (
                        <img src={job.companyLogoUrl} alt={job.companyName || "Logo"} onError={markLogoFailed} />
                      ) : (
                        <span>{(job.companyName || "C")[0]}</span>
                      )}
                    </div>
                    <div className="job-info highlight-job-info">
                      <div className="highlight-job-top">
                        <span className="job-type-badge">{formatJobBadge(job)}</span>
                      </div>
                      <h3>{job.title}</h3>
                      <p>{job.companyName || "Đang cập nhật"}</p>
                      <div className="job-meta">
                        <span>{formatSalary(job)}</span>
                        <span>{job.location || "Toàn quốc"}</span>
                      </div>
                      <div className="job-snippet job-description">{formatDescription(job)}</div>
                      <div className="highlight-job-footer">
                        <span className="highlight-job-cta">Xem chi tiết</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
        </div>

        <aside className="highlight-banner featured-jobs-promo featured-promo">
          <div className="banner-glow" />
          <div className="featured-promo-main">
            <span className="highlight-banner-kicker">Ưu tiên theo thu nhập</span>
            <h3>Những công việc đang mở với mức đãi ngộ đáng chú ý để bạn cân nhắc trước.</h3>
            <div className="banner-chips">
              <span>Lương cao</span>
              <span>Phúc lợi rõ</span>
              <span>Mở tuyển</span>
            </div>
          </div>
          <div className="featured-promo-side">
            <div className="banner-roles">
              <p>Backend Developer</p>
              <p>Business Development</p>
              <p>HR Executive</p>
              <p>Operations Specialist</p>
            </div>
            <button type="button" onClick={toggleExpanded}>
              {expanded ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default HighlightJobsSection;
