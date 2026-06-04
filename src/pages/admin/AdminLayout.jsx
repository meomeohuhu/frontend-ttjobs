import { Link, NavLink } from "react-router-dom";
import HomeHeader from "../../sections/HomeHeader.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const navItems = [
  { label: "Tổng quan", to: "/admin/dashboard" },
  { label: "Tài khoản", to: "/admin/users" },
  { label: "Doanh nghiệp", to: "/admin/companies" },
  { label: "Duyệt doanh nghiệp", to: "/admin/company-approvals" },
  { label: "Tin tuyển dụng", to: "/admin/jobs" },
  { label: "Diễn đàn", to: "/admin/forum" },
  { label: "Email hệ thống", to: "/admin/email-campaigns" },
  { label: "AI Monitoring", to: "/admin/ai-monitoring" },
  { label: "Analytics", to: "/admin/analytics" },
  { label: "Báo cáo", to: "/admin/reports" },
  { label: "Nhật ký", to: "/admin/audit-logs" }
];

const AdminLayout = ({ title, description, children, actions }) => {
  return (
    <div className="admin-shell">
      <HomeHeader />
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <Link to="/admin/dashboard" className="admin-sidebar-brand">
            <span>TT</span>
            <div>
              <strong>Admin</strong>
              <small>Không gian quản trị</small>
            </div>
          </Link>

          <nav className="admin-sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-sidebar-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <p>Cổng quản trị</p>
              <h1>{title}</h1>
              {description ? <span>{description}</span> : null}
            </div>

            <div className="admin-topbar-actions">
              {actions || (
                <Link to="/admin/reports" className="admin-primary-action">
                  Xuất báo cáo
                </Link>
              )}
            </div>
          </header>

          {children}
        </main>
      </div>
      <FloatingActions />
    </div>
  );
};

export default AdminLayout;
