import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import HomeHeader from "../../sections/HomeHeader.jsx";
import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const formatNumber = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "";
  }
  return numberValue.toLocaleString("vi-VN");
};

const formatSalary = (job) => {
  const min = formatNumber(job.salaryMin);
  const max = formatNumber(job.salaryMax);
  const salary = formatNumber(job.salary);
  const currency = job.currency || "VND";

  if (min && max) {
    return `${min} - ${max} ${currency}`;
  }
  if (salary) {
    return `${salary} ${currency}`;
  }
  return "Thỏa thuận";
};

const formatMatchScore = (item) => {
  const value = Number(item?.matchScore);
  if (!Number.isFinite(value) || value <= 0) {
    return "Phù hợp";
  }
  return `${Math.round(value)}% phù hợp`;
};

const MatchingJobs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/recommendations/job-needs");
        if (active) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải việc làm phù hợp");
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
            <h2>Việc làm phù hợp</h2>
            <p className="muted">
              Những công việc phù hợp nhất với nhu cầu công việc hiện tại của bạn.
            </p>

            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && error && <p>{error}</p>}
            {!loading && !error && items.length === 0 && (
              <div className="empty-state">
                <div className="empty-illustration" />
                <p>Chưa có gợi ý phù hợp. Hãy cập nhật nhu cầu công việc để nhận đề xuất.</p>
                <Link to="/user/job-needs" className="primary-link">
                  Cập nhật nhu cầu
                </Link>
              </div>
            )}

            {!loading &&
              !error &&
              items.map((item) => (
                <Link
                  key={item.id}
                  to={`/jobs/${item.id}`}
                  className="user-job-card"
                >
                  <div className="job-logo">
                    {item.companyLogoUrl ? (
                      <img src={item.companyLogoUrl} alt={item.companyName || "Logo"} />
                    ) : (
                      <span>{(item.companyName || "C")[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="match-score-row">
                      <span>{formatMatchScore(item)}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.companyName || "Đang cập nhật"}</p>
                    <div className="job-meta">
                      <span>{formatSalary(item)}</span>
                      <span>{item.location || "Toàn quốc"}</span>
                    </div>
                    {Array.isArray(item.matchReasons) && item.matchReasons.length > 0 ? (
                      <div className="match-reasons">
                        {item.matchReasons.slice(0, 3).map((reason) => (
                          <span key={reason}>{reason}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
          </section>

          <aside className="promo-card">
            <div className="promo-illustration" />
            <h3>Tối ưu nhu cầu tìm việc</h3>
            <p>Chỉnh tiêu chí để gợi ý sát hơn với vị trí bạn muốn</p>
            <Link to="/user/job-needs" className="outline-btn">
              Cập nhật ngay
            </Link>
          </aside>
        </div>
      </div>

      <FloatingActions />
    </div>
  );
};

export default MatchingJobs;
