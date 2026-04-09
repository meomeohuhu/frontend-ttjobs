const filters = ["Ngẫu nhiên", "Hà Nội", "Thành phố Hồ Chí Minh", "Miền Bắc", "Miền Nam"];

const jobs = [
  {
    title: "Bác sĩ Thú Y (Lương Cứng Từ 18 Triệu + Phụ Cấp + Thưởng)",
    company: "Công ty TNHH Linkfarm",
    salary: "Thỏa thuận",
    location: "Hưng Yên (mới) & 3 nơi"
  },
  {
    title: "Giám Sát Thi Công/Cán Bộ Kỹ Thuật/Kỹ Thuật Hiện Trường",
    company: "Công ty CP Đầu tư DIC",
    salary: "15 - 20 triệu",
    location: "Hà Nội"
  },
  {
    title: "Trưởng Nhóm Cửa Hàng Khu Vui Chơi (F&B)",
    company: "CTY TNHH AEON Fantasy Việt Nam",
    salary: "11 - 13 triệu",
    location: "Hà Nội"
  },
  {
    title: "Head Of Business Development - Freight Forwarding",
    company: "Tổng Công ty Logistics",
    salary: "Thỏa thuận",
    location: "Hà Nội"
  },
  {
    title: "Kỹ Sư Điện - Kỹ Sư Giám Sát Công Trình",
    company: "Công ty CP Đầu tư và Năng lượng",
    salary: "15 - 20 triệu",
    location: "Hà Nội"
  },
  {
    title: "Giám Sát Khu Vui Chơi (Aeon Mall Long Biên)",
    company: "Công ty TNHH Dream Games Việt Nam",
    salary: "Thỏa thuận",
    location: "Hà Nội"
  }
];

const BestJobsSection = () => {
  return (
    <section className="best-jobs">
      <div className="section-head">
        <div>
          <h2>Việc làm tốt nhất</h2>
          <span className="ai-tag">Đề xuất bởi TOPPYAI</span>
        </div>
        <div className="section-actions">
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

      <div className="filter-row">
        <div className="filter-dropdown">
          <span className="search-icon slider" />
          <span>Lọc theo:</span>
          <strong>Địa điểm</strong>
          <span className="caret" />
        </div>
        <div className="filter-chips">
          <button className="chip-nav" type="button" aria-label="Trước">
            <span />
          </button>
          {filters.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`chip ${index === 0 ? "active" : ""}`}
            >
              {item}
            </button>
          ))}
          <button className="chip-nav" type="button" aria-label="Sau">
            <span />
          </button>
        </div>
      </div>

      <div className="tip-box">
        <span className="tip-icon" />
        <p>Gợi ý: Di chuột vào tiêu đề việc làm để xem thêm thông tin chi tiết</p>
        <button type="button" aria-label="Đóng">
          ×
        </button>
      </div>

      <div className="job-cards">
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
    </section>
  );
};

export default BestJobsSection;
