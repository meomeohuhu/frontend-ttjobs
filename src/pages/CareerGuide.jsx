import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";

const fallbackArticles = [
  {
    slug: "viet-cv-noi-bat-trong-15-phut",
    title: "Viết CV nổi bật trong 15 phút",
    summary: "Một checklist ngắn giúp bạn làm rõ kinh nghiệm, thành tựu và từ khóa quan trọng trước khi ứng tuyển.",
    category: "CV & Hồ sơ",
    readingTimeMinutes: 5,
    featured: true,
    content:
      "Một CV tốt không cần quá dài, nhưng cần cho nhà tuyển dụng thấy rất nhanh bạn đã làm gì, tạo ra kết quả nào và phù hợp với vai trò ra sao.\n\nHãy ưu tiên các gạch đầu dòng có số liệu, công nghệ hoặc phạm vi công việc cụ thể. Nếu chưa có nhiều kinh nghiệm, hãy dùng dự án cá nhân, đồ án hoặc hoạt động liên quan để chứng minh năng lực."
  },
  {
    slug: "chuan-bi-phong-van-backend",
    title: "Chuẩn bị phỏng vấn Backend gọn mà chắc",
    summary: "Cách ôn API, database, transaction và system thinking để bước vào phỏng vấn tự tin hơn.",
    category: "Phỏng vấn",
    readingTimeMinutes: 7,
    featured: false,
    content:
      "Phỏng vấn backend thường xoay quanh nền tảng HTTP, database, bảo mật cơ bản và cách bạn phân tích tradeoff.\n\nThay vì học thuộc câu trả lời, hãy chuẩn bị vài câu chuyện dự án thật: vấn đề, lựa chọn kỹ thuật, kết quả và điều bạn sẽ cải thiện nếu làm lại."
  },
  {
    slug: "doc-mo-ta-cong-viec",
    title: "Đọc mô tả công việc để tránh ứng tuyển lệch",
    summary: "Nhận diện yêu cầu bắt buộc, yêu cầu cộng điểm và tín hiệu về văn hóa đội nhóm trong JD.",
    category: "Tìm việc",
    readingTimeMinutes: 4,
    featured: false,
    content:
      "Một JD tốt thường cho bạn biết công việc hằng ngày, tiêu chí thành công và kỹ năng thật sự cần dùng.\n\nNếu JD quá rộng, hãy tìm các từ khóa lặp lại nhiều lần. Đó thường là năng lực lõi mà nhà tuyển dụng quan tâm nhất."
  }
];

const formatReadingTime = (minutes) => {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) {
    return "5 phút đọc";
  }
  return `${value} phút đọc`;
};

const splitContent = (content) =>
  String(content || "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

const friendlyGuideError = "Máy chủ cẩm nang chưa phản hồi. TTJobs đang hiển thị nội dung mẫu để trang vẫn hoàn chỉnh khi demo.";

const CareerGuide = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [detailArticle, setDetailArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const isReading = !!slug;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/career-guides");
        if (active) {
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setArticles([]);
          setError(friendlyGuideError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadArticles();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!slug) {
      setDetailArticle(null);
      setDetailError("");
      return;
    }

    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const data = await apiRequest(`/api/career-guides/${slug}`);
        if (active) {
          setDetailArticle(data);
        }
      } catch (err) {
        if (active) {
          setDetailArticle(fallbackArticles.find((article) => article.slug === slug) || null);
          setDetailError("Bài viết thật chưa tải được, đang hiển thị bản mẫu để giữ trải nghiệm đọc.");
        }
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    };

    loadDetail();
    return () => {
      active = false;
    };
  }, [slug]);

  const displayArticles = error || articles.length === 0 ? fallbackArticles : articles;

  const landingFeatured = useMemo(() => {
    return displayArticles.find((item) => item.featured) || displayArticles[0] || null;
  }, [displayArticles]);

  const heroArticle = isReading ? detailArticle : landingFeatured;

  const categories = useMemo(() => {
    return Array.from(new Set(displayArticles.map((item) => item.category).filter(Boolean)));
  }, [displayArticles]);

  const relatedArticles = useMemo(() => {
    const activeSlug = slug || landingFeatured?.slug;
    return displayArticles.filter((item) => item.slug !== activeSlug).slice(0, 3);
  }, [displayArticles, slug, landingFeatured?.slug]);

  const articleParagraphs = useMemo(() => splitContent(detailArticle?.content), [detailArticle?.content]);

  const heroSidebarArticles = useMemo(() => {
    return displayArticles.filter((article) => article.slug !== landingFeatured?.slug).slice(0, 2);
  }, [displayArticles, landingFeatured]);

  return (
    <div className="page-shell career-guide-shell">
      <AnnouncementBar />
      <HomeHeader />

      <main className="page-content career-guide-page">
        <section className={`career-hero ${isReading ? "reading-hero" : "landing-hero"}`}>
          <div className="career-hero-left">
            <span className="feature-pill">
              {isReading ? detailArticle?.category || "Cẩm nang" : "Cẩm nang nghề nghiệp"}
            </span>
            <h1>
              {isReading
                ? detailLoading
                  ? "Đang tải bài viết..."
                  : detailArticle?.title || "Bài viết không tồn tại"
                : landingFeatured?.title || "Kiến thức tìm việc & phát triển sự nghiệp"}
            </h1>
            <p>
              {isReading
                ? detailArticle?.summary || "Nội dung tóm tắt đang được cập nhật."
                : landingFeatured?.summary ||
                  "Tổng hợp những bài viết thực hành để bạn viết CV tốt hơn, phỏng vấn gọn hơn và ra quyết định nghề nghiệp rõ hơn."}
            </p>

            {isReading ? (
              <div className="guide-meta-row">
                <span>{formatReadingTime(detailArticle?.readingTimeMinutes)}</span>
                {detailArticle?.publishedAt && <span>• {new Date(detailArticle.publishedAt).toLocaleDateString("vi-VN")}</span>}
                <Link to="/career-guide" className="ghost-btn" style={{ marginLeft: "12px" }}>
                  ← Quay lại danh sách
                </Link>
              </div>
            ) : (
              <div className="page-actions">
                {landingFeatured?.slug && (
                  <Link className="primary-btn" to={`/career-guide/${landingFeatured.slug}`}>
                    Đọc bài nổi bật
                  </Link>
                )}
                <div className="hero-category-list">
                  {categories.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="career-hero-right">
            {isReading ? (
              <div className="guide-feature-card guide-reading-card">
                {heroArticle?.coverImageUrl ? (
                  <img className="guide-cover" src={heroArticle.coverImageUrl} alt={heroArticle.title} />
                ) : (
                  <div className="guide-cover-fallback">
                    <span>{formatReadingTime(heroArticle?.readingTimeMinutes)}</span>
                    <strong>{heroArticle?.category || "Cẩm nang TTJobs"}</strong>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="hero-banner-card guide-feature-card guide-feature-card-v2">
                  {landingFeatured?.coverImageUrl && (
                    <img className="guide-cover" src={landingFeatured.coverImageUrl} alt={landingFeatured.title} />
                  )}
                  <span className="hero-banner-label">{error ? "Bản demo" : "Nổi bật"}</span>
                  <h2>{landingFeatured?.title || "Cẩm nang nổi bật cho ứng viên"}</h2>
                  <p>{landingFeatured?.summary || "Các gợi ý ngắn gọn giúp bạn chuẩn bị hồ sơ và ứng tuyển tự tin hơn."}</p>
                  <div className="guide-meta-row">
                    <span>{formatReadingTime(landingFeatured?.readingTimeMinutes)}</span>
                    {error ? <span>• Nội dung mẫu</span> : null}
                  </div>
                  <Link className="section-link" to={`/career-guide/${landingFeatured?.slug}`}>
                    Xem chi tiết
                  </Link>
                </div>

                <div className="hero-small-cards">
                  {heroSidebarArticles.map((article) => (
                    <Link key={article.slug} className="small-article-card guide-small-card" to={`/career-guide/${article.slug}`}>
                      <span className="article-label">{article.category}</span>
                      <h3>{article.title}</h3>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="career-bottom-section">
          <div className="career-bottom-column">
            {isReading ? (
              <div className="bottom-card guide-article-card main-reading-area">
                {detailLoading && <div className="guide-status-card">Đang tải nội dung bài viết...</div>}
                {detailError && (
                  <div className="guide-status-card guide-status-warning">
                    <span>Bản đọc dự phòng</span>
                    <strong>{detailError}</strong>
                  </div>
                )}

                {!detailLoading && detailArticle && articleParagraphs.length > 0 && (
                  <div className="guide-content">
                    {articleParagraphs.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {!detailLoading && !detailArticle && (
                  <div className="guide-status-card guide-status-warning">
                    <span>Không tìm thấy bài viết</span>
                    <strong>Bài viết này chưa có dữ liệu để hiển thị.</strong>
                    <Link to="/career-guide">Quay lại cẩm nang</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="career-grid-section">
                <div className="section-header">
                  <div>
                    <p className="section-eyebrow">Định hướng nghề nghiệp</p>
                    <h2>Bài viết mới nhất</h2>
                  </div>
                </div>

                {loading && <div className="guide-status-card">Đang tải thư viện cẩm nang nghề nghiệp...</div>}
                {!loading && error && (
                  <div className="guide-status-card guide-status-warning">
                    <span>Đang dùng nội dung mẫu</span>
                    <strong>Máy chủ cẩm nang chưa phản hồi</strong>
                    <p>{error}</p>
                  </div>
                )}

                {!loading && (
                  <div className="career-card-grid guide-card-grid">
                    {displayArticles.map((article) => (
                      <Link key={article.slug} to={`/career-guide/${article.slug}`} className="career-card guide-card">
                        {article.coverImageUrl && <img className="guide-card-image" src={article.coverImageUrl} alt={article.title} />}
                        <span className="article-label">{article.category}</span>
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                        <div className="guide-card-meta">
                          <span>{formatReadingTime(article.readingTimeMinutes)}</span>
                          {article.featured && <strong>Nổi bật</strong>}
                          {error && <strong>Demo</strong>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bottom-card related-bottom">
              <div className="section-eyebrow">Bài viết {isReading ? "khác" : "liên quan"}</div>
              <div className="guide-related-list">
                {relatedArticles.length === 0 ? (
                  <p>Chưa có bài viết khác.</p>
                ) : (
                  relatedArticles.map((article) => (
                    <Link key={article.slug} to={`/career-guide/${article.slug}`} className="guide-related-card">
                      <span>{article.category}</span>
                      <strong>{article.title}</strong>
                      <p>{article.summary}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="career-aside">
            <div className="promo-card guide-promo-card">
              <h3>Đọc cẩm nang theo mục tiêu</h3>
              <p>
                Chọn bài viết phù hợp với giai đoạn hiện tại: viết CV, chuẩn bị phỏng vấn, chuyển ngành hoặc đàm phán offer.
              </p>
              <Link className="primary-btn" to="/career-guide">
                Tất cả bài viết
              </Link>
            </div>

            {isReading && (
              <div className="promo-card guide-about-card">
                <h4>Về TTJobs</h4>
                <p>Chúng tôi giúp bạn tìm kiếm cơ hội nghề nghiệp phù hợp nhất với năng lực và đam mê.</p>
              </div>
            )}
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CareerGuide;
