const tabs = [
  "Tất cả",
  "Ngân hàng",
  "Bất động sản",
  "Xây dựng",
  "IT - Phần mềm",
  "Tài chính",
  "Bán lẻ - FMCG",
  "Sản xuất"
];

const brands = [
  {
    name: "CHI NHÁNH BƯU CHÍNH VIETTEL NINH BÌNH",
    sector: "Viễn thông",
    jobs: "3 việc làm"
  },
  {
    name: "CÔNG TY CỔ PHẦN TẬP ĐOÀN GDC",
    sector: "Xây dựng",
    jobs: "36 việc làm"
  },
  {
    name: "CÔNG TY CỔ PHẦN XÂY DỰNG VÀ CÔNG NGHIỆP NSN",
    sector: "Xây dựng",
    jobs: "15 việc làm"
  },
  {
    name: "CÔNG TY TNHH TẬP ĐOÀN XÂY DỰNG DELTA",
    sector: "Xây dựng",
    jobs: "12 việc làm"
  },
  {
    name: "CÔNG TY CỔ PHẦN DỊCH VỤ GIẢI TRÍ HÀ NỘI",
    sector: "Giải trí",
    jobs: "9 việc làm"
  },
  {
    name: "CÔNG TY TÀI CHÍNH TỔNG HỢP CỔ PHẦN TÍN VIỆT",
    sector: "Tài chính",
    jobs: "18 việc làm"
  }
];

const BrandsSection = () => {
  return (
    <section className="brands-section">
      <div className="brands-hero">
        <div>
          <h2>Thương hiệu lớn tiêu biểu</h2>
          <p>Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên TopCV Pro</p>
        </div>
        <span className="pro-pill">Pro Company</span>
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
          <div className="feature-logo">S</div>
          <h3>Shinhan Finance</h3>
          <p>Tài chính</p>
          <span className="jobs-count">22 việc làm</span>
          <span className="pro-pill">Pro Company</span>
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
