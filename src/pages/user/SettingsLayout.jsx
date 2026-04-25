import { Link } from "react-router-dom";
import HomeHeader from "../../sections/HomeHeader.jsx";
import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const settingsNav = [
  { label: "Thông tin cá nhân", to: "/user/profile" },
  { label: "Nhu cầu công việc", to: "/user/job-needs" },
  { label: "Đổi mật khẩu", to: "/user/password" },
  { label: "Thông báo", to: "/user/notifications" }
];

const SettingsLayout = ({ title, description, activePath, children, aside }) => {
  return (
    <div className="user-page-shell">
      <HomeHeader />
      <AnnouncementBar />

      <div className="user-page-container">
        <div className="settings-layout">
          <aside className="settings-sidebar">
            <div className="settings-sidebar-card">
              <p className="settings-sidebar-kicker">Cài đặt tài khoản</p>
              <h2>Quản lý hồ sơ</h2>
              <p>
                Chỉnh sửa thông tin cá nhân, cập nhật bảo mật và cấu hình thông báo cho tài khoản
                TTJobs của bạn.
              </p>
            </div>

            <nav className="settings-nav" aria-label="Điều hướng cài đặt">
              {settingsNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`settings-nav-link ${activePath === item.to ? "active" : ""}`}
                >
                  <span>{item.label}</span>
                  <span className="settings-nav-caret" />
                </Link>
              ))}
            </nav>
          </aside>

          <section className="settings-content">
            <div className="settings-hero">
              <div>
                <p className="settings-hero-kicker">Thiết lập</p>
                <h1>{title}</h1>
                <p>{description}</p>
              </div>
            </div>

            {children}
          </section>

          {aside ? <aside className="settings-rail">{aside}</aside> : null}
        </div>
      </div>

      <FloatingActions />
    </div>
  );
};

export default SettingsLayout;
