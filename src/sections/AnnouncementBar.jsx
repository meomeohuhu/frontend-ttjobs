const AnnouncementBar = () => {
  return (
    <section className="announcement-bar">
      <div className="announcement-inner">
        <div className="announcement-left">
          <div className="announcement-avatar" />
          <div>
            <strong>TTJobs Match</strong>
            <p>Chia sẻ nhu cầu việc làm để nhận gợi ý sát hơn mỗi ngày</p>
          </div>
        </div>
        <button className="announcement-btn" type="button">
          Cập nhật nhu cầu
          <span className="arrow" />
        </button>
      </div>
    </section>
  );
};

export default AnnouncementBar;
