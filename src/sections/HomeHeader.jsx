import { Link } from "react-router-dom";

const navItems = ["Việc làm", "Tạo CV", "Công cụ", "Cẩm nang nghề nghiệp", "TopCV Pro"];

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
        {navItems.map((item) => (
          <button className="nav-item" key={item} type="button">
            {item}
            {item === "Việc làm" ? <span className="nav-caret" /> : null}
          </button>
        ))}
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
