import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import {
  applicationStatusLabels,
  applicationStatuses,
  formatDate,
  nextApplicationStatuses,
  openCvBlob
} from "./recruiterUtils.js";

const RecruiterApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({
    companyId: searchParams.get("companyId") || "",
    jobId: searchParams.get("jobId") || "",
    status: searchParams.get("status") || "",
    keyword: searchParams.get("keyword") || "",
    minAiScore: searchParams.get("minAiScore") || "60"
  });
  const [aiMode, setAiMode] = useState(searchParams.get("ai") === "1");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [aiScoring, setAiScoring] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("reviewing");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [detailPosition, setDetailPosition] = useState({ x: 24, y: 96 });
  const [dragState, setDragState] = useState(null);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(applicationStatuses.map((status) => [status, []]));
    applications.forEach((application) => {
      const status = application.status || "submitted";
      if (!map[status]) map[status] = [];
      map[status].push(application);
    });
    return map;
  }, [applications]);

  const loadReferenceData = async () => {
    const [companyData, jobData] = await Promise.all([
      apiRequest("/api/recruiter/companies"),
      apiRequest("/api/recruiter/jobs?size=100")
    ]);
    setCompanies(Array.isArray(companyData) ? companyData : []);
    setJobs(Array.isArray(jobData) ? jobData : []);
  };

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.companyId) query.set("companyId", filters.companyId);
      if (filters.jobId) query.set("jobId", filters.jobId);
      if (filters.status) query.set("status", filters.status);
      if (filters.keyword) query.set("keyword", filters.keyword);
      if (aiMode) {
        query.set("ai", "1");
        query.set("minScore", filters.minAiScore || "0");
        query.set("minAiScore", filters.minAiScore || "0");
      }
      setSearchParams(query, { replace: true });
      const endpoint = aiMode ? "/api/recruiter/applications/ai-screen" : "/api/recruiter/applications";
      const data = await apiRequest(`${endpoint}?${query.toString()}`, {
        method: aiMode ? "POST" : "GET"
      });
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải ứng viên");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (applicationId) => {
    if (!applicationId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/recruiter/applications/${applicationId}`);
      setDetail(data || null);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết ứng viên");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadReferenceData().catch(() => {});
  }, []);

  useEffect(() => {
    loadApplications();
  }, [filters.companyId, filters.jobId, filters.status, filters.keyword, filters.minAiScore, aiMode]);

  useEffect(() => {
    loadDetail(id);
  }, [id]);

  useEffect(() => {
    if (!dragState) return undefined;

    const move = (event) => {
      const point = event.touches?.[0] || event;
      const nextX = Math.max(8, Math.min(window.innerWidth - 332, point.clientX - dragState.offsetX));
      const nextY = Math.max(8, Math.min(window.innerHeight - 120, point.clientY - dragState.offsetY));
      setDetailPosition({ x: nextX, y: nextY });
    };
    const stop = () => setDragState(null);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stop);
    };
  }, [dragState]);

  const handleFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "companyId" ? { jobId: "" } : {})
    }));
  };

  const closeDetail = () => {
    setDetail(null);
    setDragState(null);
    navigate(`/recruiter/applications?${searchParams.toString()}`, { replace: true });
  };

  const startDetailDrag = (event) => {
    const point = event.touches?.[0] || event;
    setDragState({
      offsetX: point.clientX - detailPosition.x,
      offsetY: point.clientY - detailPosition.y
    });
  };

  const toggleSelected = (applicationId) => {
    setSelectedIds((prev) => (
      prev.includes(applicationId)
        ? prev.filter((item) => item !== applicationId)
        : [...prev, applicationId]
    ));
  };

  const updateStatus = async (applicationId, status) => {
    setError("");
    setMessage("");
    try {
      await apiRequest(`/api/applications/${applicationId}/status?status=${encodeURIComponent(status)}`, {
        method: "PUT"
      });
      setMessage("Đã cập nhật trạng thái ứng viên.");
      await loadApplications();
      await loadDetail(applicationId);
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const bulkUpdateStatus = async () => {
    if (selectedIds.length === 0) return;
    setError("");
    setMessage("");
    try {
      await apiRequest("/api/recruiter/applications/status", {
        method: "PUT",
        body: JSON.stringify({ applicationIds: selectedIds, status: bulkStatus })
      });
      setSelectedIds([]);
      setMessage("Đã cập nhật trạng thái hàng loạt.");
      await loadApplications();
      if (id) await loadDetail(id);
    } catch (err) {
      setError(err.message || "Không thể cập nhật hàng loạt");
    }
  };

  const buildAiQuery = (refresh = false) => {
    const query = new URLSearchParams();
    if (filters.companyId) query.set("companyId", filters.companyId);
    if (filters.jobId) query.set("jobId", filters.jobId);
    if (filters.status) query.set("status", filters.status);
    if (filters.keyword) query.set("keyword", filters.keyword);
    query.set("minScore", filters.minAiScore || "0");
    if (refresh) query.set("refresh", "true");
    return query;
  };

  const refreshAiScores = async () => {
    setAiScoring(true);
    setError("");
    setMessage("");
    try {
      const data = await apiRequest(`/api/recruiter/applications/ai-screen?${buildAiQuery(true).toString()}`, {
        method: "POST"
      });
      setAiMode(true);
      setApplications(Array.isArray(data) ? data : []);
      setMessage("AI đã chấm và lọc CV theo mô tả công việc.");
      if (id) await loadDetail(id);
    } catch (err) {
      setError(err.message || "Không thể chấm CV bằng AI");
    } finally {
      setAiScoring(false);
    }
  };

  const scoreCurrentApplication = async () => {
    if (!detail?.id) return;
    setAiScoring(true);
    setError("");
    setMessage("");
    try {
      const data = await apiRequest(`/api/recruiter/applications/${detail.id}/ai-score?refresh=true`, {
        method: "POST"
      });
      setDetail(data || null);
      setMessage("AI đã chấm lại CV này.");
      await loadApplications();
    } catch (err) {
      setError(err.message || "Không thể chấm CV này bằng AI");
    } finally {
      setAiScoring(false);
    }
  };

  const handleOpenCv = async () => {
    if (!detail?.id) return;
    setError("");
    try {
      await openCvBlob(detail.id);
    } catch (err) {
      setError(err.message || "Không thể mở CV");
    }
  };

  const filteredJobs = jobs.filter((job) => !filters.companyId || String(job.companyId) === String(filters.companyId));
  const nextStatuses = detail ? nextApplicationStatuses[detail.status] || [] : [];

  return (
    <RecruiterLayout
      title="Ứng viên"
      description="Theo dõi hồ sơ theo trạng thái, xem CV và cập nhật tiến trình tuyển dụng."
      actions={<Link to="/recruiter/jobs" className="recruiter-primary-action">Tạo job</Link>}
    >
      {error ? <p className="recruiter-state error">{error}</p> : null}
      {message ? <p className="recruiter-state success">{message}</p> : null}

      <section className="recruiter-filters">
        <select name="companyId" value={filters.companyId} onChange={handleFilter}>
          <option value="">Tất cả công ty</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
        <select name="jobId" value={filters.jobId} onChange={handleFilter}>
          <option value="">Tất cả job</option>
          {filteredJobs.map((job) => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={handleFilter}>
          <option value="">Tất cả trạng thái</option>
          {applicationStatuses.map((status) => (
            <option key={status} value={status}>{applicationStatusLabels[status] || status}</option>
          ))}
        </select>
        <input
          name="keyword"
          value={filters.keyword}
          onChange={handleFilter}
          placeholder="Tìm ứng viên, job, công ty"
        />
        <select name="minAiScore" value={filters.minAiScore} onChange={handleFilter}>
          <option value="0">Mọi điểm AI</option>
          <option value="50">AI từ 50</option>
          <option value="60">AI từ 60</option>
          <option value="70">AI từ 70</option>
          <option value="80">AI từ 80</option>
        </select>
      </section>

      <section className="recruiter-bulk-bar">
        <strong>{selectedIds.length} hồ sơ đã chọn</strong>
        <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
          {applicationStatuses.filter((status) => status !== "submitted").map((status) => (
            <option key={status} value={status}>{applicationStatusLabels[status] || status}</option>
          ))}
        </select>
        <button type="button" className="recruiter-secondary-action" disabled={selectedIds.length === 0} onClick={bulkUpdateStatus}>
          Cập nhật hàng loạt
        </button>
        <button type="button" className="recruiter-primary-action" disabled={aiScoring} onClick={() => setAiMode((value) => !value)}>
          {aiMode ? "Tắt lọc AI" : "Bật lọc AI"}
        </button>
        <button type="button" className="recruiter-secondary-action" disabled={aiScoring} onClick={refreshAiScores}>
          {aiScoring ? "AI đang chấm..." : "Chấm lại bằng AI"}
        </button>
      </section>

      <section className={`recruiter-applications-layout ${detail || id ? "with-detail" : ""}`}>
        <div className="recruiter-kanban">
          {applicationStatuses.map((status) => (
            <article key={status} className="recruiter-kanban-column">
              <header>
                <strong>{applicationStatusLabels[status] || status}</strong>
                <span>{grouped[status]?.length || 0}</span>
              </header>
              <div className="recruiter-kanban-list">
                {loading ? <p className="recruiter-empty">Đang tải...</p> : null}
                {!loading && (grouped[status] || []).map((application) => (
                  <Link
                    key={application.id}
                    to={`/recruiter/applications/${application.id}?${searchParams.toString()}`}
                    className="recruiter-application-card"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(application.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleSelected(application.id)}
                    />
                    <strong>{application.candidateName || "Ứng viên"}</strong>
                    <span>{application.jobTitle}</span>
                    <small>{application.companyName}</small>
                    {application.aiScoreAvailable ? (
                      <div className={`recruiter-ai-score ${application.aiScore >= 80 ? "strong" : application.aiScore >= 60 ? "medium" : "weak"}`}>
                        <b>{application.aiScore}</b>
                        <span>{application.aiLevel || "AI match"}</span>
                      </div>
                    ) : null}
                    <div>
                      <em>{formatDate(application.applicationDate)}</em>
                      {application.hasCv ? <b>CV</b> : null}
                    </div>
                  </Link>
                ))}
                {!loading && (grouped[status] || []).length === 0 ? (
                  <p className="recruiter-empty">Không có hồ sơ.</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {id ? (
          <div className="recruiter-detail-overlay" onMouseDown={closeDetail} onTouchStart={closeDetail}>
          <aside
            className="recruiter-detail-panel"
            style={{ left: detailPosition.x, top: detailPosition.y }}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            {detailLoading ? <p className="recruiter-empty">Đang tải chi tiết...</p> : null}
            {!detailLoading && detail ? (
              <>
                <header
                  className="recruiter-detail-drag-handle"
                  onMouseDown={startDetailDrag}
                  onTouchStart={startDetailDrag}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.stopPropagation()}
                    onTouchStart={(event) => event.stopPropagation()}
                    onClick={closeDetail}
                  >
                    Đóng
                  </button>
                  <h2>Ứng viên: {detail.candidateName}</h2>
                  <p>{applicationStatusLabels[detail.status] || detail.status}</p>
                </header>
                <div className="recruiter-detail-section">
                  <h3>Thông tin ứng viên</h3>
                  <p>Email: {detail.candidateEmail || "Chưa có email"}</p>
                  <p>Số điện thoại: {detail.candidatePhone || "Chưa có số điện thoại"}</p>
                  <p>Địa chỉ: {detail.candidateAddress || "Chưa có địa chỉ"}</p>
                  <p>Kinh nghiệm: {detail.candidateExperienceYears ?? 0} năm</p>
                </div>
                <div className="recruiter-detail-section">
                  <h3>Ứng tuyển</h3>
                  <p>Job: {detail.jobTitle}</p>
                  <p>Công ty: {detail.companyName}</p>
                  <p>Ngày nộp: {formatDate(detail.applicationDate)}</p>
                </div>
                <div className="recruiter-detail-section">
                  <h3>AI lọc CV</h3>
                  {detail.aiScoreAvailable ? (
                    <>
                      <p>Điểm phù hợp: <strong>{detail.aiScore}/100</strong></p>
                      <p>Mức: {detail.aiLevel || "possible_match"}</p>
                      {(detail.aiSignals || []).length > 0 ? (
                        <ul className="recruiter-ai-signals">
                          {detail.aiSignals.map((signal) => <li key={signal}>{signal}</li>)}
                        </ul>
                      ) : null}
                      <p>Chấm lúc: {formatDate(detail.aiScoredAt)}</p>
                    </>
                  ) : (
                    <p>Chưa có điểm AI cho hồ sơ này.</p>
                  )}
                  <button type="button" className="recruiter-secondary-action" disabled={aiScoring} onClick={scoreCurrentApplication}>
                    {aiScoring ? "Đang chấm..." : "Chấm CV bằng AI"}
                  </button>
                </div>
                <div className="recruiter-detail-actions">
                  <button type="button" disabled={!detail.hasCv} onClick={handleOpenCv}>
                    Xem CV
                  </button>
                  {nextStatuses.map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(detail.id, status)}>
                      Chuyển {applicationStatusLabels[status] || status}
                    </button>
                  ))}
                </div>
                <div className="recruiter-detail-section">
                  <h3>Timeline</h3>
                  {(detail.timeline || []).length > 0 ? detail.timeline.map((item, index) => (
                    <div key={`${item.toStatus}-${index}`} className="recruiter-timeline-row">
                      <strong>
                        {applicationStatusLabels[item.fromStatus] || item.fromStatus || "Mới"} → {applicationStatusLabels[item.toStatus] || item.toStatus}
                      </strong>
                      <span>{formatDate(item.changedAt)}</span>
                    </div>
                  )) : <p>Chưa có lịch sử trạng thái.</p>}
                </div>
              </>
            ) : null}
          </aside>
          </div>
        ) : null}
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterApplications;
