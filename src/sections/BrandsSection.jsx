import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const tabs = ["Tất cả", "Sản phẩm", "Marketing", "Sales", "IT - Phần mềm", "Tài chính", "Sản xuất", "Dịch vụ"];

const fallbackBrands = [
  {
    id: "demo-company-tech",
    name: "TTJobs Demo Company",
    logoUrl: "",
    industry: "IT - Phần mềm",
    location: "Hà Nội",
    jobCount: 12,
    savedJobCount: 86
  },
  {
    id: "demo-company-growth",
    name: "Growth Lab",
    logoUrl: "",
    industry: "Sales",
    location: "TP. Hồ Chí Minh",
    jobCount: 8,
    savedJobCount: 42
  },
  {
    id: "demo-company-people",
    name: "People Studio",
    logoUrl: "",
    industry: "Dịch vụ",
    location: "Đà Nẵng",
    jobCount: 5,
    savedJobCount: 31
  }
];

const formatJobs = (count) => `${Number(count || 0).toLocaleString("vi-VN")} việc làm`;
const formatSaved = (count) => `${Number(count || 0).toLocaleString("vi-VN")} lượt lưu`;

const normalizeText = (value) => String(value || "").toLowerCase();
const isGeneratedName = (value) => /^company-\d+/i.test(String(value || "").trim());

const sanitizeIndustry = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.toLowerCase() === "doanh nghiệp") {
    return "Đang cập nhật lĩnh vực";
  }
  return normalized;
};

const markLogoFailed = (event) => {
  event.currentTarget.closest("[data-fallback]")?.setAttribute("data-logo-failed", "true");
};

const normalizeCompany = (company) => {
  const name = company?.name || company?.companyName || "";
  const safeName = String(name).trim();
  const displayName = !safeName || isGeneratedName(safeName) ? "Doanh nghiệp đang cập nhật" : safeName;

  return {
    id: company?.id || company?.companyId,
    name: displayName,
    logoUrl: company?.logoUrl || company?.companyLogoUrl || "",
    industry: sanitizeIndustry(company?.industry || company?.category),
    location: company?.location || "",
    jobCount: Number(company?.jobCount ?? company?.openJobCount ?? 0),
    savedJobCount: Number(company?.savedJobCount ?? company?.savedCount ?? 0)
  };
};

const filterBrandsByTab = (brands, activeTab) => {
  if (activeTab === "Tất cả") return brands;
  const normalizedTab = normalizeText(activeTab);
  return brands.filter((brand) => normalizeText(brand.industry).includes(normalizedTab));
};

const BrandsSection = () => {
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadBrands = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/api/companies/top-saved-jobs?limit=12", { skipAuth: true });
        if (!active) return;

        const normalized = Array.isArray(data)
          ? data.map(normalizeCompany).filter((company) => company.id && company.name)
          : [];

        setBrands(normalized);
      } catch (err) {
        if (active) {
          setBrands([]);
          setError(err.message || "Không thể tải dữ liệu công ty.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBrands();
    return () => {
      active = false;
    };
  }, []);

  const displayBrands = error && brands.length === 0 ? fallbackBrands : brands;
  const visibleBrands = useMemo(() => filterBrandsByTab(displayBrands, activeTab), [displayBrands, activeTab]);
  const featuredBrand = useMemo(() => visibleBrands[0] || displayBrands[0] || null, [displayBrands, visibleBrands]);
  const sideBrands = useMemo(() => visibleBrands.slice(0, 6), [visibleBrands]);
  const isDemoMode = error && brands.length === 0;

  return (
    <section className="brands-section company-section">
      <div className="brands-hero">
        <div>
          <h2>Thương hiệu tuyển dụng nổi bật</h2>
          <p>Những công ty có việc làm được lưu nhiều và đang nhận được mức quan tâm cao trên TTJobs.</p>
        </div>
        <span className="pro-pill">Dữ liệu tuyển dụng thật</span>
      </div>

      <div className="brand-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab ${tab === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="brands-grid">
        {featuredBrand ? (
          <Link to={String(featuredBrand.id).startsWith("demo-") ? "/jobs" : `/companies/${featuredBrand.id}`} className="brand-feature brand-feature-link company-main-card">
            <div className="feature-logo" data-fallback={featuredBrand.name?.trim().charAt(0)?.toUpperCase() || "C"}>
              {featuredBrand.logoUrl ? (
                <img src={featuredBrand.logoUrl} alt={featuredBrand.name} onError={markLogoFailed} />
              ) : (
                <span>{featuredBrand.name?.trim().charAt(0)?.toUpperCase() || "C"}</span>
              )}
            </div>
            <h3>{featuredBrand.name}</h3>
            <p>{featuredBrand.industry}</p>
            <div className="brand-stat-row">
              <span>{formatJobs(featuredBrand.jobCount)}</span>
              <span>{formatSaved(featuredBrand.savedJobCount)}</span>
            </div>
            <span className="brand-action">{isDemoMode ? "Xem việc làm mẫu" : "Xem trang công ty"}</span>
          </Link>
        ) : (
          <div className="brand-feature brand-feature-link company-main-card">
            <div className="feature-logo"><span>C</span></div>
            <h3>{loading ? "Đang tải công ty..." : "Chưa có dữ liệu công ty"}</h3>
            <p>Doanh nghiệp</p>
            <div className="brand-stat-row">
              <span>0 việc làm</span>
              <span>0 lượt lưu</span>
            </div>
            <span className="brand-action">Xem trang công ty</span>
          </div>
        )}

        <div className="brand-cards">
          {loading ? (
            <div className="brand-empty-state">Đang tải thương hiệu tuyển dụng nổi bật...</div>
          ) : isDemoMode ? (
            <>
              <div className="brand-empty-state brand-demo-state">
                <strong>Đang dùng dữ liệu demo</strong>
                <span>Máy chủ chưa phản hồi, section vẫn giữ bố cục để demo không bị trống.</span>
              </div>
              {sideBrands.map((brand) => (
                <Link key={brand.id} className="brand-card brand-card-link" to="/jobs">
                  <div className="brand-logo" data-fallback={brand.name?.trim().charAt(0)?.toUpperCase() || "C"}>
                    <span>{brand.name.charAt(0)}</span>
                  </div>
                  <div className="brand-card-copy">
                    <h4>{brand.name}</h4>
                    <p>{brand.industry}</p>
                    <span className="jobs-count jobs-badge">{formatJobs(brand.jobCount)}</span>
                  </div>
                </Link>
              ))}
            </>
          ) : error ? (
            <div className="brand-empty-state">{error}</div>
          ) : sideBrands.length === 0 ? (
            <div className="brand-empty-state">Chưa có dữ liệu công ty phù hợp với nhóm ngành này.</div>
          ) : (
            sideBrands.map((brand) => (
              <Link key={brand.id} className="brand-card brand-card-link" to={`/companies/${brand.id}`}>
                <div className="brand-logo" data-fallback={brand.name?.trim().charAt(0)?.toUpperCase() || "C"}>
                  {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} onError={markLogoFailed} /> : <span>{brand.name.charAt(0)}</span>}
                </div>
                <div className="brand-card-copy">
                  <h4>{brand.name}</h4>
                  <p>{brand.industry}</p>
                  <span className="jobs-count jobs-badge">{formatJobs(brand.jobCount)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
