const jobs = [
  {
    title: "Kế Toán Trưởng",
    company: "Công ty TNHH Chế tạo Tân Phát",
    salary: "Thỏa thuận",
    location: "Tây Ninh (mới)"
  },
  {
    title: "Kiến Trúc Sư (Kiến Trúc, Nội Thất, Cảnh Quan)",
    company: "CTY TNHH Tư vấn Thiết kế & Xây dựng",
    salary: "10 - 15 triệu",
    location: "Đà Nẵng (mới)"
  },
  {
    title: "Kỹ Sư Kết Cấu (Lương Up To 30tr/Tháng)",
    company: "Công ty CP Thương mại Đầu tư",
    salary: "13 - 30 triệu",
    location: "Hải Phòng (mới)"
  },
  {
    title: "Kỹ Sư Xây Dựng/Kỹ Sư Thiết Kế Hạ Tầng",
    company: "Công ty CP Tư vấn Xây dựng 116",
    salary: "15 - 30 triệu",
    location: "Hà Nội"
  }
];

const HighlightJobsSection = () => {
  return (
    <section className="highlight-jobs">
      <div className="highlight-header">
        <div>
          <h2>Việc làm hấp dẫn</h2>
          <span className="ai-tag">Đề xuất bởi TOPPYAI</span>
        </div>
        <div className="highlight-actions">
          <a href="#">Xem tất cả</a>
          <div className="nav-circles">
            <button type="button" aria-label="Trước">
              <span />
            </button>
            <button type="button" aria-label="Sau">
              <span />
            </button>
          </div>
        </div>
      </div>

      <div className="highlight-grid">
        <div className="highlight-list">
          {jobs.map((job) => (
            <article className="job-card" key={job.title}>
              <div className="job-logo" />
              <div className="job-info">
                <h3>{job.title}</h3>
                <p>{job.company}</p>
                <div className="job-meta">
                  <span>{job.salary}</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <button className="heart-btn" type="button" aria-label="Lưu">
                <span />
              </button>
            </article>
          ))}
        </div>
        <aside className="highlight-banner">
          <div className="banner-glow" />
          <h3>500+ việc làm phổ thông thu nhập hấp dẫn</h3>
          <div className="banner-chips">
            <span>Làm thời vụ</span>
            <span>Làm tại nhà</span>
            <span>Làm theo ca</span>
          </div>
          <div className="banner-roles">
            <p>Nhân viên phục vụ</p>
            <p>Nhân viên tài xế</p>
            <p>Nhân viên giao hàng</p>
            <p>Nhân viên kho</p>
          </div>
          <button type="button">Khám phá ngay</button>
        </aside>
      </div>
    </section>
  );
};

export default HighlightJobsSection;
