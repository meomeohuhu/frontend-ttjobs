import { Link } from "react-router-dom";
import { ENABLE_DEMO_FALLBACK } from "../lib/demoFallback.js";

const fallbackLatestJobs = [
  {
    id: "demo-latest-backend",
    title: "Java Backend Developer",
    companyName: "TTJobs Demo Company",
    location: "Ha Noi",
    salaryMin: 20000000,
    salaryMax: 35000000,
    currency: "VND",
    jobType: "Full-time"
  },
  {
    id: "demo-latest-product",
    title: "Product Operations Executive",
    companyName: "Career Growth Lab",
    location: "Da Nang",
    salaryMin: 16000000,
    salaryMax: 26000000,
    currency: "VND",
    jobType: "Hybrid"
  },
  {
    id: "demo-latest-recruiter",
    title: "Recruitment Specialist",
    companyName: "People Studio",
    location: "TP. Ho Chi Minh",
    salaryMin: 14000000,
    salaryMax: 24000000,
    currency: "VND",
    jobType: "Full-time"
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

  if (min && max) return `${min} - ${max} ${currency}`;
  if (salary) return `${salary} ${currency}`;
  return "Thoa thuan";
};

const formatMatchScore = (job) => {
  const score = Number(job?.matchScore);
  if (!Number.isFinite(score) || score <= 0) {
    return "Phu hop";
  }
  return `${Math.round(score)}% phu hop`;
};

const markLogoFailed = (event) => {
  event.currentTarget.closest("[data-fallback]")?.setAttribute("data-logo-failed", "true");
};

const HomeJobCard = ({ job, savedIdSet, savingIds, onToggleSave, showMatch }) => {
  const isDemoJob = String(job.id || "").startsWith("demo-");
  const isSaved = savedIdSet?.has(job.id);
  const isSaving = savingIds?.includes(job.id);

  return (
    <article className="job-card home-job-card saved-job-card">
      <Link to={isDemoJob ? "/jobs" : `/jobs/${job.id}`} className="job-card-link">
        <div className="job-logo" data-fallback={(job.companyName || "C").trim().charAt(0).toUpperCase()}>
          {job.imageUrl || job.companyLogoUrl ? (
            <img src={job.imageUrl || job.companyLogoUrl} alt={job.title || job.companyName || "Logo"} onError={markLogoFailed} />
          ) : (
            <span>{(job.companyName || "C")[0]}</span>
          )}
        </div>
        <div className="job-info home-job-info">
          <div className="home-job-badges">
            <span>{job.jobType || "Full-time"}</span>
            {showMatch ? <span>{formatMatchScore(job)}</span> : null}
          </div>
          <h3>{job.title}</h3>
          <p>{job.companyName || "Dang cap nhat"}</p>
          <div className="job-meta">
            <span>{formatSalary(job)}</span>
            <span>{job.location || "Toan quoc"}</span>
          </div>
          {showMatch && Array.isArray(job.matchReasons) && job.matchReasons.length > 0 ? (
            <div className="home-match-reasons">
              {job.matchReasons.slice(0, 2).map((reason) => (
                <span key={reason}>{reason}</span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
      <button
        className={`heart-btn ${isSaved ? "saved" : ""}`}
        type="button"
        aria-label={isSaved ? "Bo luu" : "Luu"}
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
};

export const LatestJobsSection = ({ jobs = [], loading, error, savedIdSet, savingIds, onToggleSave }) => {
  const displayJobs = error && jobs.length === 0 && ENABLE_DEMO_FALLBACK ? fallbackLatestJobs : jobs;
  const visibleJobs = displayJobs.slice(0, 6);
  const isDemoMode = error && jobs.length === 0 && ENABLE_DEMO_FALLBACK;

  return (
    <section className="latest-jobs-section home-job-section">
      <div className="section-head section-head-inline">
        <div className="section-head-copy">
          <h2>Việc làm mới cập nhật</h2>
          <span className="ai-tag">Các cơ hội vừa mở trên TTJobs</span>
        </div>
        <div className="section-actions">
          <Link to="/jobs?sort=latest">Xem tất cả</Link>
        </div>
      </div>

      <div className="job-cards home-job-cards">
        {loading ? <p className="highlight-state">Đang tải việc làm mới...</p> : null}
        {!loading && isDemoMode ? (
          <div className="highlight-state demo-state">
            <strong>Đang hiển thị việc làm mẫu</strong>
            <span>Backend chưa phản hồi, TTJobs giữ bố cục để bạn vẫn xem được trang chủ.</span>
          </div>
        ) : null}
        {!loading && error && !isDemoMode ? <p className="highlight-state error">Không thể tải việc làm mới.</p> : null}
        {!loading && !error && visibleJobs.length === 0 ? (
          <p className="highlight-state">Chưa có việc làm mới để hiển thị.</p>
        ) : null}
        {!loading
          ? visibleJobs.map((job) => (
              <HomeJobCard
                key={job.id ?? job.title}
                job={job}
                savedIdSet={savedIdSet}
                savingIds={savingIds}
                onToggleSave={onToggleSave}
              />
            ))
          : null}
      </div>
    </section>
  );
};

export const PersonalizedJobsSection = ({
  jobs = [],
  loading,
  error,
  isLoggedIn,
  hasConfiguredNeeds,
  savedIdSet,
  savingIds,
  onToggleSave
}) => {
  const visibleJobs = jobs.slice(0, 6);
  const showSetupState = !loading && isLoggedIn && !error && !hasConfiguredNeeds;
  const showNoMatchState = !loading && isLoggedIn && !error && hasConfiguredNeeds && visibleJobs.length === 0;
  const showLoginState = !loading && !isLoggedIn;
  const showErrorState = !loading && isLoggedIn && error;

  return (
    <section className="personalized-jobs-section home-job-section">
      <div className="section-head section-head-inline">
        <div className="section-head-copy">
          <h2>Gợi ý phù hợp với bạn</h2>
          <span className="ai-tag">Dựa trên nhu cầu việc làm đã lưu</span>
        </div>
        <div className="section-actions">
          <Link to={isLoggedIn ? "/user/job-needs" : "/login"}>
            {isLoggedIn ? "Cập nhật nhu cầu" : "Đăng nhập"}
          </Link>
        </div>
      </div>

      {showLoginState ? (
        <div className="home-personalized-empty">
          <div>
            <strong>Cá nhân hóa cơ hội việc làm của bạn</strong>
            <p>Lưu vị trí, khu vực, ngành nghề và mức lương mong muốn để TTJobs gợi ý job sát hơn.</p>
          </div>
          <Link to="/login">Đăng nhập để bắt đầu</Link>
        </div>
      ) : null}

      {showSetupState ? (
        <div className="home-personalized-empty">
          <div>
            <strong>Bạn chưa thiết lập nhu cầu tìm việc</strong>
            <p>Thêm tiêu chí mong muốn để hệ thống ưu tiên các công việc phù hợp hơn.</p>
          </div>
          <Link to="/user/job-needs">Thiết lập ngay</Link>
        </div>
      ) : null}

      {showNoMatchState ? (
        <div className="home-personalized-empty">
          <div>
            <strong>Chưa có việc làm phù hợp với nhu cầu đã lưu</strong>
            <p>Thử nới lỏng tiêu chí, bỏ bớt từ khóa loại trừ hoặc cập nhật thêm kỹ năng ưu tiên.</p>
          </div>
          <Link to="/user/job-needs">Cập nhật nhu cầu</Link>
        </div>
      ) : null}

      {showErrorState ? (
        <div className="home-personalized-empty">
          <div>
            <strong>Chưa tải được gợi ý cá nhân</strong>
            <p>Hãy đăng nhập lại hoặc cập nhật nhu cầu để TTJobs làm mới danh sách phù hợp với bạn.</p>
          </div>
          <Link to="/user/job-needs">Cập nhật nhu cầu</Link>
        </div>
      ) : null}

      <div className="job-cards home-job-cards personalized-job-cards">
        {loading ? <p className="highlight-state">Đang tải gợi ý phù hợp...</p> : null}
        {!loading && !error
          ? visibleJobs.map((job) => (
              <HomeJobCard
                key={job.id ?? job.title}
                job={job}
                savedIdSet={savedIdSet}
                savingIds={savingIds}
                onToggleSave={onToggleSave}
                showMatch
              />
            ))
          : null}
      </div>
    </section>
  );
};
