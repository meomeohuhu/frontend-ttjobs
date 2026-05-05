import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { fallbackJobMetadata, loadJobMetadata, mergeCategoryStats } from "../lib/jobMetadata.js";

const PAGE_SIZE = 8;
const fallbackCategories = mergeCategoryStats(fallbackJobMetadata.categories, []);

const iconMap = {
  SALES: "tag",
  MARKETING: "marketing",
  "CUSTOMER-SERVICE": "support",
  HR: "briefcase",
  "INFORMATION-TECHNOLOGY": "laptop",
  FINANCE: "bank",
  "REAL-ESTATE": "building",
  ACCOUNTING: "calculator"
};

const formatCount = (value) => Number(value || 0).toLocaleString("vi-VN");

const CategoryIcon = ({ type }) => {
  const icon = iconMap[type] || "briefcase";
  return (
    <span className={`top-category-icon ${icon}`} aria-hidden="true">
      <span />
    </span>
  );
};

const TopCategoriesSection = () => {
  const [categories, setCategories] = useState(fallbackCategories);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      setLoading(true);
      try {
        const [metadata, data] = await Promise.all([
          loadJobMetadata(),
          apiRequest("/api/jobs/categories/top?size=16", { skipAuth: true })
        ]);
        if (!active) return;
        setCategories(mergeCategoryStats(metadata.categories, data));
      } catch {
        if (active) setCategories(fallbackCategories);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  const pages = useMemo(() => {
    const chunks = [];
    for (let index = 0; index < categories.length; index += PAGE_SIZE) {
      chunks.push(categories.slice(index, index + PAGE_SIZE));
    }
    return chunks.length > 0 ? chunks : [fallbackCategories];
  }, [categories]);

  const currentPage = pages[page] || pages[0] || [];
  const canSlide = pages.length > 1;

  const goToPage = (direction) => {
    if (!canSlide) return;
    setPage((current) => (current + direction + pages.length) % pages.length);
  };

  return (
    <section className="section top-categories-section">
      <div className="top-categories-head">
        <div>
          <h2>Ngành nghề đang tuyển nhiều</h2>
          <p>Nhóm ngành có số lượng việc làm mở cao để bạn mở rộng lựa chọn nhanh hơn.</p>
        </div>
        <div className="section-arrows">
          <button type="button" onClick={() => goToPage(-1)} disabled={!canSlide} aria-label="Nhóm ngành trước">
            <span />
          </button>
          <button type="button" onClick={() => goToPage(1)} disabled={!canSlide} aria-label="Nhóm ngành sau">
            <span />
          </button>
        </div>
      </div>

      {loading ? <div className="brand-empty-state top-category-state">Đang tải nhóm ngành nổi bật...</div> : null}
      {!loading && currentPage.length === 0 ? (
        <div className="brand-empty-state top-category-state">Chưa có dữ liệu ngành nghề để hiển thị.</div>
      ) : null}

      {!loading && currentPage.length > 0 ? (
        <div className="top-categories-grid">
          {currentPage.map((item) => (
            <Link
              className="top-category-card top-category-link"
              key={item.category}
              to={`/jobs?category=${encodeURIComponent(item.category)}&label=${encodeURIComponent(item.label)}`}
            >
              <CategoryIcon type={item.category} />
              <h3>{item.label}</h3>
              <p data-zero={Number(item.jobCount || 0) === 0 ? "true" : "false"}>
                {formatCount(item.jobCount)} việc làm
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default TopCategoriesSection;
