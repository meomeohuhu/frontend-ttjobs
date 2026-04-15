import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import HomeHeader from "../../sections/HomeHeader.jsx";
import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const AppliedJobs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/applications/me");
        if (active) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải danh sách ứng tuyển");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="user-page-shell">
      <HomeHeader />
      <AnnouncementBar />

      <div className="user-page-container">
        <div className="user-grid">
          <section className="user-card">
            <h2>Việc làm đã ứng tuyển</h2>
            <div className="status-tabs">
              <button type="button" className="active">Tất cả</button>
              <button type="button">Tiếp nhận</button>
              <button type="button">Đã xem</button>
              <button type="button">Duyệt hồ sơ</button>
              <button type="button">Cân nhắc</button>
              <button type="button">Phù hợp</button>
              <button type="button">Chưa phù hợp</button>
            </div>

            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && error && <p>{error}</p>}
            {!loading && !error && items.length === 0 && (
              <div className="empty-state">
                <div className="empty-illustration" />
                <p>Bạn chưa ứng tuyển công việc nào!</p>
                <Link to="/" className="primary-link">
                  Tìm việc ngay
                </Link>
              </div>
            )}

            {!loading &&
              !error &&
              items.map((item) => (
                <Link
                  key={item.id}
                  to={`/jobs/${item.jobId}`}
                  className="user-job-card"
                >
                  <div className="job-logo">
                    <span>{(item.companyName || "C")[0]}</span>
                  </div>
                  <div>
                    <h3>{item.jobTitle}</h3>
                    <p>{item.companyName || "Đang cập nhật"}</p>
                    <div className="job-meta">
                      <span>{item.status || "submitted"}</span>
                      <span>{item.applicationDate || ""}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </section>

          <aside className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar" />
              <div>
                <p>Chào bạn trở lại</p>
                <strong>Ứng viên</strong>
                <span className="verified">Tài khoản đã xác thực</span>
              </div>
            </div>
            <button type="button" className="outline-btn">Nâng cấp tài khoản</button>
            <div className="profile-section">
              <h4>Đang tắt tìm việc</h4>
              <p>Nhà tuyển dụng sẽ không nhìn thấy hồ sơ của bạn.</p>
            </div>
            <div className="profile-section">
              <h4>Cho phép NTD tìm kiếm hồ sơ</h4>
              <p>Khi bật, NTD sẽ dễ dàng liên hệ hơn.</p>
            </div>
          </aside>
        </div>
      </div>

      <FloatingActions />
    </div>
  );
};

export default AppliedJobs;
