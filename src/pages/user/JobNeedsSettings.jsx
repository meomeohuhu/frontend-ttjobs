import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const emptyForm = {
  desiredTitle: "",
  desiredLocation: "",
  desiredCategory: "",
  desiredJobType: "",
  desiredExperienceLevel: "",
  minSalary: "",
  maxSalary: "",
  remoteOnly: false
};

const categoryOptions = [
  { value: "INFORMATION-TECHNOLOGY", label: "Công nghệ thông tin" },
  { value: "FINANCE", label: "Tài chính" },
  { value: "SALES", label: "Kinh doanh / Sales" },
  { value: "HR", label: "Nhân sự" },
  { value: "ENGINEERING", label: "Kỹ thuật" },
  { value: "DESIGNER", label: "Thiết kế" },
  { value: "BUSINESS-DEVELOPMENT", label: "Phát triển kinh doanh" },
  { value: "MARKETING", label: "Marketing" }
];

const jobTypeOptions = [
  { value: "Full-time", label: "Toàn thời gian" },
  { value: "Part-time", label: "Bán thời gian" },
  { value: "Contract", label: "Hợp đồng" },
  { value: "Internship", label: "Thực tập" },
  { value: "Remote", label: "Từ xa" }
];
const experienceOptions = [
  { value: "ENTRY", label: "Fresher / Entry" },
  { value: "MID", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" }
];

const toFormState = (data) => ({
  desiredTitle: data?.desiredTitle || "",
  desiredLocation: data?.desiredLocation || "",
  desiredCategory: data?.desiredCategory || "",
  desiredJobType: data?.desiredJobType || "",
  desiredExperienceLevel: data?.desiredExperienceLevel || "",
  minSalary:
    data?.minSalary === null || data?.minSalary === undefined ? "" : String(data.minSalary),
  maxSalary:
    data?.maxSalary === null || data?.maxSalary === undefined ? "" : String(data.maxSalary),
  remoteOnly: Boolean(data?.remoteOnly)
});

const JobNeedsSettings = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    let active = true;

    const loadPreferences = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/job-needs/preferences");
        if (!active) {
          return;
        }
        setForm(toFormState(data));
        setUpdatedAt(data?.updatedAt ? new Date(data.updatedAt).toLocaleString("vi-VN") : "");
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải nhu cầu công việc");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPreferences();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const minSalary = form.minSalary === "" ? null : Number(form.minSalary);
    const maxSalary = form.maxSalary === "" ? null : Number(form.maxSalary);

    if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
      setSaving(false);
      setError("Mức lương tối thiểu không được lớn hơn mức lương tối đa.");
      return;
    }

    try {
      const payload = {
        desiredTitle: form.desiredTitle,
        desiredLocation: form.desiredLocation,
        desiredCategory: form.desiredCategory,
        desiredJobType: form.desiredJobType,
        desiredExperienceLevel: form.desiredExperienceLevel,
        minSalary,
        maxSalary,
        remoteOnly: form.remoteOnly
      };

      const data = await apiRequest("/api/job-needs/preferences", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setForm(toFormState(data));
      setUpdatedAt(data?.updatedAt ? new Date(data.updatedAt).toLocaleString("vi-VN") : "");
      setMessage("Đã lưu nhu cầu công việc.");
    } catch (err) {
      setError(err.message || "Không thể lưu nhu cầu công việc");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      activePath="/user/job-needs"
      title="Nhu cầu công việc"
      description="Thiết lập tiêu chí bạn muốn tìm để TTJobs gợi ý đúng việc hơn."
      aside={
        <div className="settings-aside-card">
          <h3>Cách dùng</h3>
          <ul>
            <li>Nhập tiêu đề hoặc ngành nghề bạn muốn ưu tiên</li>
            <li>Chọn mức lương để lọc bớt việc không phù hợp</li>
            <li>Bật remote nếu bạn chỉ muốn việc làm từ xa</li>
          </ul>
        </div>
      }
    >
      <form className="settings-card settings-form" onSubmit={handleSubmit}>
        {loading ? <p>Đang tải dữ liệu...</p> : null}
        {!loading && error ? <p className="settings-error">{error}</p> : null}
        {message ? <p className="settings-success">{message}</p> : null}

        <div className="settings-grid">
          <label className="settings-field">
            <span>Tiêu đề mong muốn</span>
            <input
              name="desiredTitle"
              value={form.desiredTitle}
              onChange={handleChange}
              placeholder="Ví dụ: Backend Engineer"
            />
          </label>
          <label className="settings-field">
            <span>Khu vực mong muốn</span>
            <input
              name="desiredLocation"
              value={form.desiredLocation}
              onChange={handleChange}
              placeholder="Ví dụ: Hà Nội"
            />
          </label>
          <label className="settings-field">
            <span>Ngành nghề</span>
            <select name="desiredCategory" value={form.desiredCategory} onChange={handleChange}>
              <option value="">Chọn ngành nghề</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            <span>Loại việc</span>
            <select name="desiredJobType" value={form.desiredJobType} onChange={handleChange}>
              <option value="">Chọn loại việc</option>
              {jobTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            <span>Kinh nghiệm</span>
            <select
              name="desiredExperienceLevel"
              value={form.desiredExperienceLevel}
              onChange={handleChange}
            >
              <option value="">Chọn mức kinh nghiệm</option>
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            <span>Làm từ xa</span>
            <button
              type="button"
              className={`settings-switch ${form.remoteOnly ? "is-on" : ""}`}
              onClick={() => setForm((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly }))}
              aria-pressed={form.remoteOnly}
            >
              <span />
            </button>
          </label>
          <label className="settings-field">
            <span>Mức lương tối thiểu</span>
            <input
              name="minSalary"
              type="number"
              min="0"
              value={form.minSalary}
              onChange={handleChange}
              placeholder="Ví dụ: 15000000"
            />
          </label>
          <label className="settings-field">
            <span>Mức lương tối đa</span>
            <input
              name="maxSalary"
              type="number"
              min="0"
              value={form.maxSalary}
              onChange={handleChange}
              placeholder="Ví dụ: 30000000"
            />
          </label>
        </div>

        <div className="settings-actions">
          <div className="settings-meta">
            {updatedAt ? <span>Cập nhật lần cuối: {updatedAt}</span> : <span>Chưa lưu lần nào</span>}
          </div>
          <button type="submit" className="settings-primary-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu nhu cầu công việc"}
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default JobNeedsSettings;
