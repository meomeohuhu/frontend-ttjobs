const FloatingActions = () => {
  return (
    <div className="floating-actions">
      <button type="button" className="fab" aria-label="Yêu thích">
        <span className="fab-icon heart" />
        <span className="fab-count">0</span>
      </button>
      <button type="button" className="fab" aria-label="Ứng viên">
        <span className="fab-icon user" />
      </button>
      <button type="button" className="fab" aria-label="Hỗ trợ">
        <span className="fab-icon shield" />
      </button>
      <button type="button" className="fab" aria-label="Góp ý">
        <span className="fab-icon chat" />
        <span className="fab-label">Góp ý</span>
      </button>
      <button type="button" className="fab" aria-label="Hỗ trợ">
        <span className="fab-icon phone" />
        <span className="fab-label">Hỗ trợ</span>
      </button>
    </div>
  );
};

export default FloatingActions;
