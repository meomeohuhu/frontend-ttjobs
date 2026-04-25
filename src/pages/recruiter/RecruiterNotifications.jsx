import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatDate, formatNumber } from "./recruiterUtils.js";

const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [notificationsResult, unreadResult] = await Promise.allSettled([
      apiRequest("/api/notifications?size=50"),
      apiRequest("/api/notifications/unread-count")
    ]);

    if (notificationsResult.status === "fulfilled") {
      setNotifications(Array.isArray(notificationsResult.value) ? notificationsResult.value : []);
    }
    if (unreadResult.status === "fulfilled") {
      setUnreadCount(Number(unreadResult.value?.unreadCount || 0));
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        await loadData();
      } catch (err) {
        if (active) setError(err.message || "Không thể tải thông báo");
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((item) => !item.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const markAllAsRead = async () => {
    setMessage("");
    setError("");
    try {
      await apiRequest("/api/notifications/read-all", { method: "PUT" });
      setMessage("Đã đánh dấu tất cả là đã đọc.");
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể cập nhật thông báo");
    }
  };

  return (
    <RecruiterLayout
      title="Thông báo"
      description="Thông báo mới từ job, ứng viên và hoạt động của workspace."
      actions={<button type="button" className="recruiter-primary-action" onClick={markAllAsRead}>Đánh dấu tất cả là đã đọc</button>}
    >
      {loading ? <p className="recruiter-state">Đang tải thông báo...</p> : null}
      {!loading && error ? <p className="recruiter-state error">{error}</p> : null}
      {message ? <p className="recruiter-state success">{message}</p> : null}

      {!loading && !error ? (
        <section className="recruiter-notification-shell">
          <aside className="recruiter-notification-sidebar">
            <div className="recruiter-notification-card">
              <strong>Thông báo</strong>
              <p>Giữ những cập nhật mới nhất về ứng tuyển và hệ thống.</p>
              <button type="button" className="recruiter-secondary-action" onClick={markAllAsRead}>
                Gửi phản hồi
              </button>
            </div>

            <div className="recruiter-notification-tabs">
              <button
                type="button"
                className={activeFilter === "all" ? "active" : ""}
                onClick={() => setActiveFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={activeFilter === "unread" ? "active" : ""}
                onClick={() => setActiveFilter("unread")}
              >
                Chưa đọc
              </button>
            </div>
          </aside>

          <div className="recruiter-notification-panel">
            <header className="recruiter-panel-header">
              <h2>Thông báo</h2>
              <span>{formatNumber(unreadCount)} chưa đọc</span>
            </header>

            <div className="recruiter-console-list recruiter-notification-list">
              {filteredNotifications.length > 0 ? filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`recruiter-console-item recruiter-notification-item ${notification.isRead ? "" : "unread"}`}
                >
                  <div className="recruiter-console-item-row">
                    <strong>{notification.title}</strong>
                    {!notification.isRead ? <span className="recruiter-dot" /> : null}
                  </div>
                  <p>{notification.content}</p>
                  <small>{formatDate(notification.createdAt)}</small>
                </div>
              )) : <p className="recruiter-empty">Chưa có thông báo.</p>}
            </div>
          </div>
        </section>
      ) : null}
    </RecruiterLayout>
  );
};

export default RecruiterNotifications;
