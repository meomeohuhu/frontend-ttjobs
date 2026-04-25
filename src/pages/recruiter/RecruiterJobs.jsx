import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatDate, formatNumber, formatSalary, jobStatuses } from "./recruiterUtils.js";

const emptyJob = {
  title: "",
  companyId: "",
  description: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  currency: "VND",
  jobType: "Full-time",
  experienceLevel: "ENTRY",
  category: "INFORMATION-TECHNOLOGY",
  applicationDeadline: "",
  status: "draft"
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toJobForm = (job) => ({
  title: job.title || "",
  companyId: job.companyId ? String(job.companyId) : "",
  description: job.description || "",
  location: job.location || "",
  salaryMin: job.salaryMin == null ? "" : String(job.salaryMin),
  salaryMax: job.salaryMax == null ? "" : String(job.salaryMax),
  currency: job.currency || "VND",
  jobType: job.jobType || "Full-time",
  experienceLevel: job.experienceLevel || "ENTRY",
  category: job.category || "INFORMATION-TECHNOLOGY",
  applicationDeadline: toDateTimeLocal(job.applicationDeadline),
  status: job.status || "draft"
});

const RecruiterJobs = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [filters, setFilters] = useState({ companyId: "", status: "", keyword: "" });
  const [form, setForm] = useState(emptyJob);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedJob = useMemo(
    () => jobs.find((job) => String(job.id) === String(selectedJobId)) || null,
    [jobs, selectedJobId]
  );

  const loadCompanies = async () => {
    const data = await apiRequest("/api/recruiter/companies");
    const list = Array.isArray(data) ? data : [];
    setCompanies(list);
    if (!form.companyId && list[0]?.id) {
      setForm((prev) => ({ ...prev, companyId: String(list[0].id) }));
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.companyId) query.set("companyId", filters.companyId);
      if (filters.status) query.set("status", filters.status);
      if (filters.keyword) query.set("keyword", filters.keyword);
      const data = await apiRequest(`/api/recruiter/jobs?${query.toString()}`);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải job");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies().catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [filters.companyId, filters.status, filters.keyword]);

  useEffect(() => {
    if (selectedJob) {
      setForm(toJobForm(selectedJob));
    }
  }, [selectedJob]);

  const handleFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetCreate = () => {
    setSelectedJobId("");
    setForm({ ...emptyJob, companyId: companies[0]?.id ? String(companies[0].id) : "" });
    setMessage("");
    setError("");
  };

  const payloadFromForm = (nextStatus = form.status) => ({
    title: form.title,
    description: form.description,
    location: form.location,
    salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
    salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
    currency: form.currency,
    jobType: form.jobType,
    experienceLevel: form.experienceLevel,
    category: form.category,
    status: nextStatus,
    applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline).toISOString() : null,
    company: { id: Number(form.companyId) }
  });

  const saveJob = async (event) => {
    event.preventDefault();
    await submitJob(form.status);
  };

  const submitJob = async (status) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = payloadFromForm(status);
      if (selectedJob) {
        await apiRequest(`/api/jobs/${selectedJob.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setMessage("Đã cập nhật job.");
      } else {
        const created = await apiRequest("/api/jobs", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setSelectedJobId(created?.id ? String(created.id) : "");
        setMessage("Đã tạo job.");
      }
      await loadJobs();
    } catch (err) {
      setError(err.message || "Không thể lưu job");
    } finally {
      setSaving(false);
    }
  };

  const archiveJob = async () => {
    if (!selectedJob) return;
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/api/jobs/${selectedJob.id}`, { method: "DELETE" });
      setSelectedJobId("");
      setMessage("Đã archive job.");
      await loadJobs();
    } catch (err) {
      setError(err.message || "Không thể archive job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RecruiterLayout
      title="Tin tuyển dụng"
      description="Tạo, publish, đóng và theo dõi hiệu quả từng job."
      actions={<button type="button" className="recruiter-primary-action" onClick={resetCreate}>Tạo job</button>}
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
        <select name="status" value={filters.status} onChange={handleFilter}>
          <option value="">Tất cả trạng thái</option>
          {jobStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          name="keyword"
          value={filters.keyword}
          onChange={handleFilter}
          placeholder="Tìm theo title, công ty, mô tả"
        />
      </section>

      <section className="recruiter-two-column recruiter-two-column-wide">
        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>Danh sách job</h2>
          </header>
          <div className="recruiter-table">
            {loading ? <p className="recruiter-empty">Đang tải job...</p> : null}
            {!loading && jobs.length === 0 ? <p className="recruiter-empty">Chưa có job phù hợp.</p> : null}
            {!loading && jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                className={`recruiter-table-row ${String(selectedJobId) === String(job.id) ? "active" : ""}`}
                onClick={() => setSelectedJobId(String(job.id))}
              >
                <div>
                  <strong>{job.title}</strong>
                  <span>{job.companyName}</span>
                </div>
                <div>
                  <strong>{job.status}</strong>
                  <span>{formatSalary(job)}</span>
                </div>
                <div>
                  <strong>{formatNumber(job.applicationCount)} hồ sơ</strong>
                  <span>Hạn {formatDate(job.applicationDeadline)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>{selectedJob ? "Sửa job" : "Tạo job"}</h2>
          </header>
          <form className="recruiter-form" onSubmit={saveJob}>
            <label className="wide">
              <span>Tiêu đề</span>
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              <span>Công ty</span>
              <select name="companyId" value={form.companyId} onChange={handleChange} required disabled={Boolean(selectedJob)}>
                <option value="">Chọn công ty</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Trạng thái</span>
              <select name="status" value={form.status} onChange={handleChange}>
                {jobStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Địa điểm</span>
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
            <label>
              <span>Loại việc</span>
              <select name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="Full-time">Toàn thời gian</option>
                <option value="Part-time">Bán thời gian</option>
                <option value="Contract">Hợp đồng</option>
                <option value="Internship">Thực tập</option>
                <option value="Remote">Từ xa</option>
              </select>
            </label>
            <label>
              <span>Kinh nghiệm</span>
              <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                <option value="ENTRY">Entry</option>
                <option value="MID">Middle</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </select>
            </label>
            <label>
              <span>Ngành nghề</span>
              <input name="category" value={form.category} onChange={handleChange} />
            </label>
            <label>
              <span>Lương tối thiểu</span>
              <input name="salaryMin" type="number" min="0" value={form.salaryMin} onChange={handleChange} />
            </label>
            <label>
              <span>Lương tối đa</span>
              <input name="salaryMax" type="number" min="0" value={form.salaryMax} onChange={handleChange} />
            </label>
            <label>
              <span>Tiền tệ</span>
              <input name="currency" value={form.currency} onChange={handleChange} />
            </label>
            <label>
              <span>Hạn ứng tuyển</span>
              <input name="applicationDeadline" type="datetime-local" value={form.applicationDeadline} onChange={handleChange} />
            </label>
            <label className="wide">
              <span>Mô tả</span>
              <textarea name="description" rows="7" value={form.description} onChange={handleChange} />
            </label>
            <div className="recruiter-form-actions">
              <button type="submit" className="recruiter-primary-action" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              {!selectedJob || form.status === "draft" ? (
                <button type="button" className="recruiter-secondary-action" onClick={() => submitJob("open")} disabled={saving}>
                  Publish
                </button>
              ) : null}
              {selectedJob && form.status === "open" ? (
                <button type="button" className="recruiter-secondary-action" onClick={() => submitJob("closed")} disabled={saving}>
                  Đóng job
                </button>
              ) : null}
              {selectedJob && form.status !== "archived" ? (
                <button type="button" className="recruiter-danger-action" onClick={archiveJob} disabled={saving}>
                  Archive
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterJobs;
