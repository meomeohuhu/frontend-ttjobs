import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import AdminLayout from "./AdminLayout.jsx";

const moduleConfigs = {
  companies: {
    title: "Quản lý doanh nghiệp",
    description: "Theo dõi hồ sơ công ty, trạng thái xác minh và tin tuyển dụng.",
    endpoint: "/api/admin/companies",
    columns: ["Doanh nghiệp", "Ngành", "Khu vực", "Xác minh", "Theo dõi"],
    empty: "Chưa có doanh nghiệp nào.",
    renderRow: (company) => [
      <strong>{company.name || "Chưa có tên"}</strong>,
      company.industry || "Chưa phân loại",
      company.location || "Chưa cập nhật",
      company.verificationStatus || "PENDING",
      company.followerCount || 0
    ]
  },
  companyApprovals: {
    title: "Duyệt doanh nghiệp",
    description: "Kiểm tra hồ sơ xác minh trước khi cho phép công ty public tin tuyển dụng.",
    endpoint: "/api/admin/companies/verifications",
    filterable: true,
    filters: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"],
    columns: ["Doanh nghiệp", "Mã thuế", "Website", "Trạng thái", "Ghi chú"],
    empty: "Chưa có hồ sơ xác minh.",
    renderRow: (item) => [
      <strong>{item.companyName || `Công ty #${item.companyId}`}</strong>,
      item.taxCode || "Chưa cập nhật",
      item.website || "Chưa cập nhật",
      item.status || "PENDING",
      item.reviewReason || item.note || "Chưa có ghi chú"
    ]
  },
  jobs: {
    title: "Quản lý tin tuyển dụng",
    description: "Theo dõi trạng thái, công ty và chất lượng tin tuyển dụng.",
    endpoint: "/api/admin/jobs",
    columns: ["Tin tuyển dụng", "Công ty", "Ngành", "Trạng thái", "Hạn nộp"],
    empty: "Chưa có tin tuyển dụng nào.",
    renderRow: (job) => [
      <strong>{job.title || "Chưa có tiêu đề"}</strong>,
      job.companyName || "Chưa gắn công ty",
      job.category || "Chưa phân loại",
      job.status || "Không xác định",
      job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString("vi-VN") : "Không giới hạn"
    ]
  },
  forum: {
    title: "Kiểm duyệt diễn đàn",
    description: "Xử lý báo cáo bài viết, bình luận và người dùng vi phạm.",
    endpoint: "/api/admin/forum/reports",
    filterable: true,
    filters: ["PENDING", "REVIEWING", "RESOLVED", "REJECTED"],
    columns: ["Mã báo cáo", "Bài viết", "Bình luận", "Người báo cáo", "Lý do"],
    empty: "Chưa có báo cáo diễn đàn.",
    renderRow: (report) => [
      <span className="admin-report-target">
        <strong>#{report.id}</strong>
        <small>{report.commentId ? "Bình luận bị báo cáo" : "Bài viết bị báo cáo"}</small>
      </span>,
      report.postId ? <Link className="admin-forum-link" to={`/community#post-${report.postId}`}>Bài #{report.postId}</Link> : "Không có",
      report.commentId ? <Link className="admin-forum-link admin-forum-link-comment" to={`/community#comment-${report.postId}-${report.commentId}`}>Bình luận #{report.commentId}</Link> : "Không có",
      report.reporterName || "Ẩn danh",
      report.reason || "Chưa có lý do"
    ]
  },
  emailCampaigns: {
    title: "Email hệ thống",
    description: "Theo dõi thông báo email, job alert và nhắc lịch phỏng vấn.",
    cards: ["Job alert theo saved search", "Email nhắc phỏng vấn", "Trạng thái SMTP"]
  },
  aiMonitoring: {
    title: "AI Monitoring",
    description: "Theo dõi sức khỏe AI service, latency, fallback và chất lượng recommendation.",
    endpoint: "/api/admin/ai/monitoring",
    singleton: true,
    columns: ["Health", "Match model", "Embedding", "Latency", "Fallback"],
    empty: "Chưa có dữ liệu AI monitoring.",
    renderRow: (item) => [
      <strong>{item.healthStatus || "unknown"}</strong>,
      item.matchClassifierReady ? "READY" : "DOWN",
      item.embeddingMatcherReady ? "READY" : "DOWN",
      `${Math.round(item.averageLatencyMs || 0)} ms`,
      item.fallbackCount || 0
    ],
    cards: ["Trạng thái model", "Fallback và lỗi AI", "Hiệu quả gợi ý việc làm"]
  },
  analytics: {
    title: "Analytics & KPI",
    description: "Phân tích funnel ứng tuyển, matching và hoạt động cộng đồng.",
    cards: ["Funnel ứng tuyển", "Hiệu quả gợi ý việc làm", "Tương tác forum"]
  },
  reports: {
    title: "Báo cáo quản trị",
    description: "Tổng hợp số liệu vận hành để xuất báo cáo định kỳ.",
    cards: ["Vận hành tuần", "SLA nhà tuyển dụng", "Báo cáo rủi ro"]
  },
  auditLogs: {
    title: "Nhật ký hệ thống",
    description: "Theo dõi thao tác admin, moderation và các hành động nhạy cảm.",
    endpoint: "/api/admin/audit-logs",
    columns: ["Hành động", "Đối tượng", "Người thao tác", "Lý do", "Thời gian"],
    empty: "Chưa có nhật ký admin.",
    renderRow: (item) => [
      <strong>{item.action}</strong>,
      `${item.targetType || "SYSTEM"}${item.targetId ? ` #${item.targetId}` : ""}`,
      item.actorName || `User #${item.actorId || "?"}`,
      item.reason || item.metadata || "Không có",
      item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "Chưa có"
    ]
  }
};

const editableModules = new Set(["companies", "jobs"]);
const pageSizeOptions = [10, 20, 50];

function collectSearchText(value) {
  if (value == null) return "";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  if (Array.isArray(value)) return value.map(collectSearchText).join(" ");
  if (typeof value === "object") return Object.values(value).map(collectSearchText).join(" ");
  return "";
}

function rowClassName(module, hasActions) {
  return [
    "admin-module-row",
    `admin-module-row-${module}`,
    hasActions ? "admin-module-with-actions" : ""
  ].filter(Boolean).join(" ");
}

function toDateTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function createEditForm(module, item) {
  if (module === "companies") {
    return {
      name: item.name || "",
      industry: item.industry || "",
      location: item.location || "",
      website: item.website || "",
      description: item.description || "",
      verificationStatus: item.verificationStatus || "PENDING",
      reason: ""
    };
  }
  return {
    title: item.title || "",
    companyName: item.companyName || "",
    category: item.category || "",
    location: item.location || "",
    jobType: item.jobType || "",
    experienceLevel: item.experienceLevel || "",
    status: item.status || "open",
    currency: item.currency || "VND",
    salaryMin: item.salaryMin ?? "",
    salaryMax: item.salaryMax ?? "",
    applicationDeadline: toDateTimeInputValue(item.applicationDeadline),
    description: item.description || "",
    reason: ""
  };
}

function normalizePayload(module, form) {
  if (module === "companies") {
    return { ...form };
  }
  return {
    title: form.title,
    description: form.description,
    location: form.location,
    salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
    salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
    currency: form.currency,
    jobType: form.jobType,
    experienceLevel: form.experienceLevel,
    category: form.category,
    status: form.status,
    applicationDeadline: form.applicationDeadline || null,
    reason: form.reason
  };
}

const AdminEditModal = ({ module, item, form, onChange, onClose, onSubmit, saving }) => {
  if (!item) return null;
  const isCompany = module === "companies";

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form className="admin-edit-modal" onSubmit={onSubmit}>
        <div className="admin-edit-modal-header">
          <div>
            <span>{isCompany ? "Doanh nghiệp" : "Tin tuyển dụng"}</span>
            <h2>{isCompany ? "Chỉnh sửa doanh nghiệp" : "Chỉnh sửa tin tuyển dụng"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className="admin-edit-form-grid">
          {isCompany ? (
            <>
              <label>
                Tên doanh nghiệp
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label>
                Ngành
                <input name="industry" value={form.industry} onChange={onChange} />
              </label>
              <label>
                Khu vực
                <input name="location" value={form.location} onChange={onChange} />
              </label>
              <label>
                Website
                <input name="website" value={form.website} onChange={onChange} />
              </label>
              <label>
                Trạng thái xác minh
                <select name="verificationStatus" value={form.verificationStatus} onChange={onChange}>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </label>
              <label className="admin-edit-form-wide">
                Mô tả
                <textarea name="description" value={form.description} onChange={onChange} rows="4" />
              </label>
            </>
          ) : (
            <>
              <label>
                Tiêu đề
                <input name="title" value={form.title} onChange={onChange} required />
              </label>
              <label>
                Công ty
                <input name="companyName" value={form.companyName} disabled />
              </label>
              <label>
                Ngành
                <input name="category" value={form.category} onChange={onChange} />
              </label>
              <label>
                Khu vực
                <input name="location" value={form.location} onChange={onChange} />
              </label>
              <label>
                Loại công việc
                <input name="jobType" value={form.jobType} onChange={onChange} />
              </label>
              <label>
                Cấp độ
                <input name="experienceLevel" value={form.experienceLevel} onChange={onChange} />
              </label>
              <label>
                Trạng thái
                <select name="status" value={form.status} onChange={onChange}>
                  <option value="open">open</option>
                  <option value="pending">pending</option>
                  <option value="draft">draft</option>
                  <option value="closed">closed</option>
                  <option value="hidden">hidden</option>
                </select>
              </label>
              <label>
                Tiền tệ
                <input name="currency" value={form.currency} onChange={onChange} />
              </label>
              <label>
                Lương từ
                <input name="salaryMin" type="number" value={form.salaryMin} onChange={onChange} />
              </label>
              <label>
                Lương đến
                <input name="salaryMax" type="number" value={form.salaryMax} onChange={onChange} />
              </label>
              <label>
                Hạn nộp
                <input name="applicationDeadline" type="datetime-local" value={form.applicationDeadline} onChange={onChange} />
              </label>
              <label className="admin-edit-form-wide">
                Mô tả
                <textarea name="description" value={form.description} onChange={onChange} rows="4" />
              </label>
            </>
          )}
          <label className="admin-edit-form-wide">
            Lý do thay đổi
            <input name="reason" value={form.reason} onChange={onChange} placeholder="VD: Cập nhật theo kiểm duyệt admin" />
          </label>
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Hủy</button>
          <button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </div>
      </form>
    </div>
  );
};

const AdminDeleteModal = ({ module, item, reason, onReasonChange, onClose, onConfirm, saving }) => {
  if (!item) return null;
  const name = module === "companies" ? item.name : item.title;
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-edit-modal admin-delete-modal">
        <div className="admin-edit-modal-header">
          <div>
            <span>{module === "companies" ? "Doanh nghiệp" : "Tin tuyển dụng"}</span>
            <h2>Xác nhận xóa</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <p>
          Dữ liệu sẽ được ẩn/đóng theo cơ chế soft delete để vẫn còn audit và lịch sử hệ thống.
        </p>
        <strong>{name || `#${item.id}`}</strong>
        <label className="admin-delete-reason">
          Lý do xóa
          <textarea value={reason} onChange={(event) => onReasonChange(event.target.value)} rows="3" required />
        </label>
        <div className="admin-modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Hủy</button>
          <button type="button" className="danger" disabled={saving || !reason.trim()} onClick={onConfirm}>
            {saving ? "Đang xử lý..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

function getCompanyReviewCopy(action) {
  if (action === "reject") {
    return {
      title: "Từ chối xác minh",
      label: "Lý do từ chối",
      submit: "Từ chối",
      tone: "danger"
    };
  }
  if (action === "suspend") {
    return {
      title: "Tạm khóa doanh nghiệp",
      label: "Lý do tạm khóa",
      submit: "Tạm khóa",
      tone: "danger"
    };
  }
  return {
    title: "Duyệt doanh nghiệp",
    label: "Ghi chú duyệt",
    submit: "Duyệt",
    tone: ""
  };
}

const AdminCompanyReviewModal = ({ item, action, reason, onReasonChange, onClose, onConfirm, saving }) => {
  if (!item || !action) return null;
  const copy = getCompanyReviewCopy(action);

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-edit-modal admin-delete-modal">
        <div className="admin-edit-modal-header">
          <div>
            <span>Hồ sơ xác minh</span>
            <h2>{copy.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <div className="admin-review-summary">
          <strong>{item.companyName || `Công ty #${item.companyId}`}</strong>
          <span className="label-value-line"><span>Trạng thái hiện tại:</span><span>{item.status || "PENDING"}</span></span>
        </div>
        <label className="admin-delete-reason">
          {copy.label}
          <textarea value={reason} onChange={(event) => onReasonChange(event.target.value)} rows="3" required />
        </label>
        <div className="admin-modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={copy.tone}
            disabled={saving || !reason.trim()}
            onClick={onConfirm}
          >
            {saving ? "Đang xử lý..." : copy.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminModulePage = ({ module }) => {
  const config = moduleConfigs[module] || moduleConfigs.analytics;
  const [items, setItems] = useState([]);
  const [trainingEvents, setTrainingEvents] = useState([]);
  const [loading, setLoading] = useState(Boolean(config.endpoint));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(config.filters?.[0] || "PENDING");
  const [aiFilters, setAiFilters] = useState({ eventType: "", label: "", minScore: "", maxScore: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [reviewingCompany, setReviewingCompany] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewReason, setReviewReason] = useState("");

  const endpoint = useMemo(() => {
    if (!config.endpoint) return "";
    return config.filterable ? `${config.endpoint}?status=${encodeURIComponent(statusFilter)}` : config.endpoint;
  }, [config.endpoint, config.filterable, statusFilter]);

  const hasActions = editableModules.has(module) || module === "forum" || module === "companyApprovals";

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) => collectSearchText(item).toLowerCase().includes(value));
  }, [items, query]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, module, pageSize]);

  const loadItems = async () => {
    if (!endpoint) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(endpoint);
      setItems(config.singleton ? [data] : Array.isArray(data) ? data : []);
      if (module === "aiMonitoring") {
        await loadTrainingEvents();
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu module.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [endpoint]);

  const buildTrainingEventsUrl = (size = 50) => {
    const params = new URLSearchParams({ size: String(size) });
    Object.entries(aiFilters).forEach(([key, value]) => {
      if (String(value || "").trim()) params.set(key, String(value).trim());
    });
    return `/api/admin/ai/training-events?${params.toString()}`;
  };

  const loadTrainingEvents = async () => {
    try {
      const events = await apiRequest(buildTrainingEventsUrl(50));
      setTrainingEvents(Array.isArray(events) ? events : []);
    } catch {
      setTrainingEvents([]);
    }
  };

  const updateAiFilter = (event) => {
    const { name, value } = event.target;
    setAiFilters((current) => ({ ...current, [name]: value }));
  };

  const exportTrainingEvents = (format) => {
    const rows = trainingEvents.map((event) => ({
      eventType: event.eventType || "",
      predictedLabel: event.predictedLabel || "",
      predictedScore: event.predictedScore ?? "",
      cvSnapshotText: event.cvSnapshotText || "",
      jobSnapshotText: event.jobSnapshotText || "",
      createdAt: event.createdAt || ""
    }));
    const content = format === "jsonl"
      ? rows.map((row) => JSON.stringify(row)).join("\n")
      : [
          "eventType,predictedLabel,predictedScore,cvSnapshotText,jobSnapshotText,createdAt",
          ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
        ].join("\n");
    const blob = new Blob([content], { type: format === "jsonl" ? "application/jsonl" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-training-events.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm(createEditForm(module, item));
    setError("");
  };

  const updateEditForm = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/api/admin/${module}/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify(normalizePayload(module, editForm))
      });
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể lưu thay đổi.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (item) => {
    setDeletingItem(item);
    setDeleteReason("");
    setError("");
  };

  const confirmDelete = async () => {
    if (!deletingItem || !deleteReason.trim()) return;
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/api/admin/${module}/${deletingItem.id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: deleteReason.trim() })
      });
      setDeletingItem(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể xóa dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const moderateForumReport = async (report, action) => {
    try {
      await apiRequest(`/api/admin/forum/reports/${report.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          status: "RESOLVED",
          action,
          reason: "Xử lý từ dashboard admin",
          hidePost: action === "hide_post",
          hideComment: action === "hide_comment"
        })
      });
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể xử lý báo cáo.");
    }
  };

  const executeCompanyReview = async (item, action, reason) => {
    if (!item?.companyId) {
      setError("Không xác định được doanh nghiệp cần xử lý.");
      return;
    }
    if (!reason.trim()) {
      setError("Cần nhập lý do khi xử lý hồ sơ doanh nghiệp.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/api/admin/companies/${item.companyId}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() })
      });
      setReviewingCompany(null);
      setReviewAction("");
      setReviewReason("");
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể xử lý hồ sơ doanh nghiệp.");
    } finally {
      setSaving(false);
    }
  };

  const openCompanyReviewModal = (item, action) => {
    if (action === "verify") {
      executeCompanyReview(item, action, "Ho so hop le");
      return;
    }
    setError("");
    setReviewingCompany(item);
    setReviewAction(action);
    setReviewReason("");
  };

  const submitCompanyReview = async () => {
    if (!reviewingCompany || !reviewAction) return;
    if (!reviewingCompany.companyId) {
      setError("Không xác định được doanh nghiệp cần xử lý.");
      return;
    }
    if (!reviewReason.trim()) {
      setError("Cần nhập lý do khi xử lý hồ sơ doanh nghiệp.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/api/admin/companies/${reviewingCompany.companyId}/${reviewAction}`, {
        method: "POST",
        body: JSON.stringify({ reason: reviewReason.trim() })
      });
      setReviewingCompany(null);
      setReviewAction("");
      setReviewReason("");
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể xử lý hồ sơ doanh nghiệp.");
    } finally {
      setSaving(false);
    }
  };

  const monitoring = module === "aiMonitoring" ? items[0] : null;
  const cards = monitoring ? [
    `Health: ${monitoring.healthStatus || "unknown"}`,
    `Requests: ${monitoring.requestCount || 0} / Errors: ${monitoring.errorCount || 0}`,
    `CTR: ${monitoring.recommendationCtr || 0}% / Apply rate: ${monitoring.applyAfterRecommendationRate || 0}%`
  ] : config.cards || [
    "Theo dõi trạng thái xử lý",
    "Đảm bảo dữ liệu có audit log",
    "Giữ luồng duyệt rõ ràng cho admin"
  ];

  return (
    <AdminLayout
      title={config.title}
      description={config.description}
      actions={<Link to="/admin/dashboard" className="admin-primary-action">Về tổng quan</Link>}
    >
      <section className="admin-module-hero">
        <div>
          <span>{config.endpoint ? `${filteredItems.length}/${items.length} bản ghi` : "Lộ trình"}</span>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <strong>Quản trị</strong>
      </section>

      <section className="admin-module-card-grid">
        {cards.map((copy) => (
          <article key={copy} className="admin-module-card">
            <span>{copy}</span>
            <p>Sẵn sàng mở rộng theo luồng quản trị thực tế của TTJobs.</p>
          </article>
        ))}
      </section>

      {config.endpoint ? (
        <section className="admin-module-table">
          {monitoring ? (
            <div className={rowClassName(module, false)}>
              <span><strong>Match model</strong><br />{monitoring.matchClassifierReady ? "READY" : "DOWN"}</span>
              <span><strong>Embedding</strong><br />{monitoring.embeddingMatcherReady ? "READY" : "DOWN"}</span>
              <span><strong>Latency TB</strong><br />{Math.round(monitoring.averageLatencyMs || 0)} ms</span>
              <span><strong>Fallback</strong><br />{monitoring.fallbackCount || 0}</span>
              <span><strong>Labels</strong><br />{Object.entries(monitoring.labelDistribution || {}).map(([key, value]) => `${key}: ${value}`).join(", ") || "Chưa có"}</span>
            </div>
          ) : null}
          {module === "aiMonitoring" ? (
            <div className="admin-module-toolbar ai-training-toolbar">
              <input name="eventType" value={aiFilters.eventType} onChange={updateAiFilter} placeholder="Event type" />
              <input name="label" value={aiFilters.label} onChange={updateAiFilter} placeholder="Label" />
              <input name="minScore" value={aiFilters.minScore} onChange={updateAiFilter} placeholder="Score từ" type="number" />
              <input name="maxScore" value={aiFilters.maxScore} onChange={updateAiFilter} placeholder="Score đến" type="number" />
              <button type="button" onClick={loadTrainingEvents}>Lọc event</button>
              <button type="button" onClick={() => exportTrainingEvents("csv")}>Export CSV</button>
              <button type="button" onClick={() => exportTrainingEvents("jsonl")}>Export JSONL</button>
            </div>
          ) : null}
          {module === "aiMonitoring" && trainingEvents.length > 0 ? (
            <div className={`${rowClassName(module, false)} admin-module-training-row`}>
              <span><strong>Training events mới</strong><br />{trainingEvents.length} bản ghi gần nhất</span>
              <span><strong>Event</strong><br />{trainingEvents[0].eventType || "unknown"}</span>
              <span><strong>Label</strong><br />{trainingEvents[0].predictedLabel || "Chưa có"}</span>
              <span><strong>Score</strong><br />{trainingEvents[0].predictedScore ?? "Chưa có"}</span>
              <span><strong>Thời gian</strong><br />{trainingEvents[0].createdAt ? new Date(trainingEvents[0].createdAt).toLocaleString("vi-VN") : "Chưa có"}</span>
            </div>
          ) : null}
          {config.filters ? (
            <div className="admin-module-toolbar">
              {config.filters.map((filter) => (
                <button key={filter} type="button" className={statusFilter === filter ? "active" : ""} onClick={() => setStatusFilter(filter)}>
                  {filter}
                </button>
              ))}
            </div>
          ) : null}
          {!config.singleton ? (
            <div className="admin-module-search">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên, ID, trạng thái, công ty, email..."
                aria-label={`Tìm kiếm ${config.title}`}
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")}>Xóa lọc</button>
              ) : null}
              <label className="admin-page-size">
                Hiển thị
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {loading ? <p className="admin-state">Đang tải dữ liệu...</p> : null}
          {!loading && error ? <p className="admin-state error">{error}</p> : null}
          {!loading && !error ? (
            <>
              <div className={`${rowClassName(module, hasActions)} admin-module-head`}>
                {config.columns.map((column) => <span key={column}>{column}</span>)}
                {hasActions ? <span>Thao tác</span> : null}
              </div>
              {filteredItems.length === 0 ? (
                <p className="admin-users-empty">{query ? "Không có dữ liệu phù hợp với tìm kiếm." : config.empty}</p>
              ) : (
                paginatedItems.map((item, index) => (
                  <div key={item.id || item.companyId || `${module}-${index}`} className={rowClassName(module, hasActions)}>
                    {config.renderRow(item).map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}
                    {editableModules.has(module) ? (
                      <span className="admin-inline-actions">
                        <button type="button" onClick={() => openEditModal(item)}>Sửa</button>
                        <button type="button" className="danger" onClick={() => openDeleteModal(item)}>Xóa</button>
                      </span>
                    ) : null}
                    {module === "forum" ? (
                      <span className="admin-inline-actions">
                        {item.commentId ? <button type="button" onClick={() => moderateForumReport(item, "hide_comment")}>Ẩn bình luận</button> : null}
                        {item.postId ? <button type="button" onClick={() => moderateForumReport(item, "hide_post")}>Ẩn bài</button> : null}
                        <button type="button" onClick={() => moderateForumReport(item, "review")}>Đánh dấu xong</button>
                      </span>
                    ) : null}
                    {module === "companyApprovals" ? (
                      <span className="admin-inline-actions">
                        <button type="button" onClick={() => openCompanyReviewModal(item, "verify")}>Duyệt</button>
                        <button type="button" onClick={() => openCompanyReviewModal(item, "reject")}>Từ chối</button>
                        <button type="button" onClick={() => openCompanyReviewModal(item, "suspend")}>Tạm khóa</button>
                      </span>
                    ) : null}
                  </div>
                ))
              )}
              {filteredItems.length > 0 && !config.singleton ? (
                <div className="admin-pagination">
                  <span>
                    Hiển thị {pageStart + 1}-{Math.min(pageStart + pageSize, filteredItems.length)} / {filteredItems.length}
                  </span>
                  <div>
                    <button type="button" disabled={currentPage <= 1} onClick={() => setPage(1)}>Đầu</button>
                    <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trước</button>
                    <strong>Trang {currentPage}/{totalPages}</strong>
                    <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Sau</button>
                    <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>Cuối</button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      <AdminEditModal
        module={module}
        item={editingItem}
        form={editForm}
        onChange={updateEditForm}
        onClose={() => setEditingItem(null)}
        onSubmit={submitEdit}
        saving={saving}
      />
      <AdminDeleteModal
        module={module}
        item={deletingItem}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        saving={saving}
      />
      <AdminCompanyReviewModal
        item={reviewingCompany}
        action={reviewAction}
        reason={reviewReason}
        onReasonChange={setReviewReason}
        onClose={() => {
          setReviewingCompany(null);
          setReviewAction("");
          setReviewReason("");
        }}
        onConfirm={submitCompanyReview}
        saving={saving}
      />
    </AdminLayout>
  );
};

export default AdminModulePage;
