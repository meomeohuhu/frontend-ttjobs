import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../lib/api.js";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });
      if (typeof data === "string") {
        localStorage.setItem("ttjobs_token", data);
      } else if (data && data.token) {
        localStorage.setItem("ttjobs_token", data.token);
      }
      setStatus({ loading: false, error: "", success: "Đăng nhập thành công." });
      navigate("/jobs", { replace: true });
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
          <h1>Quay lại để tiếp tục hành trình nghề nghiệp.</h1>
          <p>
            Mỗi lần đăng nhập là một cơ hội mới. Kết nối CV, tìm job phù hợp và
            mở khóa lộ trình phát triển cá nhân hóa.
          </p>
          <div className="trust-grid">
            <div className="trust-card">AI Matching</div>
            <div className="trust-card">CV Snapshot</div>
            <div className="trust-card">Recruiter Ready</div>
          </div>
        </div>

        <div className="auth-aside">
          <div>Hôm nay bạn muốn ứng tuyển gì?</div>
          <span>TTJobs Career Lab</span>
        </div>
      </section>

      <section className="auth-right">
        <div className="form-card">
          <div className="form-header">
            <h2>Đăng nhập</h2>
            <p>Chào mừng trở lại, hãy chọn mục tiêu hôm nay.</p>
          </div>

          <form onSubmit={handleSubmit}>
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
                  placeholder="••••••••"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <label>
                <input type="checkbox" /> Ghi nhớ tôi
              </label>
              <span>Quên mật khẩu?</span>
            </div>

            {status.error && <div className="form-alert error">{status.error}</div>}
            {status.success && <div className="form-alert success">{status.success}</div>}

            <button className="primary-btn" type="submit" disabled={status.loading}>
              {status.loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="switch-link">
            Chưa có tài khoản? <Link to="/register">Tạo mới ngay</Link>
          </div>

          <div className="decorative-lines" />
        </div>
      </section>
    </div>
  );
};

export default Login;
