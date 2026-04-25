import { Link, NavLink } from "react-router-dom";
import HomeHeader from "../../sections/HomeHeader.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const navItems = [
  { label: "Dashboard", to: "/recruiter/dashboard" },
  { label: "Lịch sử", to: "/recruiter/history" },
  { label: "Công ty", to: "/recruiter/companies" },
  { label: "Tin tuyển dụng", to: "/recruiter/jobs" },
  { label: "Ứng viên", to: "/recruiter/applications" }
];

const RecruiterLayout = ({ title, description, children, actions }) => {
  return (
    <div className="recruiter-shell">
      <HomeHeader />
      <div className="recruiter-workspace">
        <aside className="recruiter-sidebar">
          <Link to="/recruiter/dashboard" className="recruiter-sidebar-brand">
            <span>TT</span>
            <div>
              <strong>Recruiter</strong>
              <small>Workspace</small>
            </div>
          </Link>
          <nav className="recruiter-sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `recruiter-sidebar-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="recruiter-main">
          <header className="recruiter-topbar">
            <div>
              <p>Recruiter Portal</p>
              <h1>{title}</h1>
              {description ? <span>{description}</span> : null}
            </div>
            <div className="recruiter-topbar-actions">
              {actions || (
                <Link to="/recruiter/jobs" className="recruiter-primary-action">
                  Tạo job
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

export default RecruiterLayout;
