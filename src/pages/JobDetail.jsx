import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";
import Footer from "../sections/Footer.jsx";
import { useSavedJobs } from "../hooks/useSavedJobs.js";

const TOKEN_KEY = "ttjobs_token";

const formatNumber = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "";
  }
  return numberValue.toLocaleString("vi-VN");
};

const formatSalary = (job) => {
  if (!job) return "";
  const min = formatNumber(job.salaryMin);
  const max = formatNumber(job.salaryMax);
  const salary = formatNumber(job.salary);
  const currency = job.currency || "VND";

  if (min && max) {
    return `${min} - ${max} ${currency}`;
  }
  if (salary) {
    return `${salary} ${currency}`;
  }
  return "Thỏa thuận";
};

const formatDate = (value) => {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [useProfileCv, setUseProfileCv] = useState(false);
  const [saveToCvList, setSaveToCvList] = useState(true);
  const [error, setError] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const { savedIdSet, savingIds, toggleSavedJob } = useSavedJobs();

  const loadMyApplications = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setMyApplications([]);
      return;
    }
    try {
      const data = await apiRequest("/api/applications/me");
      setMyApplications(Array.isArray(data) ? data : []);
    } catch {
      setMyApplications([]);
    }
  };

  useEffect(() => {
    let active = true;

    const loadJob = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/api/jobs/${id}`);
        if (!active) return;
        setJob(data);
        if (data?.jobType) {
          const related = await apiRequest(
            `/api/jobs/search?jobType=${encodeURIComponent(data.jobType)}`
          );
          if (active) {
            const filtered = Array.isArray(related)
              ? related.filter((item) => item.id !== data.id).slice(0, 6)
              : [];
            setRelatedJobs(filtered);
          }
        }
        await loadMyApplications();
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải thông tin công việc");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      active = false;
    };
  }, [id]);

  const detailDescription = useMemo(() => {
    if (!job?.description) return "Thông tin đang được cập nhật.";
    return job.description;
  }, [job]);

  const alreadyApplied = useMemo(() => {
    return myApplications.some((application) => String(application.jobId) === String(job?.id));
  }, [myApplications, job?.id]);

  const handleToggleSave = async () => {
    if (!job?.id) return;
    try {
      await toggleSavedJob(job.id);
    } catch (err) {
      if ((err.message || "").toLowerCase().includes("đăng nhập")) {
        navigate("/login");
        return;
      }
      setError(err.message || "Không thể lưu công việc");
    }
  };

  const openApplyForm = () => {
    setError("");
    setApplyMessage("");
    if (!localStorage.getItem(TOKEN_KEY)) {
      navigate("/login");
      return;
    }
    setShowApplyForm(true);
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!job?.id || applying || alreadyApplied) return;

    if (!cvFile && !useProfileCv) {
      setError("Bạn cần tải CV hoặc chọn dùng CV đã lưu.");
      return;
    }
    if (cvFile && useProfileCv) {
      setError("Chỉ chọn một cách nộp CV: tải file mới hoặc dùng CV đã lưu.");
      return;
    }

    setApplying(true);
    setError("");
    setApplyMessage("");
    try {
      const formData = new FormData();
      formData.append("jobId", job.id);
      formData.append("useProfileCv", String(useProfileCv));
      formData.append("saveToCvList", String(saveToCvList));
      if (cvFile) {
        formData.append("file", cvFile);
      }

      await apiRequest("/api/applications/apply", {
        method: "POST",
        body: formData
      });
      setApplyMessage("Ứng tuyển thành công. Hồ sơ của bạn đã được gửi đến nhà tuyển dụng.");
      setShowApplyForm(false);
      setCvFile(null);
      setUseProfileCv(false);
      await loadMyApplications();
    } catch (err) {
      const message = err.message || "Không thể ứng tuyển công việc";
      if (message.toLowerCase().includes("unauthorized")) {
        navigate("/login");
        return;
      }
      setError(message);
    } finally {
      setApplying(false);
    }
  };

  const isSaved = Boolean(job?.id && savedIdSet?.has(job.id));
  const isSaving = Boolean(job?.id && savingIds?.includes(job.id));

  return (
    <div className="job-detail-shell">
      <HomeHeader />
      <AnnouncementBar />

      <div className="job-detail-container">
        <div className="job-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>{job?.category || "Tìm việc làm"}</span>
          <span>/</span>
          <span className="current">{job?.title || "Chi tiết"}</span>
        </div>

        {loading && <p>Đang tải dữ liệu...</p>}
        {!loading && error && <p className="job-detail-alert error">{error}</p>}
        {!loading && applyMessage && <p className="job-detail-alert success">{applyMessage}</p>}

        {!loading && job && (
          <>
            <div className="job-hero">
              <div className="job-main-card">
                <h1>{job.title}</h1>
                <div className="job-summary">
                  <div>
                    <span>Mức lương</span>
                    <strong>{formatSalary(job)}</strong>
                  </div>
                  <div>
                    <span>Địa điểm</span>
                    <strong>{job.location || "Toàn quốc"}</strong>
                  </div>
                  <div>
                    <span>Kinh nghiệm</span>
                    <strong>{job.experienceLevel || "Chưa yêu cầu"}</strong>
                  </div>
                </div>
                <p className="job-deadline">
                  Hạn nộp hồ sơ: <strong>{formatDate(job.applicationDeadline)}</strong>
                </p>
                <div className="job-actions">
                  <button
                    type="button"
                    className="apply-btn"
                    disabled={alreadyApplied || applying}
                    onClick={openApplyForm}
                  >
                    {alreadyApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                  </button>
                  <button
                    type="button"
                    className={`save-btn ${isSaved ? "saved" : ""}`}
                    disabled={isSaving}
                    onClick={handleToggleSave}
                  >
                    {isSaved ? "Đã lưu" : "Lưu tin"}
                  </button>
                </div>

                {showApplyForm && !alreadyApplied ? (
                  <form className="job-apply-panel" onSubmit={submitApplication}>
                    <div>
                      <strong>Nộp CV ứng tuyển</strong>
                      <span>Hỗ trợ PDF, DOC, DOCX. Dung lượng tối đa 5MB.</span>
                    </div>
                    <label className="job-apply-upload">
                      <span>{cvFile ? cvFile.name : "Chọn file CV"}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => {
                          setCvFile(event.target.files?.[0] || null);
                          if (event.target.files?.[0]) {
                            setUseProfileCv(false);
                          }
                        }}
                      />
                    </label>
                    <label className="job-apply-check">
                      <input
                        type="checkbox"
                        checked={useProfileCv}
                        onChange={(event) => {
                          setUseProfileCv(event.target.checked);
                          if (event.target.checked) {
                            setCvFile(null);
                          }
                        }}
                      />
                      Dùng CV đã lưu trong hồ sơ
                    </label>
                    <label className="job-apply-check">
                      <input
                        type="checkbox"
                        checked={saveToCvList}
                        disabled={useProfileCv}
                        onChange={(event) => setSaveToCvList(event.target.checked)}
                      />
                      Lưu file CV này vào hồ sơ của tôi
                    </label>
                    <div className="job-apply-actions">
                      <button type="button" className="save-btn" onClick={() => setShowApplyForm(false)}>
                        Hủy
                      </button>
                      <button type="submit" className="apply-btn" disabled={applying}>
                        {applying ? "Đang gửi..." : "Gửi hồ sơ"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              <aside className="company-card">
                <div className="company-logo">
                  {job.companyLogoUrl ? (
                    <img src={job.companyLogoUrl} alt={job.companyName || "Logo"} />
                  ) : (
                    <span>{(job.companyName || "C")[0]}</span>
                  )}
                </div>
                <h3>{job.companyName || "Công ty"}</h3>
                <p>{job.category || "Lĩnh vực đang cập nhật"}</p>
                <div className="company-meta">
                  <span>Địa điểm:</span>
                  <strong>{job.location || "Đang cập nhật"}</strong>
                </div>
                <Link to={job.companyId ? `/companies/${job.companyId}` : "#"} className="company-link">
                  Xem trang công ty
                </Link>
              </aside>
            </div>

            <div className="job-tabs">
              <button type="button" className="active">
                Chi tiết tin tuyển dụng
              </button>
              <button type="button">Việc làm liên quan</button>
            </div>

            <div className="job-detail-grid">
              <div className="job-detail-content">
                <section>
                  <h2>Chi tiết tin tuyển dụng</h2>
                  <p>{detailDescription}</p>
                </section>

                <section>
                  <h3>Yêu cầu ứng viên</h3>
                  <ul>
                    <li>Trình độ: {job.experienceLevel || "Chưa yêu cầu"}</li>
                    <li>Loại hình: {job.jobType || "Đang cập nhật"}</li>
                    <li>Danh mục: {job.category || "Đang cập nhật"}</li>
                  </ul>
                </section>

                <section>
                  <h3>Quyền lợi</h3>
                  <ul>
                    <li>Mức lương cạnh tranh theo năng lực.</li>
                    <li>Tham gia đầy đủ BHXH, BHYT, BHTN.</li>
                    <li>Cơ hội thăng tiến và đào tạo định kỳ.</li>
                  </ul>
                </section>
              </div>

              <aside className="job-side-panel">
                <div className="side-card">
                  <h3>Danh mục nghề liên quan</h3>
                  <div className="pill-group">
                    <span>{job.category || "Khác"}</span>
                    <span>{job.jobType || "Toàn thời gian"}</span>
                  </div>
                </div>
                <div className="side-card">
                  <h3>Kỹ năng cần có</h3>
                  <div className="pill-group">
                    <span>Giao tiếp</span>
                    <span>Phân tích</span>
                    <span>Làm việc nhóm</span>
                  </div>
                </div>
                <div className="side-card">
                  <h3>Tìm việc theo khu vực</h3>
                  <div className="pill-group">
                    <span>{job.location || "Toàn quốc"}</span>
                    <span>TP. Hồ Chí Minh</span>
                    <span>Hà Nội</span>
                  </div>
                </div>
              </aside>
            </div>

            <div className="related-section">
              <div className="related-header">
                <h2>Việc làm liên quan</h2>
                <span>Cùng loại công việc: {job.jobType || "Khác"}</span>
              </div>
              <div className="related-list">
                {relatedJobs.length === 0 && <p>Chưa có việc làm liên quan.</p>}
                {relatedJobs.map((item) => (
                  <Link key={item.id} to={`/jobs/${item.id}`} className="related-card">
                    <div className="related-logo">
                      {item.companyLogoUrl ? (
                        <img
                          src={item.companyLogoUrl}
                          alt={item.companyName || "Logo"}
                        />
                      ) : (
                        <span>{(item.companyName || "C")[0]}</span>
                      )}
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.companyName || "Đang cập nhật"}</p>
                    </div>
                    <span className="related-salary">{formatSalary(item)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default JobDetail;
