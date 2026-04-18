import { useState } from "react";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import { Link } from "react-router-dom";
import FloatingActions from "../sections/FloatingActions.jsx";
const CreateCV = () => {
  const [template, setTemplate] = useState("IT");
  const [form, setForm] = useState({
    name: "Nguyễn Văn A",
    role: "Nhân viên IT",
    email: "nguyenvana@example.com",
    phone: "090 123 4567",
    objective:
      "Tìm kiếm vị trí phát triển phần mềm front-end trong môi trường năng động, sáng tạo.",
    experience:
      "5 năm kinh nghiệm phát triển ứng dụng web với React, Node.js và hệ sinh thái JavaScript.",
    skills: "React, JavaScript, TypeScript, HTML/CSS, Git, Agile",
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
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
                <label>Email</label>
                <div className="input-wrap">
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
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
                <label>Kỹ năng chính</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    value={form.skills}
                    onChange={handleChange("skills")}
                  />
                </div>
              </div>

              <div className="page-actions">
                <button className="primary-btn" type="button">
                  Xem trước CV
                </button>
                <button className="ghost-btn" type="button">
                  Tải xuống PDF
                </button>
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
