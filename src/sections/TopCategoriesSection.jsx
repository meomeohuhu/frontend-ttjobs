import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const PAGE_SIZE = 8;

const fallbackCategories = [
  { category: "SALES", label: "Kinh doanh - Bán hàng", jobCount: 0 },
  { category: "MARKETING", label: "Marketing - PR - Quảng cáo", jobCount: 0 },
  { category: "CUSTOMER-SERVICE", label: "Chăm sóc khách hàng", jobCount: 0 },
  { category: "HR", label: "Nhân sự - Hành chính", jobCount: 0 },
  { category: "INFORMATION-TECHNOLOGY", label: "Công nghệ thông tin", jobCount: 0 },
  { category: "FINANCE", label: "Tài chính - Ngân hàng", jobCount: 0 },
  { category: "REAL-ESTATE", label: "Bất động sản", jobCount: 0 },
  { category: "ACCOUNTING", label: "Kế toán - Kiểm toán - Thuế", jobCount: 0 }
];

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

const mergeWithFallback = (items) => {
  const byCategory = new Map();
  items.forEach((item) => {
    if (item?.category) {
      byCategory.set(item.category, item);
    }
  });

  const merged = fallbackCategories.map((item) => byCategory.get(item.category) || item);
  items.forEach((item) => {
    if (item?.category && !fallbackCategories.some((fallback) => fallback.category === item.category)) {
      merged.push(item);
    }
  });
  return merged;
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
        const data = await apiRequest("/api/jobs/categories/top?size=16", { skipAuth: true });
        if (!active) return;
        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              category: item.category || "OTHER",
              label: item.label || "Ngành nghề khác",
              jobCount: Number(item.jobCount || 0)
            }))
          : [];
        setCategories(mergeWithFallback(normalized));
      } catch {
        if (active) {
          setCategories(fallbackCategories);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const visibleCategories = useMemo(() => {
    const safePage = Math.min(page, pageCount - 1);
    return categories.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  }, [categories, page, pageCount]);

  return (
    <section className="top-categories-section">
      <div className="top-categories-head">
        <div>
          <h2>Ngành nghề đang tuyển nhiều</h2>
          <p>Nhóm ngành có số lượng việc làm mở cao để bạn mở rộng lựa chọn nhanh hơn.</p>
        </div>
        <div className="nav-circles">
          <button
            type="button"
            aria-label="Trước"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            <span />
          </button>
          <button
            type="button"
            aria-label="Sau"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((current) => Math.min(current + 1, pageCount - 1))}
          >
            <span />
          </button>
        </div>
      </div>

      <div className="top-categories-grid">
        {loading ? (
          <div className="brand-empty-state top-category-state">Đang tải nhóm ngành nổi bật...</div>
        ) : visibleCategories.length === 0 ? (
          <div className="brand-empty-state top-category-state">Chưa có dữ liệu ngành nghề để hiển thị.</div>
        ) : (
          visibleCategories.map((item) => (
            <Link
              className="top-category-card top-category-link"
              key={item.category}
              to={`/jobs?category=${encodeURIComponent(item.category)}&label=${encodeURIComponent(item.label)}`}
            >
              <CategoryIcon type={item.category} />
              <h3 title={item.label}>{item.label}</h3>
              <p data-zero={item.jobCount === 0 ? "true" : "false"}>{formatCount(item.jobCount)} việc làm</p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default TopCategoriesSection;
