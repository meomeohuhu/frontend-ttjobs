import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";
import Footer from "../sections/Footer.jsx";

const FALLBACK_LOCATION_GROUPS = [
  {
    code: 1,
    province: "Hà Nội",
    districts: ["Ba Đình", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Nam Từ Liêm", "Thanh Xuân"]
  },
  {
    code: 79,
    province: "TP. Hồ Chí Minh",
    districts: ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Phú Nhuận", "Tân Bình"]
  },
  {
    code: 48,
    province: "Đà Nẵng",
    districts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"]
  },
  {
    code: 74,
    province: "Bình Dương",
    districts: ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát", "Tân Uyên"]
  }
];

const formatNumber = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "0";
  }
  return numberValue.toLocaleString("vi-VN");
};

const formatSalary = (job) => {
  if (!job) return "Thỏa thuận";
  const min = Number(job.salaryMin);
  const max = Number(job.salaryMax);
  const salary = Number(job.salary);
  const currency = job.currency || "VND";

  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0) {
    return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
  }
  if (Number.isFinite(salary) && salary > 0) {
    return `${formatNumber(salary)} ${currency}`;
  }
  return "Thỏa thuận";
};

const normalizeWebsite = (website) => {
  if (!website) return "";
  if (/^https?:\/\//i.test(website)) {
    return website;
  }
  return `https://${website}`;
};

const hasText = (value) => Boolean(String(value || "").trim());

const CompanyDetail = () => {
  const { id } = useParams();
  const locationPickerRef = useRef(null);
  const [company, setCompany] = useState(null);
  const [baseJobs, setBaseJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchTouched, setSearchTouched] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [jobKeyword, setJobKeyword] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [locationGroups, setLocationGroups] = useState(FALLBACK_LOCATION_GROUPS);

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=2");
        if (!response.ok) {
          throw new Error("Không tải được danh sách địa điểm");
        }

        const data = await response.json();
        const mapped = Array.isArray(data)
          ? data
              .map((item) => ({
                code: item?.code ?? null,
                province: item?.name || "",
                districts: Array.isArray(item?.districts)
                  ? item.districts.map((district) => district?.name || "").filter(Boolean)
                  : []
              }))
              .filter((item) => item.province)
          : [];

        if (active && mapped.length > 0) {
          setLocationGroups(mapped);
        }
      } catch {
        if (active) {
          setLocationGroups(FALLBACK_LOCATION_GROUPS);
        }
      }
    };

    loadLocations();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      setLoading(true);
      setError("");
      setSearchError("");
      setSearchTouched(false);
      setFollowError("");
      setIsFollowing(false);
      setFollowerCount(0);
      setJobKeyword("");
      setSelectedProvince("");
      setProvinceQuery("");
      setShowLocationPicker(false);

      try {
        const payload = await apiRequest(`/api/companies/${id}/public-page`, { skipAuth: true });
        if (!active) return;

        const companyData = payload?.company || null;
        const jobsData = Array.isArray(payload?.jobs) ? payload.jobs : [];

        setCompany(companyData);
        setBaseJobs(jobsData);
        setDisplayJobs(jobsData);
        setFollowerCount(Number(companyData?.followerCount || 0));
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải thông tin công ty");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCompany();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadFollowStatus = async () => {
      if (!company?.id) {
        return;
      }

      try {
        const status = await apiRequest(`/api/company-follows/${company.id}/status`);
        if (!active) return;
        setIsFollowing(Boolean(status?.followed));
        if (Number.isFinite(Number(status?.followerCount))) {
          setFollowerCount(Number(status.followerCount));
        }
      } catch {
        if (active) {
          setIsFollowing(false);
        }
      }
    };

    loadFollowStatus();

    return () => {
      active = false;
    };
  }, [company?.id]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (locationPickerRef.current && !locationPickerRef.current.contains(event.target)) {
        setShowLocationPicker(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const websiteUrl = useMemo(() => normalizeWebsite(company?.website), [company?.website]);
  const jobCount = Number(company?.jobCount || baseJobs.length || 0);
  const savedJobCount = Number(company?.savedJobCount || 0);
  const visibleJobCount = searchTouched ? displayJobs.length : jobCount;
  const heroPills = [
    hasText(company?.industry) ? company.industry : null,
    hasText(company?.website) ? company.website : null
  ].filter(Boolean);
  const displayFollowerCount = Number.isFinite(Number(followerCount)) ? Number(followerCount) : 0;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const filteredLocationGroups = useMemo(() => {
    const query = provinceQuery.trim().toLowerCase();
    if (!query) {
      return locationGroups;
    }
    return locationGroups.filter((group) => group.province.toLowerCase().includes(query));
  }, [locationGroups, provinceQuery]);

  const selectedLocationLabel = selectedProvince || "Tất cả tỉnh/thành phố";

  const handleProvinceSelect = useCallback((group) => {
    setSelectedProvince(group.province);
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedProvince("");
    setProvinceQuery("");
  }, []);

  const applyLocation = useCallback(() => {
    setShowLocationPicker(false);
  }, []);

  const runJobSearch = useCallback(
    async (event) => {
      event?.preventDefault?.();
      if (!company?.name) {
        return;
      }

      const query = new URLSearchParams();
      const trimmedKeyword = jobKeyword.trim();
      const location = selectedProvince;

      if (trimmedKeyword) {
        query.set("keyword", trimmedKeyword);
      }
      if (location) {
        query.set("location", location);
      }
      query.set("companyName", company.name);
      query.set("size", "100");

      setSearchLoading(true);
      setSearchError("");
      setSearchTouched(true);

      try {
        const data = await apiRequest(`/api/jobs/search?${query.toString()}`, { skipAuth: true });
        setDisplayJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setSearchError(err.message || "Không thể tìm kiếm");
      } finally {
        setSearchLoading(false);
      }
    },
    [company?.name, jobKeyword, selectedProvince]
  );

  const resetJobSearch = useCallback(() => {
    setJobKeyword("");
    clearLocation();
    setSearchError("");
    setSearchTouched(false);
    setDisplayJobs(baseJobs);
  }, [baseJobs, clearLocation]);

  const toggleFollowCompany = useCallback(async () => {
    if (!company?.id || followLoading) {
      return;
    }

    if (!localStorage.getItem("ttjobs_token")) {
      setFollowError("Bạn cần đăng nhập để theo dõi công ty.");
      return;
    }

    setFollowLoading(true);
    setFollowError("");

    try {
      const endpoint = isFollowing
        ? `/api/company-follows/${company.id}`
        : `/api/company-follows/${company.id}`;
      const response = await apiRequest(endpoint, {
        method: isFollowing ? "DELETE" : "POST"
      });

      if (Number.isFinite(Number(response?.followerCount))) {
        setFollowerCount(Number(response.followerCount));
      }
      setIsFollowing(Boolean(response?.followed));
    } catch (err) {
      setFollowError(err.message || "Không thể theo dõi công ty");
    } finally {
      setFollowLoading(false);
    }
  }, [company?.id, followLoading, isFollowing]);

  return (
    <div className="company-detail-shell">
      <HomeHeader />

      <div className="company-detail-container">
        {loading && <p className="company-state">Đang tải dữ liệu...</p>}
        {!loading && error && <p className="company-state error">{error}</p>}

        {!loading && !error && company && (
          <>
            <section className="company-hero">
              <div className="company-hero-cover" />
              <div className="company-hero-overlay" />

              <div className="company-hero-topcard">
                <div className="company-cover-visual">
                  <div className="company-cover-glass" />
                </div>
              </div>

              <div className="company-hero-main">
                <div className="company-hero-avatar">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name || "Logo"} />
                  ) : (
                    <span>{(company.name || "C")[0]}</span>
                  )}
                </div>

                <div className="company-hero-copy">
                  <div className="company-pro-chip">Công ty tiêu biểu</div>
                  <h1>{company.name}</h1>

                  {heroPills.length > 0 ? (
                    <div className="company-hero-pills">
                      {heroPills.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  ) : null}

                <div className="company-hero-meta">
                    {websiteUrl ? (
                      <a href={websiteUrl} target="_blank" rel="noreferrer" className="company-meta-item">
                        <span className="meta-icon globe" />
                        <span>{company.website}</span>
                      </a>
                    ) : null}
                    {jobCount > 0 ? (
                      <div className="company-meta-item">
                        <span className="meta-icon building" />
                        <span>{formatNumber(jobCount)}+ việc làm</span>
                      </div>
                    ) : null}
                    {savedJobCount > 0 ? (
                      <div className="company-meta-item">
                        <span className="meta-icon users" />
                        <span>{formatNumber(savedJobCount)} người theo dõi</span>
                      </div>
                    ) : null}
                  {displayFollowerCount > 0 ? (
                      <div className="company-meta-item">
                        <span className="meta-icon users" />
                        <span>{formatNumber(displayFollowerCount)} người theo dõi</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="company-hero-actions">
                  <button
                    type="button"
                    className={`company-follow-btn ${isFollowing ? "following" : ""}`}
                    onClick={toggleFollowCompany}
                    disabled={followLoading}
                  >
                    {followLoading ? "Đang xử lý..." : isFollowing ? "Đã theo dõi" : "+ Theo dõi công ty"}
                  </button>
                  <button
                    type="button"
                    className="company-jobs-btn"
                    onClick={() => document.getElementById("company-jobs")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Xem việc làm
                  </button>
                </div>
              </div>
            </section>

            {followError ? <p className="company-search-error">{followError}</p> : null}

            <section className="company-layout">
              <div className="company-layout-main">
                <article className="company-panel">
                  <header className="company-panel-header">
                    <h2>Giới thiệu công ty</h2>
                  </header>
                  <div className="company-panel-body">
                    {hasText(company.description) ? (
                      <div className="company-description">
                        {company.description.split("\n").map((line, index) => (
                          <p key={`${index}-${line}`}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="company-empty">Chưa có mô tả từ database.</p>
                    )}
                  </div>
                </article>

                <article className="company-panel" id="company-jobs">
                  <header className="company-panel-header company-panel-header-row">
                    <h2>Tuyển dụng</h2>
                    <span className="company-count-badge">{formatNumber(visibleJobCount)} tin</span>
                  </header>

                  <form className="company-jobs-toolbar" onSubmit={runJobSearch}>
                    <div className="company-search-box">
                      <span className="toolbar-icon search" />
                      <input
                        type="text"
                        placeholder="Tên công việc, vị trí ứng tuyển..."
                        value={jobKeyword}
                        onChange={(event) => setJobKeyword(event.target.value)}
                      />
                    </div>

                    <div className="company-location-wrap" ref={locationPickerRef}>
                      <button
                        type="button"
                        className="company-search-box location"
                        onClick={() => setShowLocationPicker((prev) => !prev)}
                      >
                        <span className="toolbar-icon location" />
                        <span>{selectedLocationLabel}</span>
                      </button>

                      {showLocationPicker ? (
                        <div className="company-location-picker">
                          <div className="company-location-picker-head">
                            <span>Tìm theo:</span>
                            <button type="button" className="company-location-mode active">
                              Tỉnh, thành phố
                            </button>
                          </div>

                          <div className="company-location-picker-search">
                            <span className="toolbar-icon search" />
                            <input
                              type="text"
                              placeholder="Nhập tỉnh/thành phố..."
                              value={provinceQuery}
                              onChange={(event) => setProvinceQuery(event.target.value)}
                            />
                          </div>

                          <div className="company-location-picker-body single-column">
                            <div className="company-province-list">
                              {filteredLocationGroups.map((group) => (
                                <button
                                  key={group.code || group.province}
                                  type="button"
                                  className={group.province === selectedProvince ? "active" : ""}
                                  onClick={() => handleProvinceSelect(group)}
                                >
                                  {group.province}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="company-location-picker-footer">
                            <button type="button" className="company-location-clear" onClick={resetJobSearch}>
                              Bỏ chọn tất cả
                            </button>
                            <button type="button" className="company-location-apply" onClick={applyLocation}>
                              Áp dụng
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button type="submit" className="company-search-button" disabled={searchLoading}>
                      <span className="toolbar-icon magnify" />
                      {searchLoading ? "Đang tìm" : "Tìm kiếm"}
                    </button>
                  </form>

                  {searchError ? <p className="company-search-error">{searchError}</p> : null}

                  <div className="company-jobs-list">
                    {displayJobs.length === 0 ? (
                      <p className="company-empty">Chưa có việc làm công khai cho công ty này.</p>
                    ) : (
                      displayJobs.map((job) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="company-job-card">
                          <div className="company-job-logo">
                            {job.companyLogoUrl ? (
                              <img src={job.companyLogoUrl} alt={job.companyName || "Logo"} />
                            ) : (
                              <span>{(job.companyName || "C")[0]}</span>
                            )}
                          </div>
                          <div className="company-job-body">
                            <div className="company-job-row">
                              <h3>{job.title}</h3>
                              <strong>{formatSalary(job)}</strong>
                            </div>
                            <div className="company-job-company">
                              <span>{job.companyName || company.name}</span>
                            </div>
                            <div className="company-job-meta">
                              <span>{job.location || "Toàn quốc"}</span>
                              <span>{formatNumber(job.savedCount || 0)} lượt lưu</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </article>
              </div>

              <aside className="company-layout-side">
                <article className="company-panel">
                  <header className="company-panel-header">
                    <h2>Thông tin liên hệ</h2>
                  </header>
                  <div className="company-contact-list">
                    {hasText(company.location) ? (
                      <div>
                        <span className="contact-label">Địa chỉ công ty</span>
                        <strong>{company.location}</strong>
                      </div>
                    ) : null}
                    {hasText(company.industry) ? (
                      <div>
                        <span className="contact-label">Ngành nghề</span>
                        <strong>{company.industry}</strong>
                      </div>
                    ) : null}
                    {websiteUrl ? (
                      <div>
                        <span className="contact-label">Website</span>
                        <a href={websiteUrl} target="_blank" rel="noreferrer">
                          {company.website}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </article>

                <article className="company-panel">
                  <header className="company-panel-header">
                    <h2>Chia sẻ công ty tới bạn bè</h2>
                  </header>
                  <div className="company-share-content">
                    <button
                      type="button"
                      className="company-copy-button"
                      onClick={async () => {
                        if (!shareUrl || !navigator?.clipboard?.writeText) return;
                        await navigator.clipboard.writeText(shareUrl);
                      }}
                    >
                      Sao chép đường dẫn
                    </button>
                    <div className="company-share-url">{shareUrl || window.location.href}</div>
                    <div className="company-share-socials">
                      <button type="button" aria-label="Facebook">
                        f
                      </button>
                      <button type="button" aria-label="Twitter">
                        t
                      </button>
                      <button type="button" aria-label="LinkedIn">
                        in
                      </button>
                    </div>
                  </div>
                </article>
              </aside>
            </section>
          </>
        )}
      </div>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default CompanyDetail;
