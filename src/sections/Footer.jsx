const Footer = () => {
  return (
    <footer className="page-footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand">TopCV</div>
          <p>
            Hỗ trợ ứng viên Việt Nam xây dựng hồ sơ chuyên nghiệp và kết nối với
            nhà tuyển dụng nhanh chóng.
          </p>
        </div>
        <div className="footer-contact">
          <h3>Liên hệ</h3>
          <p>Hotline: 1900 6789</p>
          <p>Email: support@ttjobs.vn</p>
          <p>Địa chỉ: Đà Nẵng</p>
        </div>
      </div>
      <div className="footer-links">
        <div className="footer-col">
          <h4>Điều hướng</h4>
          <a href="/">Việc làm</a>
          <a href="/create-cv">Tạo CV</a>
          <a href="/career-guide">Cẩm nang nghề nghiệp</a>
        </div>
        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <a href="#">Trợ giúp</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản sử dụng</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
