const categories = [
  "Kinh doanh/Bán hàng",
  "Marketing/PR/Quảng cáo",
  "Chăm sóc khách hàng (Customer Service)",
  "Nhân sự/Hành chính/Pháp chế",
  "Công nghệ Thông tin",
  "Lao động phổ thông"
];

const HeroSearch = () => {
  return (
    <section className="hero-search">
      <div className="hero-background">
        <div className="hero-content">
          <h1>Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc</h1>
          <p>
            Tiếp cận 60.000+ tin tuyển dụng mỗi ngày từ hàng nghìn doanh nghiệp
            uy tín tại Việt Nam.
          </p>
          <div className="search-bar">
            <button type="button" className="search-pill">
              <span className="search-icon menu" />
              Danh mục nghề
            </button>
            <input
              type="text"
              placeholder="Vị trí tuyển dụng, tên công ty"
              aria-label="Tìm kiếm vị trí tuyển dụng"
            />
            <div className="search-location">
              <span className="search-icon pin" />
              <span>Địa điểm</span>
              <span className="caret" />
            </div>
            <button type="button" className="search-btn">
              <span className="search-icon magnify" />
              Tìm kiếm
            </button>
          </div>
          <div className="hero-grid">
            <div className="category-card">
              <ul>
                {categories.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                    <span className="chevron" />
                  </li>
                ))}
              </ul>
              <div className="pager">
                <span>1/5</span>
                <button type="button" aria-label="Trước">
                  <span className="circle" />
                </button>
                <button type="button" aria-label="Sau">
                  <span className="circle active" />
                </button>
              </div>
            </div>
            <div className="carousel-card">
              <div className="carousel-image">
                <div className="carousel-badge">Ứng tuyển ngay</div>
                <div className="carousel-text">
                  <p>Chúng tôi đang tuyển dụng</p>
                  <h3>CSKH - Telesales</h3>
                  <span>9 - 25 triệu</span>
                </div>
              </div>
              <div className="carousel-dots">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
