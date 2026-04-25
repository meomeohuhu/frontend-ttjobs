import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatDate, formatNumber } from "./recruiterUtils.js";

const RecruiterHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/recruiter/activity?limit=50");
        if (active) setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Không thể tải lịch sử");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      active = false;
    };
  }, []);

  return (
    <RecruiterLayout title="Lịch sử hoạt động" description="Theo dõi các thao tác gần đây của recruiter.">
      {loading ? <p className="recruiter-state">Đang tải lịch sử...</p> : null}
      {!loading && error ? <p className="recruiter-state error">{error}</p> : null}
      {!loading && !error ? (
        <section className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>{formatNumber(activities.length)} sự kiện</h2>
          </header>
          <div className="recruiter-console-list">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="recruiter-console-item">
                <div className="recruiter-console-item-row">
                  <strong>{activity.title}</strong>
                  <small>{formatDate(activity.createdAt)}</small>
                </div>
                <p>{activity.details}</p>
                <small>
                  {activity.companyName || activity.jobTitle ? (
                    <>
                      {activity.companyName || "Công ty"}
                      {activity.jobTitle ? ` · ${activity.jobTitle}` : ""}
                    </>
                  ) : (
                    "Hoạt động gần đây"
                  )}
                </small>
              </div>
            )) : <p className="recruiter-empty">Chưa có lịch sử hoạt động.</p>}
          </div>
        </section>
      ) : null}
    </RecruiterLayout>
  );
};

export default RecruiterHistory;
