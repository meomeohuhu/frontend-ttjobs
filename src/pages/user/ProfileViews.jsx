import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const ProfileViews = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [profileResult, applicationResult] = await Promise.allSettled([
        apiRequest("/api/users/me"),
        apiRequest("/api/applications/me")
      ]);
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (applicationResult.status === "fulfilled" && Array.isArray(applicationResult.value)) {
        setApplications(applicationResult.value);
      }
    };
    loadData();
  }, []);

  const completionItems = [
    { label: "Thông tin cá nhân", done: Boolean(profile?.name && profile?.phone) },
    { label: "CV", done: Boolean(profile?.cvUrl || profile?.cvText) },
    { label: "Kỹ năng", done: Array.isArray(profile?.skills) && profile.skills.length > 0 },
    { label: "Kinh nghiệm", done: profile?.experienceYears !== null && profile?.experienceYears !== undefined }
  ];
  const completion = Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100);

  return (
    <SettingsLayout
      title="Nhà tuyển dụng xem hồ sơ"
      description="Tổng quan mức độ sẵn sàng của hồ sơ trước khi recruiter xem và liên hệ."
      activePath="/user/profile-views"
    >
      <section className="profile-view-grid">
        <div className="settings-card profile-view-score">
          <p>Độ hoàn thiện hồ sơ</p>
          <strong>{completion}%</strong>
          <span>{applications.length} hồ sơ đã ứng tuyển có thể được recruiter xem.</span>
        </div>

        <div className="settings-card">
          <h2>Checklist hiển thị</h2>
          <ul className="profile-check-list">
            {completionItems.map((item) => (
              <li key={item.label} data-done={item.done ? "true" : "false"}>
                <strong>{item.label}</strong>
                <span>{item.done ? "Đã có" : "Thiếu"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="settings-card wide">
          <h2>Lưu ý</h2>
          <p className="settings-state">
            Backend hiện chưa có tracking lượt xem hồ sơ theo từng recruiter. Trang này hiển thị trạng thái sẵn sàng
            và số hồ sơ ứng tuyển đang có; khi thêm API profile views, danh sách lượt xem sẽ nối vào đây.
          </p>
        </div>
      </section>
    </SettingsLayout>
  );
};

export default ProfileViews;
