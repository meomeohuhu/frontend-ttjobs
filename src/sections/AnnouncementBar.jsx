const AnnouncementBar = () => {
  return (
    <section className="announcement-bar">
      <div className="announcement-inner">
        <div className="announcement-left">
          <div className="announcement-avatar" />
          <p>
            Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất
          </p>
        </div>
        <button className="announcement-btn" type="button">
          Cập nhật nhu cầu công việc
          <span className="arrow" />
        </button>
      </div>
    </section>
  );
};

export default AnnouncementBar;
