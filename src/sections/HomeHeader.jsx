import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Việc làm", to: "/" },
  { label: "Tạo CV", to: "/create-cv" },
  { label: "Công cụ" },
  { label: "Cẩm nang nghề nghiệp", to: "/career-guide" },
  { label: "TopCV Pro" }
];

const HomeHeader = () => {
  return (
    <header className="topcv-header">
      <div className="topcv-logo">
        <div className="logo-mark">
          <div className="logo-text">topcv</div>
          <div className="logo-dot" />
        </div>
        <span className="logo-tagline">Tiếp lợi thế - Nối thành công</span>
      </div>
      <nav className="topcv-nav">
        {navItems.map((item) => {
          if (item.to) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                {item.label}
                {item.label === "Việc làm" ? <span className="nav-caret" /> : null}
              </NavLink>
            );
          }

          return (
            <button className="nav-item" key={item.label} type="button">
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="topcv-actions">
        <div className="icon-group">
          <button className="icon-btn" type="button" aria-label="Thông báo">
            <span className="icon-bell" />
            <span className="icon-badge">1</span>
          </button>
          <button className="icon-btn" type="button" aria-label="Tin nhắn">
            <span className="icon-chat" />
          </button>
          <button className="icon-btn" type="button" aria-label="Tài khoản">
            <span className="icon-user" />
          </button>
        </div>
        <div className="recruiter-link">
          <span>Bạn là nhà tuyển dụng?</span>
          <Link to="/register">Đăng tuyển ngay</Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
