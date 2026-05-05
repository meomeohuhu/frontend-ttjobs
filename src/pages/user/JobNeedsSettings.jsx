import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import { fallbackJobMetadata, loadJobMetadata } from "../../lib/jobMetadata.js";
import SettingsLayout from "./SettingsLayout.jsx";

const emptyForm = {
  desiredTitle: "",
  desiredLocation: "",
  desiredCategory: "",
  desiredJobType: "",
  desiredExperienceLevel: "",
  minSalary: "",
  maxSalary: "",
  preferredSkills: "",
  excludedKeywords: "",
  remoteOnly: false
};

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
  preferredSkills: Array.isArray(data?.preferredSkills) ? data.preferredSkills.join(", ") : "",
  excludedKeywords: Array.isArray(data?.excludedKeywords) ? data.excludedKeywords.join(", ") : "",
  remoteOnly: Boolean(data?.remoteOnly)
});

const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const JobNeedsSettings = () => {
  const [metadata, setMetadata] = useState(fallbackJobMetadata);
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
        const [metadataData, preferenceData] = await Promise.all([
          loadJobMetadata(),
          apiRequest("/api/job-needs/preferences")
        ]);
        if (!active) {
          return;
        }
        setMetadata(metadataData);
        setForm(toFormState(preferenceData));
        setUpdatedAt(preferenceData?.updatedAt ? new Date(preferenceData.updatedAt).toLocaleString("vi-VN") : "");
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
        preferredSkills: splitCsv(form.preferredSkills),
        excludedKeywords: splitCsv(form.excludedKeywords),
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
              {metadata.categories.map((option) => (
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
              {metadata.jobTypes.map((option) => (
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
              {metadata.experienceLevels.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            <span>Kỹ năng ưu tiên</span>
            <input
              name="preferredSkills"
              value={form.preferredSkills}
              onChange={handleChange}
              placeholder="Java, Spring Boot, SQL"
            />
          </label>
          <label className="settings-field">
            <span>Từ khóa muốn loại trừ</span>
            <input
              name="excludedKeywords"
              value={form.excludedKeywords}
              onChange={handleChange}
              placeholder="Intern, unpaid, onsite"
            />
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
              placeholder="15000000"
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
              placeholder="50000000"
            />
          </label>
        </div>

        <div className="settings-form-footer">
          <span>{updatedAt ? `Cập nhật lần cuối: ${updatedAt}` : "Chưa có dữ liệu cập nhật"}</span>
          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu nhu cầu"}
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default JobNeedsSettings;
