import { apiRequest } from "./api.js";

export const fallbackJobMetadata = {
  categories: [
    { value: "INFORMATION-TECHNOLOGY", label: "Công nghệ thông tin" },
    { value: "SALES", label: "Kinh doanh - Bán hàng" },
    { value: "MARKETING", label: "Marketing - PR - Quảng cáo" },
    { value: "HR", label: "Nhân sự - Hành chính" },
    { value: "FINANCE", label: "Tài chính - Ngân hàng" },
    { value: "CUSTOMER-SERVICE", label: "Chăm sóc khách hàng" },
    { value: "REAL-ESTATE", label: "Bất động sản" },
    { value: "ACCOUNTING", label: "Kế toán - Kiểm toán - Thuế" },
    { value: "DESIGN", label: "Thiết kế" },
    { value: "BUSINESS-DEVELOPMENT", label: "Phát triển kinh doanh" },
    { value: "ENGINEERING", label: "Kỹ thuật" },
    { value: "OPERATIONS", label: "Vận hành" }
  ],
  jobTypes: [
    { value: "Full-time", label: "Toàn thời gian" },
    { value: "Part-time", label: "Bán thời gian" },
    { value: "Hybrid", label: "Linh hoạt" },
    { value: "Remote", label: "Từ xa" },
    { value: "Contract", label: "Hợp đồng" },
    { value: "Internship", label: "Thực tập" }
  ],
  experienceLevels: [
    { value: "ENTRY", label: "Entry/Fresher" },
    { value: "Junior", label: "Junior" },
    { value: "MID", label: "Middle" },
    { value: "Mid", label: "Middle" },
    { value: "SENIOR", label: "Senior" },
    { value: "Senior", label: "Senior" },
    { value: "LEAD", label: "Lead" },
    { value: "Lead", label: "Lead" }
  ],
  locationsFallback: [
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
    },
    { code: "remote", province: "Remote", districts: ["Remote", "Hybrid"] }
  ]
};

export const normalizeMetadata = (metadata) => ({
  categories: Array.isArray(metadata?.categories) && metadata.categories.length > 0
    ? metadata.categories
    : fallbackJobMetadata.categories,
  jobTypes: Array.isArray(metadata?.jobTypes) && metadata.jobTypes.length > 0
    ? metadata.jobTypes
    : fallbackJobMetadata.jobTypes,
  experienceLevels: Array.isArray(metadata?.experienceLevels) && metadata.experienceLevels.length > 0
    ? metadata.experienceLevels
    : fallbackJobMetadata.experienceLevels,
  locationsFallback: Array.isArray(metadata?.locationsFallback) && metadata.locationsFallback.length > 0
    ? metadata.locationsFallback
    : fallbackJobMetadata.locationsFallback
});

export const loadJobMetadata = async () => {
  try {
    const data = await apiRequest("/api/jobs/metadata", { skipAuth: true });
    return normalizeMetadata(data);
  } catch {
    return fallbackJobMetadata;
  }
};

export const getOptionLabel = (options, value, fallback = "") => {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label || value;
};

export const mergeCategoryStats = (metadataCategories, categoryStats) => {
  const byCategory = new Map();
  (Array.isArray(categoryStats) ? categoryStats : []).forEach((item) => {
    if (item?.category) {
      byCategory.set(item.category, item);
    }
  });

  const merged = metadataCategories.map((option) => ({
    category: option.value,
    label: option.label,
    jobCount: Number(byCategory.get(option.value)?.jobCount || 0)
  }));

  byCategory.forEach((item, category) => {
    if (!metadataCategories.some((option) => option.value === category)) {
      merged.push({
        category,
        label: item.label || category,
        jobCount: Number(item.jobCount || 0)
      });
    }
  });

  return merged;
};

export const loadProvinceGroups = async (fallbackGroups = fallbackJobMetadata.locationsFallback) => {
  try {
    const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=2");
    if (!response.ok) {
      throw new Error("Cannot load locations");
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
    return mapped.length > 0 ? mapped : fallbackGroups;
  } catch {
    return fallbackGroups;
  }
};
