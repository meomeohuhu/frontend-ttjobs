import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";
import Footer from "../sections/Footer.jsx";

const demoJobs = [
  {
    id: "demo-backend",
    title: "Java Backend Developer",
    companyName: "TTJobs Demo Company",
    category: "INFORMATION_TECHNOLOGY",
    jobType: "Full-time",
    location: "Ha Noi",
    salaryMin: 20000000,
    salaryMax: 35000000,
    currency: "VND",
    description: "Phat trien API, toi uu he thong va phoi hop voi product team trong moi truong co du lieu that."
  },
  {
    id: "demo-business",
    title: "Business Development Executive",
    companyName: "Growth Lab",
    category: "SALES",
    jobType: "Hybrid",
    location: "Thanh pho Ho Chi Minh",
    salaryMin: 15000000,
    salaryMax: 28000000,
    currency: "VND",
    description: "Mo rong tap khach hang doanh nghiep, theo doi pipeline va de xuat chien dich tuyen dung phu hop."
  },
  {
    id: "demo-hr",
    title: "Recruitment Specialist",
    companyName: "People Studio",
    category: "HR",
    jobType: "Full-time",
    location: "Da Nang",
    salaryMin: 12000000,
    salaryMax: 22000000,
    currency: "VND",
    description: "Quan ly nguon ung vien, sang loc CV va dong hanh cung hiring manager trong tung vong phong van."
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
  return "Thỏa thuận";
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const formatDescription = (job) => {
  const raw = String(job?.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) {
    return "Thông tin công việc đang được cập nhật để bạn có thể ra quyết định nhanh hơn.";
  }
  return raw.length > 120 ? `${raw.slice(0, 117)}...` : raw;
};

const formatJobType = (job) => String(job?.jobType || job?.workType || job?.employmentType || "Full-time");

const markLogoFailed = (event) => {
  event.currentTarget.closest("[data-fallback]")?.setAttribute("data-logo-failed", "true");
};

const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = searchParams.get("category") || "";
  const categoryLabel = searchParams.get("label") || "Tất cả việc làm";
  const query = searchParams.get("keyword") || searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const jobType = searchParams.get("jobType") || "";
  const experienceLevel = searchParams.get("experienceLevel") || "";
  const salaryMin = searchParams.get("salaryMin") || "";
  const salaryMax = searchParams.get("salaryMax") || "";
  const sort = searchParams.get("sort") || "latest";

  const updateFilter = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    if (name === "keyword") {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (searchParams.get("label")) next.set("label", searchParams.get("label"));
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const queryParams = new URLSearchParams();
        if (query) queryParams.set("keyword", query);
        if (category) queryParams.set("category", category);
        if (location) queryParams.set("location", location);
        if (jobType) queryParams.set("jobType", jobType);
        if (experienceLevel) queryParams.set("experienceLevel", experienceLevel);
        if (salaryMin) queryParams.set("salaryMin", salaryMin);
        if (salaryMax) queryParams.set("salaryMax", salaryMax);
        if (sort) queryParams.set("sort", sort);
        queryParams.set("size", "60");
        const suffix = queryParams.toString();
        const data = await apiRequest(`/api/jobs${suffix ? `?${suffix}` : ""}`, { skipAuth: true });
        if (!active) return;
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          setJobs([]);
          setError("Chưa kết nối được máy chủ, TTJobs đang hiển thị bố cục demo để bạn vẫn xem được trải nghiệm trang.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobs();
    return () => {
      active = false;
    };
  }, [category, experienceLevel, jobType, location, query, salaryMax, salaryMin, sort]);

  const sourceJobs = error ? demoJobs : jobs;
  const visibleJobs = useMemo(() => {
    const normalizedCategory = category.trim().toLowerCase();
    const normalizedQuery = normalizeText(query);
    const normalizedLocation = normalizeText(location);
    const normalizedJobType = normalizeText(jobType);
    const normalizedExperience = normalizeText(experienceLevel);

    return sourceJobs.filter((job) => {
      const matchesCategory = !normalizedCategory || String(job?.category || "").trim().toLowerCase() === normalizedCategory;
      const searchable = normalizeText(`${job?.title || ""} ${job?.companyName || ""} ${job?.description || ""}`);
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesLocation = !normalizedLocation || normalizeText(job?.location).includes(normalizedLocation);
      const matchesJobType = !normalizedJobType || normalizeText(job?.jobType).includes(normalizedJobType);
      const matchesExperience = !normalizedExperience || normalizeText(job?.experienceLevel).includes(normalizedExperience);
      return matchesCategory && matchesQuery && matchesLocation && matchesJobType && matchesExperience;
    });
  }, [category, experienceLevel, jobType, location, query, sourceJobs]);

  const hasActiveFilter = Boolean(category || query || location || jobType || experienceLevel || salaryMin || salaryMax || sort !== "latest");

  return (
    <div className="topcv-shell">
      <HomeHeader />
      <AnnouncementBar />
      <main className="jobs-list-page jobs-list-page-v2">
        <section className="jobs-list-hero">
          <div className="jobs-list-hero-copy">
            <Link to="/" className="jobs-list-back">← Về trang chủ</Link>
            <span className="jobs-list-eyebrow">Danh sách việc làm</span>
            <h1>{categoryLabel}</h1>
            <p>
              Lọc nhanh theo vị trí, công ty hoặc khu vực để tìm cơ hội phù hợp. Trang vẫn có trạng thái demo đẹp khi
              backend chưa sẵn sàng.
            </p>
          </div>
          <div className="jobs-list-hero-card">
            <strong>{loading ? "Đang tải" : visibleJobs.length.toLocaleString("vi-VN")}</strong>
            <span>việc làm phù hợp</span>
            <small>{error ? "Đang dùng dữ liệu demo giao diện" : "Dữ liệu tuyển dụng từ hệ thống"}</small>
          </div>
        </section>

        <section className="jobs-list-filter-card" aria-label="Bộ lọc việc làm">
          <label>
            Từ khóa
            <input
              value={query}
              onChange={(event) => updateFilter("keyword", event.target.value)}
              placeholder="Vị trí, công ty, kỹ năng..."
            />
          </label>
          <label>
            Khu vực
            <input
              value={location}
              onChange={(event) => updateFilter("location", event.target.value)}
              placeholder="Hà Nội, Đà Nẵng, Remote..."
            />
          </label>
          <label>
            Loại việc
            <select value={jobType} onChange={(event) => updateFilter("jobType", event.target.value)}>
              <option value="">Tất cả loại việc</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </label>
          <label>
            Kinh nghiệm
            <select value={experienceLevel} onChange={(event) => updateFilter("experienceLevel", event.target.value)}>
              <option value="">Tất cả cấp độ</option>
              <option value="ENTRY">Entry/Fresher</option>
              <option value="MID">Middle</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
            </select>
          </label>
          <label>
            Lương tối thiểu
            <input
              type="number"
              min="0"
              value={salaryMin}
              onChange={(event) => updateFilter("salaryMin", event.target.value)}
              placeholder="15000000"
            />
          </label>
          <label>
            Lương tối đa
            <input
              type="number"
              min="0"
              value={salaryMax}
              onChange={(event) => updateFilter("salaryMax", event.target.value)}
              placeholder="50000000"
            />
          </label>
          <label>
            Sắp xếp
            <select value={sort} onChange={(event) => updateFilter("sort", event.target.value)}>
              <option value="latest">Mới nhất</option>
              <option value="salary_high">Lương cao nhất</option>
              <option value="salary_low">Lương thấp nhất</option>
            </select>
          </label>
          <div className="jobs-list-filter-summary">
            <span>{category ? "Đang lọc theo ngành" : "Tất cả ngành nghề"}</span>
            <strong>{loading ? "Đang đồng bộ..." : `${visibleJobs.length.toLocaleString("vi-VN")} kết quả`}</strong>
            {hasActiveFilter ? (
              <button type="button" onClick={clearFilters}>Xóa lọc</button>
            ) : null}
          </div>
        </section>

        {error ? (
          <section className="jobs-list-notice" role="status">
            <div>
              <span className="notice-dot" />
              <strong>Backend chưa phản hồi</strong>
              <p>{error}</p>
            </div>
            <div className="jobs-list-notice-actions">
              <button type="button" onClick={() => window.location.reload()}>Thử lại</button>
              <Link to="/">Về trang chủ</Link>
            </div>
          </section>
        ) : null}

        <section className="jobs-list-results">
          <div className="jobs-list-results-head">
            <div>
              <h2>Cơ hội đang mở</h2>
              <p>{loading ? "TTJobs đang tải danh sách việc làm..." : `${visibleJobs.length.toLocaleString("vi-VN")} vị trí phù hợp với bộ lọc hiện tại.`}</p>
            </div>
            {hasActiveFilter ? <span className="jobs-list-active-filter">Bộ lọc đang bật</span> : null}
          </div>

          <div className="jobs-list-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <div className="jobs-list-skeleton" key={index} />)
            ) : null}
            {!loading && visibleJobs.length === 0 ? (
              <div className="jobs-list-empty-state">
                <span>Không tìm thấy việc làm phù hợp</span>
                <h3>Thử mở rộng từ khóa hoặc bỏ bớt bộ lọc</h3>
                <p>Danh sách có thể chưa có dữ liệu cho nhóm này. Bạn vẫn có thể quay lại trang chủ để xem các ngành đang tuyển nhiều.</p>
                <Link to="/">Xem gợi ý trên trang chủ</Link>
              </div>
            ) : null}
            {!loading
              ? visibleJobs.map((job) => (
                  <Link className="jobs-list-card" key={job.id ?? job.title} to={String(job.id || "").startsWith("demo-") ? "/" : `/jobs/${job.id}`}>
                    <div className="job-logo" data-fallback={(job.companyName || "C").trim().charAt(0).toUpperCase()}>
                      {job.companyLogoUrl ? (
                        <img src={job.companyLogoUrl} alt={job.companyName || "Logo"} onError={markLogoFailed} />
                      ) : (
                        <span>{(job.companyName || "C")[0]}</span>
                      )}
                    </div>
                    <div className="jobs-list-card-copy">
                      <div className="jobs-list-card-top">
                        <span>{formatJobType(job)}</span>
                      </div>
                      <h2>{job.title}</h2>
                      <p>{job.companyName || "Đang cập nhật"}</p>
                      <div className="job-meta">
                        <span>{formatSalary(job)}</span>
                        <span>{job.location || "Toàn quốc"}</span>
                      </div>
                      <small>{formatDescription(job)}</small>
                    </div>
                  </Link>
                ))
              : null}
          </div>
        </section>
      </main>
      <FloatingActions />
      <Footer />
    </div>
  );
};

export default JobsList;
