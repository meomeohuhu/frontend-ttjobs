import { Link } from "react-router-dom";

const AnnouncementBar = () => {
  const isLoggedIn = Boolean(localStorage.getItem("ttjobs_token"));
  const ctaTo = isLoggedIn ? "/user/job-needs" : "/login";
  const ctaLabel = isLoggedIn ? "Cập nhật nhu cầu việc làm" : "Đăng nhập để nhận gợi ý";
  const message = isLoggedIn
    ? "Cập nhật nhu cầu việc làm để TTJobs ưu tiên gợi ý những cơ hội sát kỹ năng, mức lương và địa điểm của bạn."
    : "Tạo hành trình tìm việc rõ ràng hơn: đăng nhập để lưu việc làm, theo dõi ứng tuyển và nhận gợi ý phù hợp hơn mỗi ngày.";

  return (
    <section className="announcement-bar">
      <div className="announcement-inner">
        <div className="announcement-left">
          <div className="announcement-avatar" />
          <p>{message}</p>
        </div>
        <Link className="announcement-btn" to={ctaTo}>
          {ctaLabel}
          <span className="arrow" />
        </Link>
      </div>
    </section>
  );
};

export default AnnouncementBar;
