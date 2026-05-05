import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const RecruiterConnections = () => {
  const [conversations, setConversations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [conversationData, applicationData] = await Promise.allSettled([
          apiRequest("/api/conversations"),
          apiRequest("/api/applications/me")
        ]);
        setConversations(conversationData.status === "fulfilled" && Array.isArray(conversationData.value) ? conversationData.value : []);
        setApplications(applicationData.status === "fulfilled" && Array.isArray(applicationData.value) ? applicationData.value : []);
      } catch (err) {
        setError(err.message || "Không thể tải kết nối nhà tuyển dụng");
      }
    };
    loadData();
  }, []);

  return (
    <SettingsLayout title="Nhà tuyển dụng muốn kết nối với bạn" description="Theo dõi hội thoại và hồ sơ ứng tuyển có thể dẫn đến trao đổi với recruiter." activePath="/user/recruiter-connections">
      {error ? <p className="settings-state error">{error}</p> : null}
      <section className="connection-grid">
        <div className="settings-card">
          <h2>Tin nhắn recruiter</h2>
          {conversations.length === 0 ? <p className="settings-state">Chưa có hội thoại mới.</p> : null}
          {conversations.map((item) => (
            <Link className="connection-row" key={item.id} to={`/messages?conversationId=${item.id}`}>
              <strong>{item.title || item.companyName || "Hội thoại tuyển dụng"}</strong>
              <span>{item.lastMessage || "Mở hội thoại để phản hồi nhà tuyển dụng."}</span>
            </Link>
          ))}
        </div>
        <div className="settings-card">
          <h2>Ứng tuyển đang mở</h2>
          {applications.length === 0 ? <p className="settings-state">Bạn chưa có hồ sơ ứng tuyển.</p> : null}
          {applications.slice(0, 8).map((item) => (
            <div className="connection-row" key={item.id}>
              <strong>{item.jobTitle}</strong>
              <span>{item.companyName} · {item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </SettingsLayout>
  );
};

export default RecruiterConnections;
