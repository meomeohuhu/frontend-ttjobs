import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const filters = [
  "Ngẫu nhiên",
  "Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Miền Bắc",
  "Miền Nam"
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
  if (!region || region === "Ngẫu nhiên") {
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
  return jobs.filter((job) =>
    (job.location || "").toLowerCase().includes(normalized)
  );
};

const BestJobsSection = ({ jobs, loading, error, savedIdSet, savingIds, onToggleSave }) => {
  const [activeRegion, setActiveRegion] = useState(filters[0]);

  const filteredJobs = useMemo(
    () => filterJobsByRegion(jobs, activeRegion),
    [jobs, activeRegion]
  );

  return (
    <section className="best-jobs">
      <div className="section-head">
        <div>
          <h2>Việc làm tốt nhất</h2>
          <span className="ai-tag">Top job có lượt lưu nhiều nhất</span>
        </div>
        <div className="section-actions">
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

      <div className="filter-row">
        <div className="filter-dropdown">
          <span className="search-icon slider" />
          <span>Lọc theo:</span>
          <strong>Địa điểm</strong>
          <span className="caret" />
        </div>
        <div className="filter-chips">
          <button className="chip-nav" type="button" aria-label="Trước">
            <span />
          </button>
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${item === activeRegion ? "active" : ""}`}
              onClick={() => setActiveRegion(item)}
            >
              {item}
            </button>
          ))}
          <button className="chip-nav" type="button" aria-label="Sau">
            <span />
          </button>
        </div>
      </div>

      <div className="tip-box">
        <span className="tip-icon" />
        <p>Gợi ý: Di chuột vào tiêu đề việc làm để xem thêm thông tin chi tiết</p>
        <button type="button" aria-label="Đóng">
          ×
        </button>
      </div>

      <div className="job-cards">
        {loading && <p>Đang tải dữ liệu...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && filteredJobs.length === 0 && (
          <p>Chưa có công việc phù hợp khu vực này.</p>
        )}
        {!loading &&
          !error &&
          filteredJobs.map((job) => {
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
    </section>
  );
};

export default BestJobsSection;
