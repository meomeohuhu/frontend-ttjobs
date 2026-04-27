import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const iconPaths = {
  jobs: (
    <>
      <path d="M10 6h4" />
      <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5v8A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5z" />
      <path d="M5 11h14" />
    </>
  ),
  cv: (
    <>
      <path d="M7 4h7l3 3v13H7z" />
      <path d="M14 4v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h5" />
    </>
  ),
  tools: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0 3 5.4l-6 6a2.2 2.2 0 0 1-3.1-3.1l6-6a4 4 0 0 0 .1-2.3z" />
      <path d="M5 19l3-3" />
    </>
  ),
  guide: (
    <>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z" />
      <path d="M5 5.5v15" />
      <path d="M9 7h6" />
      <path d="M9 11h5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  chat: (
    <>
      <path d="M20 14.5a3 3 0 0 1-3 3H8l-4 2.5V6.5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9" />
      <path d="M14 20a2.2 2.2 0 0 1-4 0" />
    </>
  ),
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="5" rx="2" />
      <rect x="13" y="11" width="7" height="9" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
    </>
  )
};

const HeaderIcon = ({ name, className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {iconPaths[name]}
  </svg>
);

const navItems = [
  { label: "Việc làm", to: "/", icon: "jobs" },
  { label: "Hồ sơ", to: "/create-cv", icon: "cv" },
  { label: "Công cụ", to: "#", icon: "tools" },
  { label: "Cẩm nang", to: "/career-guide", icon: "guide" },
  { label: "TTJobs", to: "#", icon: "sparkle" }
];

const menuSections = [
  {
    title: "Quản lý tìm việc",
    icon: "briefcase",
    items: [
      { label: "Việc làm đã lưu", to: "/user/saved" },
      { label: "Việc làm đã ứng tuyển", to: "/user/applied" },
      { label: "Việc làm phù hợp với bạn", to: "/user/matching" },
      { label: "Cài đặt gợi ý việc làm", actionLabel: "Cài đặt gợi ý việc làm" }
    ]
  },
  {
    title: "Quản lý CV & Cover letter",
    icon: "cv",
    items: [
      { label: "CV của tôi", actionLabel: "CV của tôi" },
      { label: "Cover Letter của tôi", actionLabel: "Cover Letter của tôi" },
      { label: "Nhà tuyển dụng muốn kết nối với bạn", actionLabel: "Kết nối với nhà tuyển dụng" },
      { label: "Nhà tuyển dụng xem hồ sơ", actionLabel: "Lượt xem hồ sơ" }
    ]
  },
  {
    title: "Cài đặt email & thông báo",
    icon: "bell",
    items: [
      { label: "Thiết lập email", to: "/user/notifications#email" },
      { label: "Thiết lập thông báo", to: "/user/notifications#notifications" }
    ]
  },
  {
    title: "Cá nhân & Bảo mật",
    icon: "shield",
    items: [
      { label: "Thông tin cá nhân", to: "/user/profile" },
      { label: "Đổi mật khẩu", to: "/user/password" }
    ]
  },
  {
    title: "Nâng cấp tài khoản",
    icon: "upgrade",
    items: [{ label: "Nâng cấp tài khoản", actionLabel: "Nâng cấp tài khoản" }]
  }
];

const HomeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    "Cài đặt email & thông báo": true,
    "Cá nhân & Bảo mật": true
  });
  const [profile, setProfile] = useState(null);
  const [recruiterUnreadCount, setRecruiterUnreadCount] = useState(0);
  const [recruiterApplicationCount, setRecruiterApplicationCount] = useState(0);

  const token = localStorage.getItem("ttjobs_token");
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (!isLoggedIn) {
      setProfile(null);
      setRecruiterUnreadCount(0);
      setRecruiterApplicationCount(0);
      setIsMenuOpen(false);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const data = await apiRequest("/api/users/me");
        if (active) {
          setProfile(data || null);
        }
      } catch (error) {
        if ((error?.message || "").toLowerCase().includes("unauthorized")) {
          localStorage.removeItem("ttjobs_token");
        }
        if (active) {
          setProfile(null);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const accountName = profile?.name || "Tài khoản";
  const accountEmail = profile?.email || "Đang tải...";
  const accountId = profile?.id ? `ID ${profile.id}` : "ID --";
  const avatarLabel = (accountName || "U").trim().charAt(0).toUpperCase();
  const role = String(profile?.role || "").toUpperCase();
  const isRecruiterRole = role === "RECRUITER" || role === "ADMIN";

  useEffect(() => {
    if (!isLoggedIn || !isRecruiterRole) {
      setRecruiterUnreadCount(0);
      setRecruiterApplicationCount(0);
      return;
    }

    let active = true;

    const loadRecruiterShortcuts = async () => {
      try {
        const [dashboardResult, unreadResult] = await Promise.allSettled([
          apiRequest("/api/recruiter/dashboard"),
          apiRequest("/api/notifications/unread-count"),
        ]);

        if (active && dashboardResult.status === "fulfilled") {
          setRecruiterApplicationCount(Number(dashboardResult.value?.newApplicationCount || 0));
        }
        if (active && unreadResult.status === "fulfilled") {
          setRecruiterUnreadCount(Number(unreadResult.value?.unreadCount || 0));
        }
      } catch {
        if (active) {
          setRecruiterUnreadCount(0);
          setRecruiterApplicationCount(0);
        }
      }
    };

    loadRecruiterShortcuts();

    return () => {
      active = false;
    };
  }, [isLoggedIn, isRecruiterRole]);

  const activeNavLabel = useMemo(() => {
    const path = location.pathname || "/";
    if (path === "/" || path.startsWith("/jobs") || path.startsWith("/companies")) {
      return "Việc làm";
    }
    if (path.startsWith("/create-cv") || path.startsWith("/user")) {
      return "Hồ sơ";
    }
    if (path.startsWith("/career-guide")) {
      return "Cẩm nang";
    }
    return "";
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("ttjobs_token");
    setProfile(null);
    setIsMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const openPlaceholder = (label) => {
    setIsMenuOpen(false);
    window.alert(`${label} đang được cập nhật`);
  };

  const toggleSection = (title) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <header className="topcv-header">
      <Link to="/" className="topcv-logo" aria-label="TTJobs trang chủ">
        <div className="logo-mark">
          <div className="logo-badge">
            <span>TT</span>
          </div>
          <div className="logo-copy">
            <div className="logo-text">TTJobs</div>
            <span className="logo-tagline">Việc làm theo gu của bạn</span>
          </div>
        </div>
      </Link>

      <nav className="topcv-nav">
        {navItems.map((item) => (
          <Link
            className="nav-item"
            key={item.label}
            to={item.to}
            aria-current={activeNavLabel === item.label ? "page" : undefined}
            data-active={activeNavLabel === item.label ? "true" : "false"}
          >
            <HeaderIcon name={item.icon} className="nav-icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="topcv-actions">
        <div className="icon-group">
          {isLoggedIn && !isRecruiterRole ? (
            <Link className="icon-btn user-quick-icon" to="/messages" aria-label="Tin nhắn">
              <HeaderIcon name="chat" className="header-action-icon" />
            </Link>
          ) : null}
          {isRecruiterRole ? (
            <>
              <Link className="icon-btn recruiter-quick-icon" to="/recruiter/chat" aria-label="Trò chuyện">
                <HeaderIcon name="chat" className="header-action-icon" />
                {recruiterApplicationCount > 0 ? <span className="icon-badge">{recruiterApplicationCount}</span> : null}
              </Link>
              <Link className="icon-btn recruiter-quick-icon" to="/recruiter/notifications" aria-label="Thông báo">
                <HeaderIcon name="bell" className="header-action-icon" />
                {recruiterUnreadCount > 0 ? <span className="icon-badge">{recruiterUnreadCount}</span> : null}
              </Link>
            </>
          ) : null}

          <div className="account-menu" ref={menuRef}>
            <button
              className={`icon-btn account-trigger ${isLoggedIn ? "is-logged-in" : ""}`}
              type="button"
              aria-label="Tài khoản"
              aria-expanded={isMenuOpen}
              onClick={() => {
                if (!isLoggedIn) {
                  navigate("/login");
                  return;
                }
                setIsMenuOpen((prev) => !prev);
              }}
            >
              {profile?.avatarUrl ? (
                <img className="avatar-image" src={profile.avatarUrl} alt={accountName} />
              ) : (
                <span className="avatar-fallback">{avatarLabel}</span>
              )}
              <span className="account-caret" />
            </button>

            {isLoggedIn && isMenuOpen ? (
              <div className="account-dropdown">
                <div className="account-summary">
                  <div className="account-avatar">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={accountName} />
                    ) : (
                      <span>{avatarLabel}</span>
                    )}
                  </div>
                  <div className="account-summary-copy">
                    <h3>{accountName}</h3>
                    <p>Tài khoản đã xác thực</p>
                    <span>
                      {accountId} | {accountEmail}
                    </span>
                  </div>
                </div>

                <div className="account-scroll">
                  {menuSections.map((section) => (
                    <div className="account-section" key={section.title}>
                      <button
                        type="button"
                        className={`account-section-title ${expandedSections[section.title] ? "is-open" : ""}`}
                        onClick={() => toggleSection(section.title)}
                        aria-expanded={Boolean(expandedSections[section.title])}
                      >
                        <span className={`section-icon ${section.icon}`} />
                        <strong>{section.title}</strong>
                        <span className="section-caret" />
                      </button>
                      {expandedSections[section.title] ? (
                        <div className="account-section-items">
                          {section.items.map((item) =>
                            item.to ? (
                              <Link
                                key={item.label}
                                to={item.to}
                                className="account-link"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ) : (
                              <button
                                key={item.label}
                                type="button"
                                className="account-link account-link-button"
                                onClick={() => openPlaceholder(item.actionLabel)}
                              >
                                {item.label}
                              </button>
                            )
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <button type="button" className="account-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="recruiter-link">
          {isRecruiterRole ? (
            <>
              <span>Workspace tuyển dụng</span>
              <Link to="/recruiter/dashboard">
                <HeaderIcon name="dashboard" className="recruiter-link-icon" />
                <span>Mở dashboard</span>
              </Link>
            </>
          ) : isLoggedIn ? (
            <>
              <span>Workspace ứng viên</span>
              <Link to="/user/dashboard">
                <HeaderIcon name="dashboard" className="recruiter-link-icon" />
                <span>Mở dashboard</span>
              </Link>
            </>
          ) : (
            <>
              <span>Bạn là nhà tuyển dụng?</span>
              <Link to="/register">
                <HeaderIcon name="jobs" className="recruiter-link-icon" />
                <span>Đăng tuyển ngay</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
