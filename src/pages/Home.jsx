import { Link } from "react-router-dom";

const categories = [
  "Công nghệ",
  "Marketing",
  "Bán hàng",
  "Tài chính",
  "Chăm sóc KH",
  "Thiết kế",
  "Nhân sự",
  "Sản xuất"
];

const jobs = [
  {
    title: "Frontend Engineer",
    company: "NovaWave",
    location: "TP.HCM",
    salary: "30-45 triệu",
    tag: "Remote"
  },
  {
    title: "Product Designer",
    company: "Fluxora",
    location: "Hà Nội",
    salary: "25-35 triệu",
    tag: "Hot"
  },
  {
    title: "Data Analyst",
    company: "Metriq Labs",
    location: "Đà Nẵng",
    salary: "20-28 triệu",
    tag: "New"
  },
  {
    title: "Account Executive",
    company: "Bridgepoint",
    location: "TP.HCM",
    salary: "18-26 triệu",
    tag: "Pro"
  }
];

const Home = () => {
  return (
    <div className="home-shell">
      <header className="home-nav">
        <div className="nav-brand">
          <div className="brand-mark">TJ</div>
          <span>TTJobs</span>
        </div>
        <nav className="nav-links">
          <span>Việc làm</span>
          <span>Tạo CV</span>
          <span>Khám phá</span>
          <span>Blog nghề</span>
        </nav>
        <div className="nav-actions">
          <Link className="ghost-btn" to="/login">
            Đăng nhập
          </Link>
          <Link className="solid-btn" to="/register">
            Tạo tài khoản
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">TTJOBS · CAREER STUDIO</p>
          <h1>
            Việc làm chuẩn gu — <br /> lọc theo kỹ năng, không theo may mắn.
          </h1>
          <p>
            Một workspace nghề nghiệp hiện đại: lưu CV, apply nhanh, theo dõi
            trạng thái và nhận gợi ý phù hợp trong vài giây.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Khám phá job ngay</button>
            <button className="ghost-btn-dark">Tạo CV nổi bật</button>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>60K+</strong>
              <span>job đang mở</span>
            </div>
            <div>
              <strong>12K</strong>
              <span>công ty đối tác</span>
            </div>
            <div>
              <strong>94%</strong>
              <span>apply thành công</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <span>Tìm nhanh</span>
            <div className="pulse-dot" />
          </div>
          <div className="hero-search">
            <input placeholder="Vị trí, kỹ năng hoặc công ty..." />
            <button>
              <span>Search</span>
            </button>
          </div>
          <div className="hero-tags">
            {categories.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="hero-card-foot">
            <p>Đề xuất bởi AI matching + hành vi ứng tuyển.</p>
          </div>
        </div>
      </section>

      <section className="strip">
        <div className="strip-content">
          <span>FPT</span>
          <span>VNG</span>
          <span>MoMo</span>
          <span>Techcombank</span>
          <span>VinFast</span>
          <span>VNPay</span>
        </div>
      </section>

      <section className="grid-section">
        <div className="section-head">
          <h2>Job nổi bật hôm nay</h2>
          <span>Xem tất cả</span>
        </div>
        <div className="job-grid">
          {jobs.map((job) => (
            <div className="job-card" key={job.title}>
              <div className="job-tag">{job.tag}</div>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <div className="job-meta">
                <span>{job.location}</span>
                <span>{job.salary}</span>
              </div>
              <button className="ghost-btn">Xem chi tiết</button>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <div>
          <h2>Cần một dashboard ứng tuyển rõ ràng?</h2>
          <p>
            Theo dõi trạng thái, lưu CV phiên bản khác nhau và apply chỉ trong
            1 cú click.
          </p>
        </div>
        <button className="solid-btn">Bắt đầu ngay</button>
      </section>
    </div>
  );
};

export default Home;
