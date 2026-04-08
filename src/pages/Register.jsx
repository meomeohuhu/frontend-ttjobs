import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../lib/api.js";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus({ loading: false, error: "Mật khẩu xác nhận không khớp.", success: "" });
      return;
    }
    setStatus({ loading: true, error: "", success: "" });
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "CANDIDATE"
        })
      });
      setStatus({ loading: false, error: "", success: "Tạo tài khoản thành công." });
      navigate("/login", { replace: true });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: "" });
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-left">
        <div className="brand">
          <div className="brand-mark">TJ</div>
          <span>TTJobs</span>
        </div>

        <div className="auth-hero">
          <h1>Khởi tạo hồ sơ, mở khóa cơ hội dành riêng cho bạn.</h1>
          <p>
            Thiết lập nhanh một tài khoản để lưu CV, theo dõi ứng tuyển và
            nhận gợi ý việc làm theo kỹ năng.
          </p>
          <div className="trust-grid">
            <div className="trust-card">CV Library</div>
            <div className="trust-card">One-Click Apply</div>
            <div className="trust-card">Live Status</div>
          </div>
        </div>

        <div className="auth-aside">
          <div>Chỉ mất 60 giây để bắt đầu.</div>
          <span>TTJobs Growth</span>
        </div>
      </section>

      <section className="auth-right">
        <div className="form-card">
          <div className="form-header">
            <h2>Tạo tài khoản</h2>
            <p>Thông tin ngắn gọn nhưng đủ mạnh để bắt đầu.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Họ và tên</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 20a8 8 0 0 1 16 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <input
                  placeholder="Nguyễn Văn A"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Email</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16v12H4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 7l8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <input
                  placeholder="name@email.com"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Mật khẩu</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 10h12v9H6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 10V7a3 3 0 0 1 6 0v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <input
                  placeholder="Tối thiểu 8 ký tự"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Xác nhận mật khẩu</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 10h12v9H6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 10V7a3 3 0 0 1 6 0v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <input
                  placeholder="Nhập lại mật khẩu"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <label>
                <input type="checkbox" /> Tôi đồng ý với điều khoản sử dụng
              </label>
            </div>

            {status.error && <div className="form-alert error">{status.error}</div>}
            {status.success && <div className="form-alert success">{status.success}</div>}

            <button className="primary-btn" type="submit" disabled={status.loading}>
              {status.loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="switch-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>

          <div className="decorative-lines" />
        </div>
      </section>
    </div>
  );
};

export default Register;
