import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import {
  applicationStatuses,
  formatDate,
  nextApplicationStatuses,
  openCvBlob
} from "./recruiterUtils.js";

const RecruiterApplications = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({
    companyId: searchParams.get("companyId") || "",
    jobId: searchParams.get("jobId") || "",
    status: searchParams.get("status") || "",
    keyword: searchParams.get("keyword") || ""
  });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      setSearchParams(query, { replace: true });
      const data = await apiRequest(`/api/recruiter/applications?${query.toString()}`);
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
  }, [filters.companyId, filters.jobId, filters.status, filters.keyword]);

  useEffect(() => {
    loadDetail(id);
  }, [id]);

  const handleFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "companyId" ? { jobId: "" } : {})
    }));
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
      title="Pipeline ứng viên"
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
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          name="keyword"
          value={filters.keyword}
          onChange={handleFilter}
          placeholder="Tìm ứng viên, job, công ty"
        />
      </section>

      <section className={`recruiter-applications-layout ${detail || id ? "with-detail" : ""}`}>
        <div className="recruiter-kanban">
          {applicationStatuses.map((status) => (
            <article key={status} className="recruiter-kanban-column">
              <header>
                <strong>{status}</strong>
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
                    <strong>{application.candidateName || "Ứng viên"}</strong>
                    <span>{application.jobTitle}</span>
                    <small>{application.companyName}</small>
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
          <aside className="recruiter-detail-panel">
            {detailLoading ? <p className="recruiter-empty">Đang tải chi tiết...</p> : null}
            {!detailLoading && detail ? (
              <>
                <header>
                  <Link to={`/recruiter/applications?${searchParams.toString()}`}>Đóng</Link>
                  <h2>{detail.candidateName || "Ứng viên"}</h2>
                  <p>{detail.status}</p>
                </header>
                <div className="recruiter-detail-section">
                  <h3>Thông tin ứng viên</h3>
                  <p>{detail.candidateEmail || "Chưa có email"}</p>
                  <p>{detail.candidatePhone || "Chưa có số điện thoại"}</p>
                  <p>{detail.candidateAddress || "Chưa có địa chỉ"}</p>
                  <p>{detail.candidateExperienceYears ?? 0} năm kinh nghiệm</p>
                </div>
                <div className="recruiter-detail-section">
                  <h3>Ứng tuyển</h3>
                  <p>{detail.jobTitle}</p>
                  <p>{detail.companyName}</p>
                  <p>{formatDate(detail.applicationDate)}</p>
                </div>
                <div className="recruiter-detail-actions">
                  <button type="button" disabled={!detail.hasCv} onClick={handleOpenCv}>
                    Xem CV
                  </button>
                  {nextStatuses.map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(detail.id, status)}>
                      Chuyển {status}
                    </button>
                  ))}
                </div>
                <div className="recruiter-detail-section">
                  <h3>Timeline</h3>
                  {(detail.timeline || []).length > 0 ? detail.timeline.map((item, index) => (
                    <div key={`${item.toStatus}-${index}`} className="recruiter-timeline-row">
                      <strong>{item.fromStatus || "new"} → {item.toStatus}</strong>
                      <span>{formatDate(item.changedAt)}</span>
                    </div>
                  )) : <p>Chưa có lịch sử trạng thái.</p>}
                </div>
              </>
            ) : null}
          </aside>
        ) : null}
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterApplications;
