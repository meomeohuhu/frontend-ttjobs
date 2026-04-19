import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const NotificationSettings = () => {
  const [form, setForm] = useState({
    inAppEnabled: true,
    emailEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPreferences = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/notifications/preferences");
        if (active) {
          setForm({
            inAppEnabled: Boolean(data?.inAppEnabled),
            emailEnabled: Boolean(data?.emailEnabled)
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải cài đặt thông báo");
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

  const toggle = (name) => {
    setForm((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiRequest("/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(form)
      });
      setMessage("Đã lưu cài đặt thông báo.");
    } catch (err) {
      setError(err.message || "Không thể lưu cài đặt thông báo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      activePath="/user/notifications"
      title="Thông báo"
      description="Chọn cách TTJobs gửi thông báo đến bạn qua email hoặc trong ứng dụng."
      aside={
        <div className="settings-aside-card">
          <h3>Gợi ý</h3>
          <ul>
            <li>Bật thông báo trong app để không bỏ lỡ cập nhật</li>
            <li>Bật email nếu bạn muốn nhận tin từ xa</li>
          </ul>
        </div>
      }
    >
      <form className="settings-card settings-form" onSubmit={handleSubmit}>
        {loading ? <p>Đang tải dữ liệu...</p> : null}
        {!loading && error ? <p className="settings-error">{error}</p> : null}
        {message ? <p className="settings-success">{message}</p> : null}

        <div className="settings-stack">
          <section id="email" className="settings-toggle-card">
            <div>
              <h3>Thiết lập email</h3>
              <p>Nhận email khi có việc phù hợp, trạng thái ứng tuyển hoặc cập nhật quan trọng.</p>
            </div>
            <button
              type="button"
              className={`settings-switch ${form.emailEnabled ? "is-on" : ""}`}
              onClick={() => toggle("emailEnabled")}
              aria-pressed={form.emailEnabled}
            >
              <span />
            </button>
          </section>

          <section id="notifications" className="settings-toggle-card">
            <div>
              <h3>Thiết lập thông báo</h3>
              <p>Bật thông báo trong ứng dụng để theo dõi phản hồi từ nhà tuyển dụng.</p>
            </div>
            <button
              type="button"
              className={`settings-switch ${form.inAppEnabled ? "is-on" : ""}`}
              onClick={() => toggle("inAppEnabled")}
              aria-pressed={form.inAppEnabled}
            >
              <span />
            </button>
          </section>
        </div>

        <div className="settings-actions">
          <button type="submit" className="settings-primary-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default NotificationSettings;
