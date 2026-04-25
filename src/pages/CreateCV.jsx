import { useState, useEffect } from "react";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import { Link } from "react-router-dom";
import FloatingActions from "../sections/FloatingActions.jsx";
import { cvService } from "../services/cvService.js";

const CreateCV = () => {
  const [template, setTemplate] = useState("IT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    objective: "",
    experience: "",
    skills: "",
    cvUrl: null,
  });

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await cvService.getMyCvProfile();
        setForm({
          name: data.name || "",
          role: data.cvRole || "",
          email: data.email || "",
          phone: data.phone || "",
          objective: data.cvObjective || "",
          experience: data.cvExperienceHighlights || "",
          skills: data.skills ? data.skills.join(", ") : "",
          cvUrl: data.cvUrl || null,
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const skillsArray = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      await cvService.updateCvProfile({
        name: form.name,
        phone: form.phone,
        cvRole: form.role,
        cvObjective: form.objective,
        cvExperienceHighlights: form.experience,
        skills: skillsArray,
      });
      setSuccess("Đã lưu thông tin CV thành công!");
    } catch (err) {
      setError(err.message || "Không thể lưu thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    
    // If it's a PDF or Image, we can create a local preview URL
    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setLocalPreviewUrl(url);
    } else {
      setLocalPreviewUrl(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const data = await cvService.uploadCvFile(selectedFile);
      setForm((prev) => ({ ...prev, cvUrl: data.cvUrl }));
      setSuccess("Đã tải CV lên Cloudinary thành công!");
      setSelectedFile(null);
      setLocalPreviewUrl(null);
    } catch (err) {
      setError(err.message || "Tải file thất bại");
    } finally {
      setLoading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setLocalPreviewUrl(null);
  };

  return (
    <div className="page-shell">
      <HomeHeader />
      <main className="page-content">
        <section className="page-hero">
          <div className="page-intro">
            <div>
              <span className="feature-pill">Tạo CV chuyên nghiệp</span>
              <h1>Soạn CV đẹp, đầy đủ và sẵn sàng ứng tuyển ngay.</h1>
              <p>
                Lựa chọn mẫu CV hiện đại, điền thông tin kỹ năng, kinh nghiệm và
                tải về bản hoàn chỉnh trong vài phút. Giao diện được thiết kế
                đồng bộ với phong cách TopCV của trang chủ.
              </p>
              <div className="page-actions">
                <button className="primary-btn" type="button">
                  Bắt đầu tạo CV
                </button>
                <Link className="ghost-btn" to="#">
                  Xem mẫu CV
                </Link>
              </div>
            </div>
            <div className="page-card">
              <h2>Hướng dẫn nhanh</h2>
              <p>
                Các bước đơn giản để hoàn thành CV chuẩn nhà tuyển dụng và gây ấn
                tượng với bộ hồ sơ của bạn.
              </p>
              <ul className="feature-list">
                <li>Tạo thông tin cá nhân và trình độ rõ ràng</li>
                <li>Chọn mẫu thiết kế phù hợp với ngành nghề</li>
                <li>Tự động gợi ý kỹ năng và mô tả kinh nghiệm</li>
                <li>Xem trước trực tiếp và tải file ngay</li>
              </ul>
            </div>
          </div>

          <div className="card-grid">
            <div className="page-card">
              <h3>Mẫu CV dành cho ứng viên IT</h3>
              <p>
                Mẫu bố cục hiện đại, rõ ràng thông tin kỹ năng và dự án. Phù hợp với
                những hồ sơ cần nhấn mạnh năng lực kỹ thuật.
              </p>
            </div>
            <div className="page-card">
              <h3>Mẫu CV dành cho Sales & Marketing</h3>
              <p>
                Thiết kế cân đối giúp tôn lên thành tích, phong cách trình bày nổi
                bật phù hợp với nhà tuyển dụng ngành dịch vụ.
              </p>
            </div>
            <div className="page-card">
              <h3>Mẫu CV tối giản cho lãnh đạo</h3>
              <p>
                Ưu tiên thông tin hành chính và thành tựu quản lý, giúp bạn tạo ấn tượng
                chuyên nghiệp ngay từ lần đọc đầu tiên.
              </p>
            </div>
          </div>
        </section>

        <section className="create-cv-stage">
          <div className="create-cv-grid">
            <div className="page-card form-card">
               <div className="form-header">
                <span className="feature-pill">Nhập thông tin CV</span>
                <h2>Điền nhanh, xem trước và xuất CV ngay.</h2>
                <p>
                  Cập nhật thông tin cá nhân, mục tiêu nghề nghiệp, kinh nghiệm và kỹ
                  năng ngay trên cùng một giao diện.
                </p>
              </div>

              {error && <div className="form-alert error">{error}</div>}
              {success && <div className="form-alert success">{success}</div>}
              {loading && <div className="form-alert info">Đang xử lý...</div>}

              <div className="form-field">
                <label>Họ và tên</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Vị trí ứng tuyển</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    value={form.role}
                    onChange={handleChange("role")}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Email (Không thể thay đổi)</label>
                <div className="input-wrap">
                  <input
                    type="email"
                    value={form.email}
                    disabled
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Số điện thoại</label>
                <div className="input-wrap">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Mục tiêu nghề nghiệp</label>
                <div className="input-wrap">
                  <textarea
                    value={form.objective}
                    onChange={handleChange("objective")}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Kinh nghiệm nổi bật</label>
                <div className="input-wrap">
                  <textarea
                    value={form.experience}
                    onChange={handleChange("experience")}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Kỹ năng chính (Phân cách bằng dấu phẩy)</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    value={form.skills}
                    onChange={handleChange("skills")}
                  />
                </div>
              </div>

              <div className="page-actions">
                <button 
                  className="primary-btn" 
                  type="button" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu thông tin CV"}
                </button>
              </div>

              <div className="upload-section" style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px dashed #e2e8f0" }}>
                <span className="feature-pill">Hoặc tải file từ máy tính</span>
                <h3>Tải lên CV có sẵn</h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "8px 0 16px" }}>
                  Hệ thống hỗ trợ định dạng PDF, DOC, DOCX (Tối đa 5MB)
                </p>
                
                <div className="upload-box" style={{ position: "relative" }}>
                  {!selectedFile ? (
                    <>
                      <input
                        type="file"
                        id="cv-upload-input"
                        hidden
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={handleFileSelect}
                      />
                      <label 
                        htmlFor="cv-upload-input" 
                        className="ghost-btn"
                        style={{ width: "100%", justifyContent: "center", cursor: "pointer", border: "2px dashed #cbd5e1" }}
                      >
                        Chọn file từ máy tính
                      </label>
                    </>
                  ) : (
                    <div className="preview-container" style={{ padding: "16px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>📄 {selectedFile.name}</span>
                        <button onClick={cancelSelection} className="ghost-btn" style={{ padding: "4px 8px", fontSize: "12px", color: "#ef4444" }}>Hủy</button>
                      </div>

                      {localPreviewUrl && selectedFile.type === "application/pdf" && (
                        <iframe 
                          src={localPreviewUrl} 
                          style={{ width: "100%", height: "300px", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "12px" }} 
                          title="Local PDF Preview"
                        />
                      )}

                      {localPreviewUrl && selectedFile.type.startsWith("image/") && (
                        <img 
                          src={localPreviewUrl} 
                          alt="Local Preview" 
                          style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px", marginBottom: "12px" }} 
                        />
                      )}

                      <button 
                        className="primary-btn" 
                        style={{ width: "100%", margin: 0 }}
                        onClick={handleConfirmUpload}
                        disabled={loading}
                      >
                        {loading ? "Đang tải lên..." : "Xác nhận tải lên Cloudinary"}
                      </button>
                    </div>
                  )}
                </div>

                {form.cvUrl && !selectedFile && (
                  <div style={{ marginTop: "16px", padding: "12px", background: "#f0fdf4", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>✅</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#166534" }}>CV của bạn hiện đang ở trên hệ thống</p>
                      <a href={form.cvUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#15803d" }}>Xem CV trên Cloudinary</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="page-card preview-card">
              <div className="preview-header">
                <span className="template-badge">Mẫu CV: {template}</span>
                <h2>{form.name}</h2>
                <p className="preview-role">{form.role}</p>
              </div>

              <div className="preview-section">
                <h3>Thông tin liên hệ</h3>
                <p>
                  {form.email} · {form.phone}
                </p>
              </div>

              <div className="preview-section">
                <h3>Mục tiêu nghề nghiệp</h3>
                <p>{form.objective}</p>
              </div>

              <div className="preview-section">
                <h3>Kinh nghiệm</h3>
                <p>{form.experience}</p>
              </div>

              <div className="preview-section">
                <h3>Kỹ năng</h3>
                <p>{form.skills}</p>
              </div>

              <div className="template-list">
                {[
                  { id: "IT", label: "IT" },
                  { id: "Sales", label: "Sales" },
                  { id: "Leader", label: "Lãnh đạo" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`template-option ${template === option.id ? "active" : ""}`}
                    onClick={() => setTemplate(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCV;
