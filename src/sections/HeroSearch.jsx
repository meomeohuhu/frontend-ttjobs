import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const categories = [
  "DESIGN",
  "MARKETING",
  "HR",
  "INFORMATION-TECHNOLOGY",
  "SALES",
  "CUSTOMER-SERVICE"
];

const categoryLabels = {
  DESIGN: "Design",
  MARKETING: "Marketing",
  HR: "HR",
  "INFORMATION-TECHNOLOGY": "IT",
  SALES: "Sales",
  "CUSTOMER-SERVICE": "CSKH"
};

const fallbackLocationGroups = [
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
    code: 74,
    province: "Bình Dương",
    districts: ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát", "Tân Uyên"]
  },
  {
    code: 48,
    province: "Đà Nẵng",
    districts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"]
  }
];

const formatCategory = (value) =>
  categoryLabels[value] ||
  value
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCount = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return "";
  }
  return numberValue.toLocaleString("vi-VN");
};

const HeroSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [locationGroups, setLocationGroups] = useState(fallbackLocationGroups);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openJobsCount, setOpenJobsCount] = useState("60.000+");
  const [employerCount, setEmployerCount] = useState("1.800+");
  const [hotPositions, setHotPositions] = useState([
    { title: "Java Backend Developer", count: 18 },
    { title: "Sales Executive", count: 14 },
    { title: "UI/UX Designer", count: 11 }
  ]);
  const [activeHotIndex, setActiveHotIndex] = useState(0);
  const searchFormRef = useRef(null);
  const searchResultsRef = useRef(null);

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
          setLocationGroups(fallbackLocationGroups);
        }
      }
    };

    const loadHeroStats = async () => {
      try {
        const [jobsResult, companiesResult] = await Promise.allSettled([
          apiRequest("/api/jobs", { skipAuth: true }),
          apiRequest("/api/companies", { skipAuth: true })
        ]);

        if (!active) return;

        if (jobsResult.status === "fulfilled" && Array.isArray(jobsResult.value)) {
          const openJobs = jobsResult.value.filter((job) => (job?.status || "").toLowerCase() === "open");
          setOpenJobsCount(formatCount(openJobs.length) || "60.000+");

          const rankedPositions = [...jobsResult.value]
            .sort((left, right) => Number(right?.savedCount || 0) - Number(left?.savedCount || 0))
            .filter((job) => job?.title)
            .slice(0, 3)
            .map((job) => ({ title: job.title, count: Number(job.savedCount || 0) }));

          if (rankedPositions.length > 0) {
            setHotPositions(rankedPositions);
          }
        }

        if (companiesResult.status === "fulfilled" && Array.isArray(companiesResult.value)) {
          setEmployerCount(formatCount(companiesResult.value.length) || "1.800+");
        }
      } catch {
        // Keep fallback stats.
      }
    };

    loadLocations();
    loadHeroStats();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hotPositions.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveHotIndex((currentIndex) => (currentIndex + 1) % hotPositions.length);
    }, 4500);
    return () => window.clearInterval(intervalId);
  }, [hotPositions.length]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const formElement = searchFormRef.current;
      if (formElement && !formElement.contains(event.target)) {
        setShowCategories(false);
        setShowLocationPicker(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const filteredLocationGroups = useMemo(() => {
    const query = provinceQuery.trim().toLowerCase();
    if (!query) return locationGroups;
    return locationGroups.filter((group) => group.province.toLowerCase().includes(query));
  }, [locationGroups, provinceQuery]);

  const selectedLocationLabel = selectedDistrict
    ? `${selectedDistrict}, ${selectedProvince}`
    : selectedProvince || "Địa điểm";

  const selectedProvinceEntry = useMemo(() => {
    if (!selectedProvinceCode) return null;
    return locationGroups.find((group) => group.code === selectedProvinceCode) || null;
  }, [locationGroups, selectedProvinceCode]);

  const hotSlides = hotPositions.length > 0 ? hotPositions : [{ title: "Java Backend Developer", count: 18 }];
  const activeHotSlide = hotSlides[activeHotIndex] || hotSlides[0];
  const activeHotCount = activeHotSlide?.count || hotSlides[0]?.count || 0;
  const resultSummary = useMemo(() => {
    if (results.length === 0) return "";
    const parts = [];
    if (keyword.trim()) parts.push(`từ khóa "${keyword.trim()}"`);
    if (activeCategory) parts.push(`ngành ${formatCategory(activeCategory)}`);
    if (selectedDistrict || selectedProvince) parts.push(`khu vực ${selectedDistrict || selectedProvince}`);
    return parts.length > 0 ? `Gợi ý theo ${parts.join(", ")}.` : "Gợi ý nhanh từ dữ liệu tuyển dụng mới nhất.";
  }, [results.length, keyword, activeCategory, selectedDistrict, selectedProvince]);

  const goToHotSlide = (nextIndex) => {
    const total = hotSlides.length;
    if (total === 0) return;
    setActiveHotIndex(((nextIndex % total) + total) % total);
  };

  const runSearch = async (payload = {}, options = {}) => {
    const { scrollToResults = false } = options;
    const finalKeyword = payload.keyword ?? keyword;
    const finalCategory = payload.category ?? activeCategory;
    const finalLocation = payload.location ?? (selectedDistrict || selectedProvince);

    const query = new URLSearchParams();
    if (finalKeyword) query.set("keyword", finalKeyword);
    if (finalLocation) query.set("location", finalLocation);
    if (!finalKeyword && finalCategory) query.set("keyword", finalCategory);

    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/jobs/search?${query.toString()}`, { skipAuth: true });
      setResults(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (err) {
      setError(err.message || "Không thể tìm kiếm lúc này.");
    } finally {
      setLoading(false);
      if (scrollToResults) {
        window.requestAnimationFrame(() => {
          searchResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowCategories(false);
    setShowLocationPicker(false);
    runSearch({}, { scrollToResults: true });
  };

  const handleCategoryClick = (value) => {
    setActiveCategory(value);
    runSearch({ keyword: "", category: value }, { scrollToResults: true });
  };

  const handleProvinceSelect = (group) => {
    setSelectedProvince(group.province);
    setSelectedProvinceCode(group.code);
    setSelectedDistrict("");
  };

  const applyLocation = () => {
    setShowLocationPicker(false);
    if (selectedDistrict || selectedProvince) {
      runSearch({ location: selectedDistrict || selectedProvince }, { scrollToResults: true });
    }
  };

  const clearLocation = () => {
    setSelectedProvinceCode(null);
    setSelectedProvince("");
    setSelectedDistrict("");
    setProvinceQuery("");
  };

  return (
    <section className="hero-search">
      <div className="hero-background">
        <div className="hero-content hero-layout">
          <div className="hero-copy">
            <span className="hero-kicker">TTJobs Match Engine</span>
            <h1>Tìm đúng việc và đúng cơ hội để đi nhanh hơn.</h1>
            <p>
              Bắt đầu với bộ lọc gọn, dữ liệu tuyển dụng thật và các gợi ý đủ sát để bạn chọn nhanh những cơ hội đáng mở tiếp.
            </p>

            <form ref={searchFormRef} className="search-bar" onSubmit={handleSubmit}>
              <div className="search-pill-wrap">
                <button type="button" className="search-pill" onClick={() => setShowCategories((prev) => !prev)}>
                  <span className="search-icon menu" />
                  {activeCategory ? formatCategory(activeCategory) : "Danh mục nghề"}
                  <span className="caret" />
                </button>
                {showCategories ? (
                  <div className="search-category-menu">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={item === activeCategory ? "active" : ""}
                        onClick={() => {
                          handleCategoryClick(item);
                          setShowCategories(false);
                        }}
                      >
                        {formatCategory(item)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <input
                type="text"
                placeholder="Vị trí tuyển dụng, tên công ty"
                aria-label="Tìm kiếm vị trí tuyển dụng"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />

              <div className="search-location-wrap">
                <button type="button" className="search-location-toggle" onClick={() => setShowLocationPicker((prev) => !prev)}>
                  <span className="search-icon pin" />
                  <span className="search-location-label">{selectedLocationLabel}</span>
                  <span className="caret" />
                </button>

                {showLocationPicker ? (
                  <div className="location-picker">
                    <div className="location-picker-head">
                      <span>Tìm theo:</span>
                      <button type="button" className="location-mode active">Tỉnh, quận/huyện</button>
                    </div>

                    <div className="location-picker-search">
                      <span className="search-icon menu" />
                      <input
                        type="text"
                        placeholder="Nhập tỉnh/thành phố"
                        value={provinceQuery}
                        onChange={(event) => setProvinceQuery(event.target.value)}
                      />
                    </div>

                    <div className="location-picker-body">
                      <div className="province-list">
                        {filteredLocationGroups.map((group) => (
                          <button
                            key={group.province}
                            type="button"
                            className={group.province === selectedProvince ? "active" : ""}
                            onClick={() => handleProvinceSelect(group)}
                          >
                            {group.province}
                          </button>
                        ))}
                      </div>

                      <div className="district-list">
                        {selectedProvinceEntry ? (
                          <>
                            <div className="district-list-head">
                              <strong>{selectedProvince}</strong>
                              <span>Quận/huyện</span>
                            </div>
                            <div className="district-chips">
                              {selectedProvinceEntry.districts.map((district) => (
                                <button
                                  key={district}
                                  type="button"
                                  className={district === selectedDistrict ? "active" : ""}
                                  onClick={() => setSelectedDistrict(district)}
                                >
                                  {district}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="district-empty">
                            <div className="district-empty-illustration" />
                            <p>Vui lòng chọn tỉnh/thành phố trước khi áp dụng bộ lọc.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="location-picker-footer">
                      <button type="button" className="location-clear" onClick={clearLocation}>Bỏ chọn tất cả</button>
                      <button type="button" className="location-apply" onClick={applyLocation}>Áp dụng</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <button type="submit" className="search-btn" disabled={loading}>
                <span className="search-icon magnify" />
                {loading ? "Đang tìm..." : "Tìm việc"}
              </button>
            </form>

            <div className="hero-chips">
              {categories.slice(0, 4).map((item) => (
                <button key={item} type="button" className="hero-chip" onClick={() => handleCategoryClick(item)}>
                  {formatCategory(item)}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-stat-card">
              <div><span>Việc làm đang mở</span><strong>{openJobsCount}</strong></div>
              <div><span>Nhà tuyển dụng</span><strong>{employerCount}</strong></div>
              <div><span>Lượt lưu nổi bật</span><strong>{activeHotCount}+</strong></div>
            </div>

            <div className="hero-spotlight">
              <div className="carousel-badge">Nhóm việc đang được quan tâm</div>
              <div className="hot-slider">
                <button type="button" className="hot-slider-arrow hero-card-arrow" onClick={() => goToHotSlide(activeHotIndex - 1)} aria-label="Vị trí trước">
                  <span />
                </button>

                <div className="hot-slider-viewport">
                  <button
                    type="button"
                    className="hot-slide hot-slide-button hero-suggestion-card hero-insight-card"
                    key={`${activeHotSlide.title}-${activeHotIndex}`}
                    onClick={() => {
                      setKeyword(activeHotSlide.title);
                      setActiveCategory("");
                      runSearch({ keyword: activeHotSlide.title }, { scrollToResults: true });
                    }}
                    aria-label={`Tìm việc cho nhóm vị trí ${activeHotSlide.title}`}
                  >
                    <p className="hero-suggestion-eyebrow">Từ dữ liệu lưu việc làm thực tế</p>
                    <h3 className="hero-suggestion-title hero-insight-title">{activeHotSlide.title}</h3>
                    <span className="hero-suggestion-meta">{activeHotSlide.count} lượt lưu gần đây</span>
                  </button>
                </div>

                <button type="button" className="hot-slider-arrow hero-card-arrow" onClick={() => goToHotSlide(activeHotIndex + 1)} aria-label="Vị trí sau">
                  <span />
                </button>
              </div>

              <div className="hot-slider-dots" aria-label="Chỉ báo vị trí hot">
                {hotSlides.map((item, index) => (
                  <button
                    key={`${item.title}-dot-${index}`}
                    type="button"
                    className={index === activeHotIndex ? "active" : ""}
                    onClick={() => goToHotSlide(index)}
                    aria-label={`Chuyển tới ${item.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {error ? <p className="search-error">{error}</p> : null}

        {results.length > 0 ? (
          <div className="search-results" ref={searchResultsRef}>
            <div className="results-head">
              <div>
                <strong>Gợi ý phù hợp để bạn mở tiếp</strong>
                <p>{resultSummary}</p>
              </div>
              <span>{results.length} việc làm</span>
            </div>
            {results.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="result-item">
                <div>
                  <h4>{job.title}</h4>
                  <p>{job.companyName || "Đang cập nhật"}</p>
                </div>
                <span>{job.location || "Toàn quốc"}</span>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="hero-footer-note">Gợi ý theo kỹ năng, vị trí và khu vực để bạn lọc nhanh hơn mà không phải mở quá nhiều trang.</div>
      </div>
    </section>
  );
};

export default HeroSearch;
