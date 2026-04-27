import { API_BASE_URL, extractFileName } from "../../lib/api.js";

export const applicationStatuses = [
  "submitted",
  "reviewing",
  "shortlisted",
  "interviewed",
  "offered",
  "hired",
  "rejected",
  "withdrawn"
];

export const applicationStatusLabels = {
  submitted: "Mới nộp",
  reviewing: "Đang xem",
  shortlisted: "Vào shortlist",
  interviewed: "Đã phỏng vấn",
  offered: "Đã gửi offer",
  hired: "Đã tuyển",
  rejected: "Từ chối",
  withdrawn: "Đã rút"
};

export const jobStatuses = ["draft", "open", "closed", "archived"];

export const nextApplicationStatuses = {
  submitted: ["reviewing", "rejected"],
  reviewing: ["shortlisted", "interviewed", "rejected"],
  shortlisted: ["interviewed", "rejected"],
  interviewed: ["offered", "rejected"],
  offered: ["hired", "rejected"],
  hired: [],
  rejected: [],
  withdrawn: []
};

export const formatNumber = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "0";
  }
  return numberValue.toLocaleString("vi-VN");
};

export const formatDate = (value) => {
  if (!value) return "Chưa có hạn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có hạn";
  return date.toLocaleDateString("vi-VN");
};

export const formatSalary = (item) => {
  const currency = item.currency || "VND";
  const min = Number(item.salaryMin);
  const max = Number(item.salaryMax);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0) {
    return `${min.toLocaleString("vi-VN")} - ${max.toLocaleString("vi-VN")} ${currency}`;
  }
  return "Thỏa thuận";
};

export const openCvBlob = async (applicationId) => {
  const token = localStorage.getItem("ttjobs_token");
  const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/cv-stream`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    throw new Error("Không thể mở CV");
  }
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const fileName = extractFileName(response.headers.get("content-disposition")) || `cv${guessCvExtension(contentType)}`;
  const blob = await response.blob();
  const typedBlob = blob.type ? blob : new Blob([blob], { type: contentType });
  const url = URL.createObjectURL(typedBlob);

  if (contentType.toLowerCase().includes("pdf")) {
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const guessCvExtension = (contentType) => {
  const type = (contentType || "").toLowerCase();
  if (type.includes("officedocument.wordprocessingml.document")) return ".docx";
  if (type.includes("msword")) return ".doc";
  if (type.includes("pdf")) return ".pdf";
  return ".pdf";
};
