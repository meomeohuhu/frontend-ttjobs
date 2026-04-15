import { useState } from "react";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

const PasswordSettings = () => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setSaving(false);
      setError("Mật khẩu mới và xác nhận mật khẩu phải trùng nhau.");
      return;
    }

    try {
      await apiRequest("/api/users/me/password", {
        method: "PUT",
        body: JSON.stringify(form)
      });
      setForm(initialForm);
      setMessage("Đã đổi mật khẩu thành công.");
    } catch (err) {
      setError(err.message || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      activePath="/user/password"
      title="Đổi mật khẩu"
      description="Giữ tài khoản an toàn bằng cách thay đổi mật khẩu định kỳ."
      aside={
        <div className="settings-aside-card">
          <h3>Lưu ý bảo mật</h3>
          <ul>
            <li>Dùng mật khẩu ít nhất 6 ký tự</li>
            <li>Không dùng lại mật khẩu cũ</li>
            <li>Nên cập nhật định kỳ sau vài tháng</li>
          </ul>
        </div>
      }
    >
      <form className="settings-card settings-form" onSubmit={handleSubmit}>
        {message ? <p className="settings-success">{message}</p> : null}
        {error ? <p className="settings-error">{error}</p> : null}

        <div className="settings-grid">
          <label className="settings-field settings-field-wide">
            <span>Mật khẩu hiện tại</span>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </label>
          <label className="settings-field">
            <span>Mật khẩu mới</span>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>
          <label className="settings-field">
            <span>Xác nhận mật khẩu</span>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="settings-actions">
          <button type="submit" className="settings-primary-btn" disabled={saving}>
            {saving ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default PasswordSettings;
