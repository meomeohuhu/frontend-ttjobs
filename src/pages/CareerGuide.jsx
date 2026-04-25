import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import Footer from "../sections/Footer.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";

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

const CareerGuide = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [detailArticle, setDetailArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const isReading = !!slug;

  // Scroll to top when navigating between articles
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
          setError(err.message || "Không thể tải cẩm nang");
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
          setDetailArticle(null);
          setDetailError(err.message || "Không thể tải bài viết");
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

  // Featured article for the Landing Page
  const landingFeatured = useMemo(() => {
    return articles.find((item) => item.featured) || articles[0] || null;
  }, [articles]);

  // Current article to display in Hero (either the reading one or the landing featured one)
  const heroArticle = isReading ? detailArticle : landingFeatured;

  const categories = useMemo(() => {
    return Array.from(new Set(articles.map((item) => item.category).filter(Boolean)));
  }, [articles]);

  const relatedArticles = useMemo(() => {
    const activeSlug = slug || landingFeatured?.slug;
    return articles.filter((item) => item.slug !== activeSlug).slice(0, 3);
  }, [articles, slug, landingFeatured?.slug]);

  const articleParagraphs = useMemo(() => splitContent(detailArticle?.content), [detailArticle?.content]);
  
  // Extra articles for the hero sidebar (Landing only)
  const heroSidebarArticles = useMemo(() => {
    return articles.filter(a => a.slug !== landingFeatured?.slug).slice(0, 2);
  }, [articles, landingFeatured]);

  return (
    <div className="page-shell career-guide-shell">
      <AnnouncementBar />
      <HomeHeader />

      <main className="page-content career-guide-page">
        {/* HERO SECTION - Adapts to Mode */}
        <section className={`career-hero ${isReading ? 'reading-hero' : 'landing-hero'}`}>
          <div className="career-hero-left">
            <span className="feature-pill">
              {isReading ? (detailArticle?.category || "Cẩm nang") : "Cẩm nang nghề nghiệp"}
            </span>
            <h1>
              {isReading 
                ? (detailLoading ? "Đang tải bài viết..." : (detailArticle?.title || "Bài viết không tồn tại"))
                : (landingFeatured?.title || "Kiến thức tìm việc & phát triển sự nghiệp")}
            </h1>
            <p>
              {isReading
                ? (detailArticle?.summary || "Đang tải nội dung tóm tắt...")
                : (landingFeatured?.summary || "Tổng hợp những bài viết thực hành để bạn viết CV tốt hơn, phỏng vấn gọn hơn và ra quyết định nghề nghiệp rõ hơn.")}
            </p>

            {isReading ? (
              <div className="guide-meta-row">
                <span>{formatReadingTime(detailArticle?.readingTimeMinutes)}</span>
                {detailArticle?.publishedAt && (
                  <span>• {new Date(detailArticle.publishedAt).toLocaleDateString("vi-VN")}</span>
                )}
                <Link to="/career-guide" className="ghost-btn" style={{ marginLeft: '12px' }}>
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
                  {categories.length > 0 ? (
                    categories.map((category) => <span key={category}>{category}</span>)
                  ) : (
                    <>
                      <span>Tìm việc</span>
                      <span>Phỏng vấn</span>
                      <span>Lương thưởng</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="career-hero-right">
            {isReading ? (
              <div className="guide-feature-card">
                {detailArticle?.coverImageUrl && (
                  <img className="guide-cover" src={detailArticle.coverImageUrl} alt={detailArticle.title} />
                )}
              </div>
            ) : (
              <>
                <div className="hero-banner-card guide-feature-card">
                  {landingFeatured?.coverImageUrl && (
                    <img className="guide-cover" src={landingFeatured.coverImageUrl} alt={landingFeatured.title} />
                  )}
                  <span className="hero-banner-label">Nổi bật</span>
                  <h2>{landingFeatured?.title}</h2>
                  <div className="guide-meta-row">
                    <span>{formatReadingTime(landingFeatured?.readingTimeMinutes)}</span>
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

        {/* CONTENT SECTION */}
        <section className="career-bottom-section">
          <div className="career-bottom-column">
            {isReading ? (
              <div className="bottom-card guide-article-card main-reading-area">
                {detailLoading && <p>Đang tải nội dung...</p>}
                {detailError && <p className="error-text">{detailError}</p>}
                
                {!detailLoading && !detailError && articleParagraphs.length > 0 && (
                  <div className="guide-content">
                    {articleParagraphs.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {!detailLoading && !detailError && articleParagraphs.length === 0 && (
                  <p>Bài viết chưa có nội dung.</p>
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

                {loading && <p>Đang tải dữ liệu...</p>}
                {!loading && error && <p>{error}</p>}

                {!loading && !error && (
                  <div className="career-card-grid guide-card-grid">
                    {articles.map((article) => (
                      <Link key={article.slug} to={`/career-guide/${article.slug}`} className="career-card guide-card">
                        {article.coverImageUrl && (
                          <img className="guide-card-image" src={article.coverImageUrl} alt={article.title} />
                        )}
                        <span className="article-label">{article.category}</span>
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                        <div className="guide-card-meta">
                          <span>{formatReadingTime(article.readingTimeMinutes)}</span>
                          {article.featured && <strong>Nổi bật</strong>}
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
                Chọn bài viết phù hợp với giai đoạn hiện tại: viết CV, chuẩn bị phỏng vấn,
                chuyển ngành hoặc đàm phán offer.
              </p>
              <Link className="primary-btn" to="/career-guide">
                Tất cả bài viết
              </Link>
            </div>
            
            {isReading && (
               <div className="promo-card" style={{ marginTop: '24px', background: 'var(--notion-badge-bg)' }}>
                  <h4 style={{ color: 'var(--notion-blue)', marginTop: 0 }}>Về TTJobs</h4>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Chúng tôi giúp bạn tìm kiếm cơ hội nghề nghiệp phù hợp nhất với năng lực và đam mê.
                  </p>
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
