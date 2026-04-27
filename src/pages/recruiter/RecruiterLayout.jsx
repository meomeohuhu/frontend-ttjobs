import { Link, NavLink } from "react-router-dom";
import HomeHeader from "../../sections/HomeHeader.jsx";
import FloatingActions from "../../sections/FloatingActions.jsx";

const text = {
  history: "L\u1ecbch s\u1eed",
  company: "C\u00f4ng ty",
  jobs: "Tin tuy\u1ec3n d\u1ee5ng",
  applications: "\u1ee8ng vi\u00ean",
  searchCv: "T\u00ecm CV",
  interviews: "Ph\u1ecfng v\u1ea5n",
  campaigns: "Chi\u1ebfn d\u1ecbch",
  reports: "B\u00e1o c\u00e1o",
  createJob: "T\u1ea1o job"
};

const navItems = [
  { label: "Dashboard", to: "/recruiter/dashboard" },
  { label: text.history, to: "/recruiter/history" },
  { label: text.company, to: "/recruiter/companies" },
  { label: text.jobs, to: "/recruiter/jobs" },
  { label: text.applications, to: "/recruiter/applications" },
  { label: text.searchCv, to: "/recruiter/candidates" },
  { label: text.interviews, to: "/recruiter/interviews" },
  { label: text.campaigns, to: "/recruiter/campaigns" },
  { label: text.reports, to: "/recruiter/reports" }
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
                  {text.createJob}
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
