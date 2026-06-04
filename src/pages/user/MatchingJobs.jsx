import { useEffect, useMemo, useState } from "react";
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

  if (min && max) return `${min} - ${max} ${currency}`;
  if (salary) return `${salary} ${currency}`;
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

  const groupedItems = useMemo(() => {
    const groups = {
      strong: { title: "Rất phù hợp", items: [] },
      consider: { title: "Có thể cân nhắc", items: [] },
      needsMore: { title: "Cần bổ sung nhu cầu", items: [] }
    };
    items.forEach((item) => {
      const score = Number(item.matchScore || 0);
      if (score >= 80) groups.strong.items.push(item);
      else if (score >= 60) groups.consider.items.push(item);
      else groups.needsMore.items.push(item);
    });
    return Object.entries(groups)
      .map(([key, group]) => ({ key, ...group }))
      .filter((group) => group.items.length > 0);
  }, [items]);

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

  const recordRecommendationEvent = async (jobId, eventType) => {
    if (!jobId) return;
    try {
      await apiRequest(`/api/recommendations/jobs/${jobId}/event?eventType=${encodeURIComponent(eventType)}`, {
        method: "POST"
      });
    } catch {
      // Interaction logging must not block the candidate flow.
    }
  };

  const handleJobClick = (jobId) => {
    recordRecommendationEvent(jobId, "recommendation_clicked");
  };

  const handleIgnoreJob = (jobId) => {
    setItems((current) => current.filter((item) => item.id !== jobId));
    recordRecommendationEvent(jobId, "candidate_ignored");
  };

  return (
    <div className="user-page-shell">
      <HomeHeader />
      <AnnouncementBar />

      <div className="user-page-container">
        <div className="user-grid">
          <section className="user-card">
            <h2>Việc làm phù hợp</h2>
            <p className="muted">
              Trung tâm gợi ý dựa trên nhu cầu đã lưu: vị trí, khu vực, ngành nghề, mức lương và kỹ năng ưu tiên.
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

            {!loading && !error && groupedItems.map((group) => (
              <div className="matching-group" key={group.key}>
                <h3>{group.title}</h3>
                {group.items.map((item) => (
                  <div key={item.id} className="matching-card-wrap">
                    <Link to={`/jobs/${item.id}`} className="user-job-card" onClick={() => handleJobClick(item.id)}>
                    <div className="job-logo">
                      {item.imageUrl || item.companyLogoUrl ? (
                        <img src={item.imageUrl || item.companyLogoUrl} alt={item.title || item.companyName || "Logo"} />
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
                    <button type="button" className="outline-btn small matching-ignore-btn" onClick={() => handleIgnoreJob(item.id)}>
                    Bỏ qua
                  </button>
                  </div>
                ))}
              </div>
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
