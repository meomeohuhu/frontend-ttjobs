import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const navItems = ["Việc làm", "Hồ sơ", "Công cụ", "Cẩm nang", "TTJobs"];

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
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    "Cài đặt email & thông báo": true,
    "Cá nhân & Bảo mật": true
  });
  const [profile, setProfile] = useState(null);

  const token = localStorage.getItem("ttjobs_token");
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (!isLoggedIn) {
      setProfile(null);
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
      <div className="topcv-logo">
        <div className="logo-mark">
          <div className="logo-badge">
            <span>TT</span>
          </div>
          <div className="logo-copy">
            <div className="logo-text">TTJobs</div>
            <span className="logo-tagline">Việc làm theo gu của bạn</span>
          </div>
        </div>
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
