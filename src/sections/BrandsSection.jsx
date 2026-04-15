const tabs = [
  "Tất cả",
  "Sản phẩm",
  "Marketing",
  "Sales",
  "IT - Phần mềm",
  "Tài chính",
  "Sản xuất",
  "Dịch vụ"
];

const brands = [
  {
    name: "CÔNG TY CỔ PHẦN GDC",
    sector: "Xây dựng",
    jobs: "36 việc làm"
  },
  {
    name: "DELTA GROUP",
    sector: "Xây dựng",
    jobs: "12 việc làm"
  },
  {
    name: "VIVU MEDIA",
    sector: "Giải trí",
    jobs: "9 việc làm"
  },
  {
    name: "TÍN VIỆT FINANCE",
    sector: "Tài chính",
    jobs: "18 việc làm"
  },
  {
    name: "VIETTEL POST",
    sector: "Viễn thông",
    jobs: "3 việc làm"
  },
  {
    name: "NSN CONSTRUCTION",
    sector: "Xây dựng",
    jobs: "15 việc làm"
  }
];

const BrandsSection = () => {
  return (
    <section className="brands-section">
      <div className="brands-hero">
        <div>
          <h2>Thương hiệu đang tuyển nổi bật</h2>
          <p>Những doanh nghiệp đang tuyển dụng tích cực trên TTJobs</p>
        </div>
        <span className="pro-pill">TTJobs Select</span>
      </div>

      <div className="brand-tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`tab ${index === 0 ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
        <div className="nav-circles">
          <button type="button" aria-label="Trước">
            <span />
          </button>
          <button type="button" aria-label="Sau">
            <span />
          </button>
        </div>
      </div>

      <div className="brands-grid">
        <div className="brand-feature">
          <div className="feature-logo">T</div>
          <h3>TTJobs Select</h3>
          <p>Top thương hiệu</p>
          <span className="jobs-count">22 việc làm</span>
          <span className="pro-pill">Curated</span>
          <button type="button">+ Theo dõi</button>
        </div>
        <div className="brand-cards">
          {brands.map((brand) => (
            <article className="brand-card" key={brand.name}>
              <div className="brand-logo" />
              <div>
                <h4>{brand.name}</h4>
                <p>{brand.sector}</p>
                <span className="jobs-count">{brand.jobs}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
