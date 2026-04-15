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
        const data = await apiRequest("/api/recommendations/cv", {
          method: "POST",
          body: JSON.stringify({})
        });
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
              Những công việc phù hợp nhất với kỹ năng và CV hiện tại của bạn.
            </p>

            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && error && <p>{error}</p>}
            {!loading && !error && items.length === 0 && (
              <div className="empty-state">
                <div className="empty-illustration" />
                <p>Chưa có gợi ý phù hợp. Hãy cập nhật CV để nhận đề xuất.</p>
                <Link to="/" className="primary-link">
                  Cập nhật CV
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
                    <h3>{item.title}</h3>
                    <p>{item.companyName || "Đang cập nhật"}</p>
                    <div className="job-meta">
                      <span>{formatSalary(item)}</span>
                      <span>{item.location || "Toàn quốc"}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </section>

          <aside className="promo-card">
            <div className="promo-illustration" />
            <h3>Sở hữu CV độc đáo</h3>
            <p>Giúp bạn nổi bật trước nhà tuyển dụng</p>
            <button type="button">Tìm hiểu ngay</button>
          </aside>
        </div>
      </div>

      <FloatingActions />
    </div>
  );
};

export default MatchingJobs;
