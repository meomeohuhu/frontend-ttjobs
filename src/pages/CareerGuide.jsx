import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import { Link } from "react-router-dom";

const CareerGuide = () => {
  return (
    <div className="page-shell">
      <HomeHeader />
      <main className="career-page">
        <section className="career-hero">
          <div className="career-hero-left">
            <span className="feature-pill">Cẩm nang nghề nghiệp</span>
            <h1>Giải pháp nghề nghiệp hiện đại cho mọi người tìm việc.</h1>
            <p>
              Khám phá cẩm nang chuyên sâu, mẹo phỏng vấn và chiến lược phát triển nghề nghiệp được thiết kế cho ứng viên Việt Nam.
            </p>
            <div className="page-actions">
              <button className="primary-btn" type="button">
                Xem cẩm nang mới nhất
              </button>
              <Link className="ghost-btn" to="#">
                Tìm theo lĩnh vực
              </Link>
            </div>
            <div className="hero-category-list">
              <span>Định hướng nghề nghiệp</span>
              <span>Ứng tuyển & phỏng vấn</span>
              <span>Thăng tiến & lương thưởng</span>
              <span>Công cụ tìm việc</span>
            </div>
          </div>

          <div className="career-hero-right">
            <div className="hero-banner-card">
              <span className="hero-banner-label">Bài viết nổi bật</span>
              <h2>Việc làm tại nhà không cần kinh nghiệm</h2>
              <p>
                Những cơ hội phù hợp để bạn bắt đầu ngay cả khi chưa có nhiều kinh nghiệm. Cập nhật xu hướng và kỹ năng cần thiết để ứng tuyển thành công.
              </p>
              <Link className="section-link" to="#">
                Xem chi tiết
              </Link>
            </div>
            <div className="hero-small-cards">
              <article className="small-article-card">
                <span className="article-label">TopCV</span>
                <h3>Ngành marketing sẽ phát triển mạnh vào 2026</h3>
                <p>Những kỹ năng cần chuẩn bị để vừa làm việc vừa học hỏi từ thị trường.</p>
              </article>
              <article className="small-article-card">
                <span className="article-label">Phỏng vấn</span>
                <h3>Gợi ý câu trả lời cho câu hỏi tuyển dụng phổ biến</h3>
                <p>Chuẩn bị đáp án chuyên nghiệp và phù hợp với từng vị trí tuyển dụng.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="career-grid-section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Định hướng nghề nghiệp</p>
              <h2>Chủ đề nổi bật</h2>
            </div>
            <Link className="section-link" to="#">
              Xem tất cả
            </Link>
          </div>
          <div className="career-card-grid">
            <article className="career-card">
              <h3>Nhân viên kinh doanh/Sales</h3>
              <p>Hướng dẫn từ A đến Z để trở thành ứng viên sales chủ động và thuyết phục.</p>
            </article>
            <article className="career-card">
              <h3>Ngành IT là gì?</h3>
              <p>Một cái nhìn tổng quan về các vai trò, lộ trình và cơ hội nghề nghiệp trong lĩnh vực công nghệ.</p>
            </article>
            <article className="career-card">
              <h3>Ngành Marketing là gì?</h3>
              <p>Chiến lược xây dựng thương hiệu cá nhân và kỹ năng cần thiết để nổi bật trên thị trường.</p>
            </article>
            <article className="career-card">
              <h3>Logistics là gì?</h3>
              <p>Tất cả những điều cần biết cho ứng viên mới khi muốn đi theo ngành này.</p>
            </article>
          </div>
        </section>

        <section className="career-bottom-section">
          <div className="career-bottom-column">
            <div className="bottom-card">
              <div className="section-eyebrow">Bí kíp tìm việc</div>
              <h3>Cách viết CV thu hút nhà tuyển dụng</h3>
              <p>Phương pháp sắp xếp thông tin và lựa chọn từ khóa để CV của bạn dễ được tìm thấy hơn.</p>
            </div>
            <div className="bottom-card">
              <div className="section-eyebrow">Chế độ lương thưởng</div>
              <h3>Tham khảo chính sách đãi ngộ phổ biến 2025</h3>
              <p>Những gói lương thưởng cạnh tranh cùng phúc lợi bạn nên cân nhắc khi ứng tuyển.</p>
            </div>
          </div>
          <aside className="career-aside">
            <div className="promo-card">
              <h3>60.000+ việc làm tuyển dụng</h3>
              <p>Khám phá nhiều cơ hội việc làm mới nhất, ứng tuyển trực tiếp và kết nối với nhà tuyển dụng hàng đầu.</p>
              <button className="primary-btn" type="button">Xem ngay</button>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CareerGuide;
