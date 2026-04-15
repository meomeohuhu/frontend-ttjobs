import { Link } from "react-router-dom";

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

const HighlightJobsSection = ({ jobs, loading, error, savedIdSet, savingIds, onToggleSave }) => {
  return (
    <section className="highlight-jobs">
      <div className="highlight-header">
        <div>
          <h2>Việc làm hấp dẫn</h2>
          <span className="ai-tag">Ưu tiên mức lương cao</span>
        </div>
        <div className="highlight-actions">
          <a href="#">Xem tất cả</a>
          <div className="nav-circles">
            <button type="button" aria-label="Trước">
              <span />
            </button>
            <button type="button" aria-label="Sau">
              <span />
            </button>
          </div>
        </div>
      </div>

      <div className="highlight-grid">
        <div className="highlight-list">
          {loading && <p>Đang tải dữ liệu...</p>}
          {!loading && error && <p>{error}</p>}
          {!loading &&
            !error &&
            jobs.map((job) => {
              const isSaved = savedIdSet?.has(job.id);
              const isSaving = savingIds?.includes(job.id);

              return (
                <div className="job-card" key={job.id ?? job.title}>
                  <Link to={`/jobs/${job.id}`} className="job-card-link">
                    <div className="job-logo">
                      {job.companyLogoUrl ? (
                        <img src={job.companyLogoUrl} alt={job.companyName || "Logo"} />
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
                      onToggleSave?.(job.id);
                    }}
                  >
                    <span />
                  </button>
                </div>
              );
            })}
        </div>
        <aside className="highlight-banner">
          <div className="banner-glow" />
          <h3>500+ việc làm phổ thông thu nhập hấp dẫn</h3>
          <div className="banner-chips">
            <span>Làm thời vụ</span>
            <span>Làm tại nhà</span>
            <span>Làm theo ca</span>
          </div>
          <div className="banner-roles">
            <p>Nhân viên phục vụ</p>
            <p>Nhân viên tài xế</p>
            <p>Nhân viên giao hàng</p>
            <p>Nhân viên kho</p>
          </div>
          <button type="button">Khám phá ngay</button>
        </aside>
      </div>
    </section>
  );
};

export default HighlightJobsSection;
