import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatDate, formatNumber } from "./recruiterUtils.js";

const emptyForm = {
  companyId: "",
  name: "",
  description: "",
  status: "active",
  targetHires: "",
  startsAt: "",
  endsAt: "",
  jobIds: []
};

const RecruiterCampaigns = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [companyData, jobData, campaignData] = await Promise.all([
        apiRequest("/api/recruiter/companies"),
        apiRequest("/api/recruiter/jobs?size=200"),
        apiRequest("/api/recruiter/campaigns")
      ]);
      const companyList = Array.isArray(companyData) ? companyData : [];
      setCompanies(companyList);
      setJobs(Array.isArray(jobData) ? jobData : []);
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
      if (!form.companyId && companyList[0]?.id) {
        setForm((prev) => ({ ...prev, companyId: String(companyList[0].id) }));
      }
    } catch (err) {
      setError(err.message || "Không thể tải chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleJob = (jobId) => {
    setForm((prev) => ({
      ...prev,
      jobIds: prev.jobIds.includes(jobId)
        ? prev.jobIds.filter((id) => id !== jobId)
        : [...prev.jobIds, jobId]
    }));
  };

  const editCampaign = (campaign) => {
    setSelectedId(campaign.id);
    setForm({
      companyId: campaign.companyId ? String(campaign.companyId) : "",
      name: campaign.name || "",
      description: campaign.description || "",
      status: campaign.status || "active",
      targetHires: campaign.targetHires == null ? "" : String(campaign.targetHires),
      startsAt: campaign.startsAt ? new Date(campaign.startsAt).toISOString().slice(0, 16) : "",
      endsAt: campaign.endsAt ? new Date(campaign.endsAt).toISOString().slice(0, 16) : "",
      jobIds: campaign.jobIds || []
    });
  };

  const resetForm = () => {
    setSelectedId("");
    setForm({ ...emptyForm, companyId: companies[0]?.id ? String(companies[0].id) : "" });
  };

  const saveCampaign = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        companyId: Number(form.companyId),
        targetHires: form.targetHires === "" ? null : Number(form.targetHires),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null
      };
      await apiRequest(selectedId ? `/api/recruiter/campaigns/${selectedId}` : "/api/recruiter/campaigns", {
        method: selectedId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setMessage(selectedId ? "Đã cập nhật chiến dịch." : "Đã tạo chiến dịch.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể lưu chiến dịch");
    } finally {
      setSaving(false);
    }
  };

  const visibleJobs = jobs.filter((job) => !form.companyId || String(job.companyId) === String(form.companyId));

  return (
    <RecruiterLayout
      title="Chiến dịch tuyển dụng"
      description="Gom job theo chiến dịch để theo dõi pipeline và mục tiêu tuyển dụng."
      actions={<button type="button" className="recruiter-primary-action" onClick={resetForm}>Tạo chiến dịch</button>}
    >
      {error ? <p className="recruiter-state error">{error}</p> : null}
      {message ? <p className="recruiter-state success">{message}</p> : null}

      <section className="recruiter-two-column recruiter-two-column-wide">
        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>Danh sách chiến dịch</h2>
          </header>
          <div className="recruiter-table">
            {loading ? <p className="recruiter-empty">Đang tải...</p> : null}
            {!loading && campaigns.length === 0 ? <p className="recruiter-empty">Chưa có chiến dịch.</p> : null}
            {!loading && campaigns.map((campaign) => (
              <button key={campaign.id} type="button" className="recruiter-table-row" onClick={() => editCampaign(campaign)}>
                <div>
                  <strong>{campaign.name}</strong>
                  <span>{campaign.companyName}</span>
                </div>
                <div>
                  <strong>{campaign.status}</strong>
                  <span>{formatNumber(campaign.jobCount)} job · {formatNumber(campaign.applicationCount)} hồ sơ</span>
                </div>
                <div>
                  <strong>Mục tiêu {campaign.targetHires || 0}</strong>
                  <span>{formatDate(campaign.endsAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>{selectedId ? "Sửa chiến dịch" : "Tạo chiến dịch"}</h2>
          </header>
          <form className="recruiter-form" onSubmit={saveCampaign}>
            <label className="wide">
              <span>Tên chiến dịch</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              <span>Công ty</span>
              <select name="companyId" value={form.companyId} onChange={handleChange} required>
                <option value="">Chọn công ty</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Trạng thái</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              <span>Mục tiêu tuyển</span>
              <input name="targetHires" type="number" min="0" value={form.targetHires} onChange={handleChange} />
            </label>
            <label>
              <span>Bắt đầu</span>
              <input name="startsAt" type="datetime-local" value={form.startsAt} onChange={handleChange} />
            </label>
            <label>
              <span>Kết thúc</span>
              <input name="endsAt" type="datetime-local" value={form.endsAt} onChange={handleChange} />
            </label>
            <label className="wide">
              <span>Mô tả</span>
              <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
            </label>
            <div className="recruiter-checkbox-list wide">
              <span>Job trong chiến dịch</span>
              {visibleJobs.map((job) => (
                <label key={job.id}>
                  <input
                    type="checkbox"
                    checked={form.jobIds.includes(job.id)}
                    onChange={() => toggleJob(job.id)}
                  />
                  {job.title}
                </label>
              ))}
            </div>
            <div className="recruiter-form-actions">
              <button type="submit" className="recruiter-primary-action" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu chiến dịch"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterCampaigns;
