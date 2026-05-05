import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, downloadApiFile } from "../../lib/api.js";
import SettingsLayout from "./SettingsLayout.jsx";

const formatDate = (value) => {
  if (!value) return "Chưa rõ thời gian";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
};

const MyCv = () => {
  const [profile, setProfile] = useState(null);
  const [uploadedCvs, setUploadedCvs] = useState([]);
  const [cvText, setCvText] = useState("");
  const [skills, setSkills] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const builderCvs = useMemo(() => {
    if (!profile || !profile.cvRole && !profile.cvObjective && !profile.cvExperienceHighlights) return [];
    return [{
      id: "builder-main",
      title: profile.cvRole || "CV tạo trên hệ thống",
      subtitle: profile.name || profile.email || "Hồ sơ TTJobs",
      description: profile.cvObjective || profile.cvExperienceHighlights || "CV builder đã có dữ liệu.",
      skills: Array.isArray(profile.skills) ? profile.skills.slice(0, 6) : []
    }];
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [profileData, cvList] = await Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/users/me/cvs").catch(() => [])
      ]);
      setProfile(profileData);
      setCvText(profileData?.cvText || "");
      setUploadedCvs(Array.isArray(cvList) ? cvList : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách CV");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uploadCv = async () => {
    if (!file) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest("/api/users/me/cv", { method: "POST", body: formData, headers: {} });
      setMessage("Đã tải CV lên và trích xuất nội dung.");
      setFile(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể tải CV lên");
    } finally {
      setSaving(false);
    }
  };

  const deleteUploadedCv = async (cv) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (cv?.id) {
        await apiRequest(`/api/users/me/cvs/${cv.id}`, { method: "DELETE" });
      } else {
        await apiRequest("/api/users/me/cv", { method: "DELETE" });
      }
      setMessage("Đã xóa CV đã tải lên.");
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể xóa CV");
    } finally {
      setSaving(false);
    }
  };

  const parseSkills = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await apiRequest("/api/users/me/cv/parse-skills", { method: "POST" });
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể phân tích kỹ năng từ CV");
    } finally {
      setSaving(false);
    }
  };

  const downloadCv = async (cv) => {
    setError("");
    try {
      const fallbackName = cv?.fileName && cv.fileName.includes(".") ? cv.fileName : "ttjobs-cv.pdf";
      const path = cv?.id ? `/api/users/me/cvs/${cv.id}/stream` : "/api/users/me/cv-stream";
      await downloadApiFile(path, fallbackName);
    } catch (err) {
      setError(err.message || "Không thể tải CV");
    }
  };

  const uploadFallback = uploadedCvs.length === 0 && profile?.cvUrl
    ? [{ id: "", cvUrl: profile.cvUrl, fileName: "CV đã tải lên", uploadedAt: null, current: true }]
    : uploadedCvs;

  return (
    <SettingsLayout
      title="CV của tôi"
      description="Quản lý riêng CV tạo trên hệ thống và CV tải lên từ file."
      activePath="/user/cv"
      wide
    >
      <div className="cv-library">
        {loading ? <p className="settings-state">Đang tải CV...</p> : null}
        {error ? <p className="settings-state error">{error}</p> : null}
        {message ? <p className="settings-state success">{message}</p> : null}

        <section className="cv-library-panel">
          <div className="cv-library-heading">
            <h2>CV đã tạo trên TTJobs</h2>
            <Link className="settings-primary-button" to="/create-cv">+ Tạo CV</Link>
          </div>

          {builderCvs.length === 0 ? (
            <div className="cv-empty-state builder">
              <span className="cv-empty-icon" />
              <p>Chưa có CV nào được tạo.</p>
            </div>
          ) : (
            <div className="cv-list">
              {builderCvs.map((cv) => (
                <article className="cv-list-item" key={cv.id}>
                  <div className="cv-file-icon">CV</div>
                  <div>
                    <h3>{cv.title}</h3>
                    <p>{cv.subtitle}</p>
                    <span>{cv.description}</span>
                    {cv.skills.length ? (
                      <div className="settings-chip-list compact">
                        {cv.skills.map((skill) => <span key={skill}>{skill}</span>)}
                      </div>
                    ) : null}
                  </div>
                  <Link className="settings-secondary-button" to="/create-cv">Chỉnh sửa</Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="cv-library-panel">
          <div className="cv-library-heading">
            <h2>CV đã tải lên TTJobs</h2>
            <label className="settings-primary-button cv-upload-trigger">
              Tải CV lên
              <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
          </div>

          {file ? (
            <div className="cv-upload-pending">
              <span>Đã chọn: <strong>{file.name}</strong></span>
              <button type="button" disabled={saving} onClick={uploadCv}>Xác nhận tải lên</button>
            </div>
          ) : null}

          {uploadFallback.length === 0 ? (
            <div className="cv-empty-state upload">
              <span className="cv-empty-icon" />
              <p>Chưa có CV nào được tải lên.</p>
            </div>
          ) : (
            <div className="cv-list">
              {uploadFallback.map((cv) => (
                <article className="cv-list-item" key={cv.id || cv.cvUrl}>
                  <div className="cv-file-icon">PDF</div>
                  <div>
                    <h3>{cv.fileName || "CV đã tải lên"}</h3>
                    <p>{formatDate(cv.uploadedAt)}</p>
                    <span>{cv.current ? "Đang dùng làm CV chính" : "CV đã lưu trong danh sách"}</span>
                  </div>
                  <div className="cv-list-actions">
                    {cv.cvUrl ? <button type="button" className="settings-secondary-button" onClick={() => downloadCv(cv)}>Xem CV</button> : null}
                    <button type="button" className="settings-secondary-button danger" disabled={saving} onClick={() => deleteUploadedCv(cv)}>Xóa</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="cv-text-panel">
          <div>
            <h2>Nội dung CV đã trích xuất</h2>
            <button type="button" className="settings-secondary-button" disabled={saving || !profile?.cvUrl} onClick={parseSkills}>Gợi ý kỹ năng</button>
          </div>
          <textarea readOnly value={cvText || "Chưa có nội dung CV. Hãy tải CV lên hoặc trích xuất lại."} rows="8" />
          {skills.length ? (
            <div className="settings-chip-list">
              {skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          ) : null}
        </section>
      </div>
    </SettingsLayout>
  );
};

export default MyCv;
