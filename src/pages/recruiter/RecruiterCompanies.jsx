import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { formatNumber } from "./recruiterUtils.js";

const emptyCompany = {
  name: "",
  description: "",
  location: "",
  website: "",
  industry: "",
  logoUrl: ""
};

const emptyMember = {
  userId: "",
  memberRole: "RECRUITER"
};

const RecruiterCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyCompany);
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCompany = useMemo(
    () => companies.find((company) => String(company.id) === String(selectedId)) || null,
    [companies, selectedId]
  );

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/recruiter/companies");
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải công ty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setForm(emptyCompany);
      setMembers([]);
      setLogoFile(null);
      return;
    }
    setForm({
      name: selectedCompany.name || "",
      description: selectedCompany.description || "",
      location: selectedCompany.location || "",
      website: selectedCompany.website || "",
      industry: selectedCompany.industry || "",
      logoUrl: selectedCompany.logoUrl || ""
    });
    setLogoFile(null);
    apiRequest(`/api/companies/${selectedCompany.id}/members`)
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]));
  }, [selectedCompany]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoFile = (event) => {
    setLogoFile(event.target.files?.[0] || null);
  };

  const uploadLogo = async (companyId) => {
    if (!logoFile) {
      return null;
    }
    const formData = new FormData();
    formData.append("file", logoFile);
    return apiRequest(`/api/companies/${companyId}/logo`, {
      method: "POST",
      body: formData
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = { ...form };
      let targetId = selectedCompany?.id;
      if (selectedCompany) {
        await apiRequest(`/api/companies/${selectedCompany.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setMessage("Đã cập nhật công ty.");
      } else {
        const created = await apiRequest("/api/companies", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        targetId = created?.id;
        setSelectedId(targetId ? String(targetId) : "");
        setMessage("Đã tạo công ty.");
      }
      if (targetId && logoFile) {
        const uploaded = await uploadLogo(targetId);
        if (uploaded?.logoUrl) {
          setForm((prev) => ({ ...prev, logoUrl: uploaded.logoUrl }));
        }
        setLogoFile(null);
      }
      await loadCompanies();
    } catch (err) {
      setError(err.message || "Không thể lưu công ty");
    } finally {
      setSaving(false);
    }
  };

  const resetCreate = () => {
    setSelectedId("");
    setForm(emptyCompany);
    setLogoFile(null);
    setMembers([]);
    setMessage("");
    setError("");
  };

  const addMember = async (event) => {
    event.preventDefault();
    if (!selectedCompany || !memberForm.userId) return;
    setError("");
    try {
      await apiRequest(`/api/companies/${selectedCompany.id}/members`, {
        method: "POST",
        body: JSON.stringify({
          userId: Number(memberForm.userId),
          memberRole: memberForm.memberRole
        })
      });
      setMemberForm(emptyMember);
      const data = await apiRequest(`/api/companies/${selectedCompany.id}/members`);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể thêm thành viên");
    }
  };

  const updateMemberRole = async (member, role) => {
    if (!selectedCompany) return;
    setError("");
    try {
      await apiRequest(`/api/companies/${selectedCompany.id}/members/${member.id}`, {
        method: "PUT",
        body: JSON.stringify({ userId: member.userId, memberRole: role })
      });
      const data = await apiRequest(`/api/companies/${selectedCompany.id}/members`);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể cập nhật quyền");
    }
  };

  const removeMember = async (memberId) => {
    if (!selectedCompany) return;
    setError("");
    try {
      await apiRequest(`/api/companies/${selectedCompany.id}/members/${memberId}`, {
        method: "DELETE"
      });
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      setError(err.message || "Không thể xoá thành viên");
    }
  };

  return (
    <RecruiterLayout
      title="Quản lý công ty"
      description="Tạo hồ sơ công ty, chỉnh thông tin và phân quyền thành viên."
      actions={<button type="button" className="recruiter-primary-action" onClick={resetCreate}>Tạo công ty</button>}
    >
      {loading ? <p className="recruiter-state">Đang tải công ty...</p> : null}
      {error ? <p className="recruiter-state error">{error}</p> : null}
      {message ? <p className="recruiter-state success">{message}</p> : null}

      <section className="recruiter-two-column">
        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>Công ty đang quản lý</h2>
          </header>
          <div className="recruiter-side-list">
            {companies.length > 0 ? companies.map((company) => (
              <button
                key={company.id}
                type="button"
                className={`recruiter-company-card ${String(selectedId) === String(company.id) ? "active" : ""}`}
                onClick={() => setSelectedId(String(company.id))}
              >
                <strong>{company.name}</strong>
                <span>{company.location || "Chưa có địa điểm"}</span>
                <small>{formatNumber(company.openJobCount)} job mở - {company.memberRole}</small>
              </button>
            )) : <p className="recruiter-empty">Chưa có công ty nào.</p>}
          </div>
        </div>

        <div className="recruiter-panel">
          <header className="recruiter-panel-header">
            <h2>{selectedCompany ? "Thông tin công ty" : "Tạo công ty"}</h2>
          </header>
          <form className="recruiter-form" onSubmit={handleSubmit}>
            <div className="image-upload-card wide">
              <div className="image-upload-preview">
                {logoFile || form.logoUrl ? (
                  <img src={logoFile ? URL.createObjectURL(logoFile) : form.logoUrl} alt="Logo công ty" />
                ) : (
                  <span>{(form.name || "TT").slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="image-upload-copy">
                <strong>Ảnh đại diện công ty</strong>
                <span>JPG, PNG hoặc WEBP. Tối đa 3MB.</span>
                <label className="image-upload-button">
                  Chọn logo
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFile} />
                </label>
              </div>
            </div>
            <label>
              <span>Tên công ty</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              <span>Ngành nghề</span>
              <input name="industry" value={form.industry} onChange={handleChange} />
            </label>
            <label>
              <span>Địa điểm</span>
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
            <label>
              <span>Website</span>
              <input name="website" value={form.website} onChange={handleChange} />
            </label>
            <label className="wide">
              <span>Logo URL</span>
              <input name="logoUrl" value={form.logoUrl} onChange={handleChange} />
            </label>
            <label className="wide">
              <span>Mô tả</span>
              <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
            </label>
            <div className="recruiter-form-actions">
              <button type="submit" className="recruiter-primary-action" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu công ty"}
              </button>
            </div>
          </form>

          {selectedCompany ? (
            <div className="recruiter-members">
              <h3>Thành viên</h3>
              <form className="recruiter-inline-form" onSubmit={addMember}>
                <input
                  type="number"
                  min="1"
                  placeholder="User ID"
                  value={memberForm.userId}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, userId: event.target.value }))}
                />
                <select
                  value={memberForm.memberRole}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, memberRole: event.target.value }))}
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button type="submit">Thêm</button>
              </form>
              <div className="recruiter-member-list">
                {members.map((member) => (
                  <div key={member.id} className="recruiter-member-row">
                    <div>
                      <strong>{member.userName || member.userEmail || `User ${member.userId}`}</strong>
                      <span>{member.userEmail}</span>
                    </div>
                    <select value={member.memberRole} onChange={(event) => updateMemberRole(member, event.target.value)}>
                      <option value="RECRUITER">Recruiter</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button type="button" onClick={() => removeMember(member.id)}>Xoá</button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterCompanies;
