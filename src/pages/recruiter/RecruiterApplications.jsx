import { useEffect, useMemo, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
      setError(err.message || "KhÃ´ng thá»ƒ táº£i á»©ng viÃªn");
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
      setError(err.message || "KhÃ´ng thá»ƒ táº£i chi tiáº¿t á»©ng viÃªn");
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
      setMessage("ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i á»©ng viÃªn.");
      await loadApplications();
      await loadDetail(applicationId);
    } catch (err) {
      setError(err.message || "KhÃ´ng thá»ƒ cáº­p nháº­t tráº¡ng thÃ¡i");
    }
  };

  const handleDragEnd = async (event) => {
    const applicationId = event.active?.data?.current?.applicationId;
    const fromStatus = event.active?.data?.current?.status;
    const nextStatus = event.over?.data?.current?.status;
    if (!applicationId || !nextStatus || fromStatus === nextStatus) {
      return;
    }
    await updateStatus(applicationId, nextStatus);
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
      setMessage("ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i hÃ ng loáº¡t.");
      await loadApplications();
      if (id) await loadDetail(id);
    } catch (err) {
      setError(err.message || "KhÃ´ng thá»ƒ cáº­p nháº­t hÃ ng loáº¡t");
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
      setMessage("AI Ä‘Ã£ cháº¥m vÃ  lá»c CV theo mÃ´ táº£ cÃ´ng viá»‡c.");
      if (id) await loadDetail(id);
    } catch (err) {
      setError(err.message || "KhÃ´ng thá»ƒ cháº¥m CV báº±ng AI");
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
      setMessage("AI Ä‘Ã£ cháº¥m láº¡i CV nÃ y.");
      await loadApplications();
    } catch (err) {
      setError(err.message || "KhÃ´ng thá»ƒ cháº¥m CV nÃ y báº±ng AI");
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
      setError(err.message || "KhÃ´ng thá»ƒ má»Ÿ CV");
    }
  };

  const filteredJobs = jobs.filter((job) => !filters.companyId || String(job.companyId) === String(filters.companyId));
  const nextStatuses = detail ? nextApplicationStatuses[detail.status] || [] : [];
  const skillChartData = detail?.aiScoreAvailable ? [
    { name: "PhÃ¹ há»£p", value: detail.aiScore || 0 },
    { name: "Äiá»ƒm máº¡nh", value: Math.min(100, (detail.aiPros || []).length * 20) },
    { name: "Cáº§n bÃ¹", value: Math.min(100, (detail.aiCons || []).length * 20) }
  ] : [];

  return (
    <RecruiterLayout
      title="á»¨ng viÃªn"
      description="Theo dÃµi há»“ sÆ¡ theo tráº¡ng thÃ¡i, xem CV vÃ  cáº­p nháº­t tiáº¿n trÃ¬nh tuyá»ƒn dá»¥ng."
      actions={<Link to="/recruiter/jobs" className="recruiter-primary-action">Táº¡o job</Link>}
    >
      {error ? <p className="recruiter-state error">{error}</p> : null}
      {message ? <p className="recruiter-state success">{message}</p> : null}

      <section className="recruiter-filters">
        <select name="companyId" value={filters.companyId} onChange={handleFilter}>
          <option value="">Táº¥t cáº£ cÃ´ng ty</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
        <select name="jobId" value={filters.jobId} onChange={handleFilter}>
          <option value="">Táº¥t cáº£ job</option>
          {filteredJobs.map((job) => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={handleFilter}>
          <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
          {applicationStatuses.map((status) => (
            <option key={status} value={status}>{applicationStatusLabels[status] || status}</option>
          ))}
        </select>
        <input
          name="keyword"
          value={filters.keyword}
          onChange={handleFilter}
          placeholder="TÃ¬m á»©ng viÃªn, job, cÃ´ng ty"
        />
        <select name="minAiScore" value={filters.minAiScore} onChange={handleFilter}>
          <option value="0">Má»i Ä‘iá»ƒm AI</option>
          <option value="50">AI tá»« 50</option>
          <option value="60">AI tá»« 60</option>
          <option value="70">AI tá»« 70</option>
          <option value="80">AI tá»« 80</option>
        </select>
      </section>

      <section className="recruiter-bulk-bar">
        <strong>{selectedIds.length} há»“ sÆ¡ Ä‘Ã£ chá»n</strong>
        <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
          {applicationStatuses.filter((status) => status !== "submitted").map((status) => (
            <option key={status} value={status}>{applicationStatusLabels[status] || status}</option>
          ))}
        </select>
        <button type="button" className="recruiter-secondary-action" disabled={selectedIds.length === 0} onClick={bulkUpdateStatus}>
          Cáº­p nháº­t hÃ ng loáº¡t
        </button>
        <button type="button" className="recruiter-primary-action" disabled={aiScoring} onClick={() => setAiMode((value) => !value)}>
          {aiMode ? "Táº¯t lá»c AI" : "Báº­t lá»c AI"}
        </button>
        <button type="button" className="recruiter-secondary-action" disabled={aiScoring} onClick={refreshAiScores}>
          {aiScoring ? "AI Ä‘ang cháº¥m..." : "Cháº¥m láº¡i báº±ng AI"}
        </button>
      </section>

      <section className={`recruiter-applications-layout ${detail || id ? "with-detail" : ""}`}>
        <DndContext onDragEnd={handleDragEnd}>
          <div className="recruiter-kanban">
            {applicationStatuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                items={grouped[status] || []}
                loading={loading}
                selectedIds={selectedIds}
                searchParams={searchParams}
                toggleSelected={toggleSelected}
              />
            ))}
          </div>
        </DndContext>
        {id ? (
          <div className="recruiter-detail-overlay" onMouseDown={closeDetail} onTouchStart={closeDetail}>
          <aside
            className="recruiter-detail-panel"
            style={{ left: detailPosition.x, top: detailPosition.y }}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            {detailLoading ? <p className="recruiter-empty">Äang táº£i chi tiáº¿t...</p> : null}
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
                    ÄÃ³ng
                  </button>
                  <h2>á»¨ng viÃªn: {detail.candidateName}</h2>
                  <p>{applicationStatusLabels[detail.status] || detail.status}</p>
                </header>
                <div className="recruiter-detail-section">
                  <h3>ThÃ´ng tin á»©ng viÃªn</h3>
                  <p>Email: {detail.candidateEmail || "ChÆ°a cÃ³ email"}</p>
                  <p>Sá»‘ Ä‘iá»‡n thoáº¡i: {detail.candidatePhone || "ChÆ°a cÃ³ sá»‘ Ä‘iá»‡n thoáº¡i"}</p>
                  <p>Äá»‹a chá»‰: {detail.candidateAddress || "ChÆ°a cÃ³ Ä‘á»‹a chá»‰"}</p>
                  <p>Kinh nghiá»‡m: {detail.candidateExperienceYears ?? 0} nÄƒm</p>
                </div>
                <div className="recruiter-detail-section">
                  <h3>á»¨ng tuyá»ƒn</h3>
                  <p>Job: {detail.jobTitle}</p>
                  <p>CÃ´ng ty: {detail.companyName}</p>
                  <p>NgÃ y ná»™p: {formatDate(detail.applicationDate)}</p>
                </div>
                <div className="recruiter-detail-section">
                  <h3>AI lá»c CV</h3>
                  {detail.aiScoreAvailable ? (
                    <>
                      <p>Äiá»ƒm phÃ¹ há»£p: <strong>{detail.aiScore}/100</strong></p>
                      <p>Má»©c: {detail.aiLevel || "possible_match"}</p>
                      <div className="recruiter-skill-chart">
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={skillChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {(detail.aiPros || []).length > 0 ? (
                        <div className="recruiter-ai-explain">
                          <strong>Điểm mạnh</strong>
                          <ul>{detail.aiPros.map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                      ) : null}
                      {(detail.aiCons || []).length > 0 ? (
                        <div className="recruiter-ai-explain warning">
                          <strong>Điểm cần bổ sung</strong>
                          <ul>{detail.aiCons.map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                      ) : null}
                      {(detail.aiSignals || []).length > 0 ? (
                        <ul className="recruiter-ai-signals">
                          {detail.aiSignals.map((signal) => <li key={signal}>{signal}</li>)}
                        </ul>
                      ) : null}
                      <p>Cháº¥m lÃºc: {formatDate(detail.aiScoredAt)}</p>
                    </>
                  ) : (
                    <p>ChÆ°a cÃ³ Ä‘iá»ƒm AI cho há»“ sÆ¡ nÃ y.</p>
                  )}
                  <button type="button" className="recruiter-secondary-action" disabled={aiScoring} onClick={scoreCurrentApplication}>
                    {aiScoring ? "Äang cháº¥m..." : "Cháº¥m CV báº±ng AI"}
                  </button>
                </div>
                <div className="recruiter-detail-actions">
                  <button type="button" disabled={!detail.hasCv} onClick={handleOpenCv}>
                    Xem CV
                  </button>
                  <Link className="recruiter-secondary-action" to={`/recruiter/interviews?applicationId=${detail.id}`}>
                    Hẹn lịch
                  </Link>
                  {nextStatuses.map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(detail.id, status)}>
                      Chuyá»ƒn {applicationStatusLabels[status] || status}
                    </button>
                  ))}
                </div>
                <div className="recruiter-detail-section">
                  <h3>Timeline</h3>
                  {(detail.timeline || []).length > 0 ? detail.timeline.map((item, index) => (
                    <div key={`${item.toStatus}-${index}`} className="recruiter-timeline-row">
                      <strong>
                        {applicationStatusLabels[item.fromStatus] || item.fromStatus || "Má»›i"} â†’ {applicationStatusLabels[item.toStatus] || item.toStatus}
                      </strong>
                      <span>{formatDate(item.changedAt)}</span>
                    </div>
                  )) : <p>ChÆ°a cÃ³ lá»‹ch sá»­ tráº¡ng thÃ¡i.</p>}
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

const KanbanColumn = ({ status, items, loading, selectedIds, searchParams, toggleSelected }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status }
  });

  return (
    <article ref={setNodeRef} className={`recruiter-kanban-column ${isOver ? "is-over" : ""}`}>
      <header>
        <strong>{applicationStatusLabels[status] || status}</strong>
        <span>{items.length}</span>
      </header>
      <div className="recruiter-kanban-list">
        {loading ? <p className="recruiter-empty">Đang tải...</p> : null}
        {!loading && items.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            selected={selectedIds.includes(application.id)}
            searchParams={searchParams}
            toggleSelected={toggleSelected}
          />
        ))}
        {!loading && items.length === 0 ? (
          <p className="recruiter-empty">Không có hồ sơ.</p>
        ) : null}
      </div>
    </article>
  );
};

const ApplicationCard = ({ application, selected, searchParams, toggleSelected }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `application-${application.id}`,
    data: { applicationId: application.id, status: application.status || "submitted" }
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 }
    : undefined;

  return (
    <Link
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      to={`/recruiter/applications/${application.id}?${searchParams.toString()}`}
      className={`recruiter-application-card ${isDragging ? "dragging" : ""}`}
    >
      <input
        type="checkbox"
        checked={selected}
        onPointerDown={(event) => event.stopPropagation()}
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
  );
};

export default RecruiterApplications;

