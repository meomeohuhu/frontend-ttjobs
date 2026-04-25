import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const navItems = [
  { label: "Việc làm", to: "/" },
  { label: "Hồ sơ", to: "/create-cv" },
  { label: "Công cụ", to: "#" },
  { label: "Cẩm nang", to: "/career-guide" },
  { label: "TTJobs", to: "#" }
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
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="topcv-actions">
        <div className="icon-group">
          {isLoggedIn && !isRecruiterRole ? (
            <Link className="icon-btn user-quick-icon" to="/messages" aria-label="Tin nhắn">
              <span className="icon-chat" />
            </Link>
          ) : null}
          {isRecruiterRole ? (
            <>
              <Link className="icon-btn recruiter-quick-icon" to="/recruiter/chat" aria-label="Trò chuyện">
                <span className="icon-chat" />
                {recruiterApplicationCount > 0 ? <span className="icon-badge">{recruiterApplicationCount}</span> : null}
              </Link>
              <Link className="icon-btn recruiter-quick-icon" to="/recruiter/notifications" aria-label="Thông báo">
                <span className="icon-bell" />
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
              <Link to="/recruiter/dashboard">Mở dashboard</Link>
            </>
          ) : (
            <>
              <span>Bạn là nhà tuyển dụng?</span>
              <Link to="/register">Đăng tuyển ngay</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
