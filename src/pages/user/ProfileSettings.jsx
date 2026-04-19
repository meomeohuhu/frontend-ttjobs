import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  experienceYears: "",
  skills: ""
};

const ProfileSettings = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/users/me");
        if (!active) {
          return;
        }

        setProfileId(data?.id ? `ID ${data.id}` : "");
        setForm({
          name: data?.name || "",
          phone: data?.phone || "",
          address: data?.address || "",
          experienceYears:
            data?.experienceYears === null || data?.experienceYears === undefined
              ? ""
              : String(data.experienceYears),
          skills: Array.isArray(data?.skills) ? data.skills.join(", ") : ""
        });
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải thông tin cá nhân");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      experienceYears:
        form.experienceYears === "" ? null : Number.parseInt(form.experienceYears, 10),
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    };

    try {
      const data = await apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setForm({
        name: data?.name || "",
        phone: data?.phone || "",
        address: data?.address || "",
        experienceYears:
          data?.experienceYears === null || data?.experienceYears === undefined
            ? ""
            : String(data.experienceYears),
        skills: Array.isArray(data?.skills) ? data.skills.join(", ") : ""
      });
      setMessage("Đã lưu thông tin cá nhân.");
    } catch (err) {
      setError(err.message || "Không thể lưu thông tin cá nhân");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      activePath="/user/profile"
      title="Thông tin cá nhân"
      description="Cập nhật hồ sơ ứng viên để nhà tuyển dụng nhìn thấy đúng thông tin của bạn."
      aside={
        <div className="settings-aside-card">
          <h3>Hồ sơ của bạn</h3>
          <p className="settings-aside-id">{profileId || "Đang tải..."}</p>
          <ul>
            <li>Đổi tên hiển thị</li>
            <li>Cập nhật số điện thoại</li>
            <li>Thêm kỹ năng theo ngôn ngữ tự nhiên</li>
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
            <span>Họ và tên</span>
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label className="settings-field">
            <span>Số điện thoại</span>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label className="settings-field settings-field-wide">
            <span>Địa chỉ</span>
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label className="settings-field">
            <span>Kinh nghiệm (năm)</span>
            <input
              name="experienceYears"
              type="number"
              min="0"
              value={form.experienceYears}
              onChange={handleChange}
            />
          </label>
          <label className="settings-field settings-field-wide">
            <span>Kỹ năng</span>
            <textarea
              name="skills"
              rows="4"
              value={form.skills}
              onChange={handleChange}
              placeholder="Ví dụ: React, Java, SQL"
            />
          </label>
        </div>

        <div className="settings-actions">
          <button type="submit" className="settings-primary-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default ProfileSettings;
