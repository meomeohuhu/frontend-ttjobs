import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { fallbackJobMetadata, getOptionLabel, loadJobMetadata, loadProvinceGroups } from "../lib/jobMetadata.js";

const formatCount = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return "";
  return numberValue.toLocaleString("vi-VN");
};

const buildJobsUrl = ({ keyword, category, location }) => {
  const query = new URLSearchParams();
  if (keyword?.trim()) query.set("keyword", keyword.trim());
  if (category?.trim()) query.set("category", category.trim());
  if (location?.trim()) query.set("location", location.trim());
  return query.toString() ? `/jobs?${query.toString()}` : "/jobs";
};

const HeroSearch = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState(fallbackJobMetadata);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [locationGroups, setLocationGroups] = useState(fallbackJobMetadata.locationsFallback);
  const [openJobsCount, setOpenJobsCount] = useState("60.000+");
  const [employerCount, setEmployerCount] = useState("1.800+");
  const [hotPositions, setHotPositions] = useState([
    { title: "Java Backend Developer", count: 18 },
    { title: "Sales Executive", count: 14 },
    { title: "UI/UX Designer", count: 11 }
  ]);
  const [activeHotIndex, setActiveHotIndex] = useState(0);
  const searchFormRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadMetadataAndLocations = async () => {
      const nextMetadata = await loadJobMetadata();
      if (!active) return;
      setMetadata(nextMetadata);
      setLocationGroups(await loadProvinceGroups(nextMetadata.locationsFallback));
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

          if (rankedPositions.length > 0) setHotPositions(rankedPositions);
        }

        if (companiesResult.status === "fulfilled" && Array.isArray(companiesResult.value)) {
          setEmployerCount(formatCount(companiesResult.value.length) || "1.800+");
        }
      } catch {
        // Keep fallback stats for demo resilience.
      }
    };

    loadMetadataAndLocations();
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

  const selectedProvinceEntry = useMemo(() => {
    if (!selectedProvinceCode) return null;
    return locationGroups.find((group) => group.code === selectedProvinceCode) || null;
  }, [locationGroups, selectedProvinceCode]);

  const selectedLocationLabel = selectedDistrict
    ? `${selectedDistrict}, ${selectedProvince}`
    : selectedProvince || "Địa điểm";

  const hotSlides = hotPositions.length > 0 ? hotPositions : [{ title: "Java Backend Developer", count: 18 }];
  const activeHotSlide = hotSlides[activeHotIndex] || hotSlides[0];
  const activeHotCount = activeHotSlide?.count || hotSlides[0]?.count || 0;

  const goToHotSlide = (nextIndex) => {
    const total = hotSlides.length;
    if (total === 0) return;
    setActiveHotIndex(((nextIndex % total) + total) % total);
  };

  const goToJobs = (overrides = {}) => {
    const finalKeyword = overrides.keyword ?? keyword;
    const finalCategory = overrides.category ?? activeCategory;
    const finalLocation = overrides.location ?? (selectedDistrict || selectedProvince);
    navigate(buildJobsUrl({ keyword: finalKeyword, category: finalCategory, location: finalLocation }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowCategories(false);
    setShowLocationPicker(false);
    goToJobs();
  };

  const handleCategoryClick = (value) => {
    setActiveCategory(value);
    setShowCategories(false);
    goToJobs({ keyword: "", category: value });
  };

  const handleProvinceSelect = (group) => {
    setSelectedProvince(group.province);
    setSelectedProvinceCode(group.code);
    setSelectedDistrict("");
  };

  const applyLocation = () => {
    setShowLocationPicker(false);
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
                  {activeCategory ? getOptionLabel(metadata.categories, activeCategory) : "Danh mục nghề"}
                  <span className="caret" />
                </button>
                {showCategories ? (
                  <div className="search-category-menu">
                    {metadata.categories.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={item.value === activeCategory ? "active" : ""}
                        onClick={() => handleCategoryClick(item.value)}
                      >
                        {item.label}
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

              <button type="submit" className="search-btn">
                <span className="search-icon magnify" />
                Tìm việc
              </button>
            </form>

            <div className="hero-chips">
              {metadata.categories.slice(0, 4).map((item) => (
                <button key={item.value} type="button" className="hero-chip" onClick={() => handleCategoryClick(item.value)}>
                  {item.label}
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
                      goToJobs({ keyword: activeHotSlide.title, category: "" });
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

        <div className="hero-footer-note">Gợi ý theo kỹ năng, vị trí và khu vực để bạn lọc nhanh hơn mà không phải mở quá nhiều trang.</div>
      </div>
    </section>
  );
};

export default HeroSearch;
