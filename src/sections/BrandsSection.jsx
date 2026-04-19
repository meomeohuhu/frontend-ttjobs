import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const tabs = [
  "Tất cả",
  "Sản phẩm",
  "Marketing",
  "Sales",
  "IT - Phần mềm",
  "Tài chính",
  "Sản xuất",
  "Dịch vụ"
];

const formatJobs = (count) => `${Number(count || 0).toLocaleString("vi-VN")} việc làm`;
const formatSaved = (count) => `${Number(count || 0).toLocaleString("vi-VN")} lượt lưu`;

const normalizeCompany = (company) => ({
  id: company?.id,
  name: (company?.name || "").trim(),
  logoUrl: company?.logoUrl || "",
  industry: company?.industry || "Doanh nghiệp",
  location: company?.location || "",
  jobCount: Number(company?.jobCount || 0),
  savedJobCount: Number(company?.savedJobCount || 0)
});

const BrandsSection = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let active = true;

    const loadBrands = async () => {
      try {
        const data = await apiRequest("/api/companies/top-saved-jobs?limit=6");
        if (!active) {
          return;
        }

        const normalized = Array.isArray(data)
          ? data.map(normalizeCompany).filter((company) => company.id && company.name)
          : [];

        setBrands(normalized);
      } catch {
        if (active) {
          setBrands([]);
        }
      }
    };

    loadBrands();

    return () => {
      active = false;
    };
  }, []);

  const featuredBrand = useMemo(() => brands[0] || null, [brands]);

  return (
    <section className="brands-section">
      <div className="brands-hero">
        <div>
          <h2>Thương hiệu đang tuyển nổi bật</h2>
          <p>Những công ty có lượt lưu việc làm cao nhất từ dữ liệu thực tế</p>
        </div>
      </div>

      <div className="brand-tabs">
        {tabs.map((tab, index) => (
          <button key={tab} type="button" className={`tab ${index === 0 ? "active" : ""}`}>
            {tab}
          </button>
        ))}
        <div className="nav-circles">
          <button type="button" aria-label="Trước">
            <span />
          </button>
          <button type="button" aria-label="Sau">
            <span />
          </button>
        </div>
      </div>

      <div className="brands-grid">
        {featuredBrand ? (
          <Link to={`/companies/${featuredBrand.id}`} className="brand-feature brand-feature-link">
            <div className="feature-logo">
              {featuredBrand.logoUrl ? (
                <img src={featuredBrand.logoUrl} alt={featuredBrand.name} />
              ) : (
                <span>{featuredBrand.name?.trim().charAt(0)?.toUpperCase() || "C"}</span>
              )}
            </div>
            <h3>{featuredBrand.name}</h3>
            <p>{featuredBrand.industry || "Doanh nghiệp"}</p>
            <div className="brand-stat-row">
              <span>{formatJobs(featuredBrand.jobCount)}</span>
              <span>{formatSaved(featuredBrand.savedJobCount)}</span>
            </div>
            <span className="brand-action">Xem công ty</span>
          </Link>
        ) : (
          <div className="brand-feature brand-feature-link">
            <div className="feature-logo">
              <span>C</span>
            </div>
            <h3>Chưa có dữ liệu công ty</h3>
            <p>Doanh nghiệp</p>
            <div className="brand-stat-row">
              <span>0 việc làm</span>
              <span>0 lượt lưu</span>
            </div>
            <span className="brand-action">Xem công ty</span>
          </div>
        )}

        <div className="brand-cards">
          {brands.length === 0 ? (
            <div className="brand-empty-state">Chưa có dữ liệu công ty nổi bật từ database.</div>
          ) : (
            brands.map((brand) => (
              <Link key={brand.id} className="brand-card brand-card-link" to={`/companies/${brand.id}`}>
                <div className="brand-logo">
                  {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} /> : null}
                </div>
                <div>
                  <h4>{brand.name}</h4>
                  <p>{brand.industry}</p>
                  <span className="jobs-count">{formatJobs(brand.jobCount)}</span>
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
