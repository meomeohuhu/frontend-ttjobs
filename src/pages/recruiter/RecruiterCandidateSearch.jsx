import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import RecruiterLayout from "./RecruiterLayout.jsx";
import { applicationStatusLabels } from "./recruiterUtils.js";

const text = {
  title: "T\u00ecm \u1ee9ng vi\u00ean",
  description: "T\u00ecm trong nh\u00f3m \u1ee9ng vi\u00ean \u0111\u00e3 n\u1ed9p CV v\u00e0o c\u00e1c job b\u1ea1n qu\u1ea3n l\u00fd.",
  keyword: "T\u00ean, email, job",
  minExp: "Kinh nghi\u1ec7m t\u1ed1i thi\u1ec3u",
  allStatuses: "T\u1ea5t c\u1ea3 tr\u1ea1ng th\u00e1i",
  result: "K\u1ebft qu\u1ea3",
  loading: "\u0110ang t\u00ecm...",
  empty: "Ch\u01b0a c\u00f3 \u1ee9ng vi\u00ean ph\u00f9 h\u1ee3p.",
  candidate: "\u1ee8ng vi\u00ean",
  unknownCandidate: "\u1ee8ng vi\u00ean",
  noEmail: "Ch\u01b0a c\u00f3 email",
  exp: "Kinh nghi\u1ec7m",
  years: "n\u0103m",
  latestJob: "Job g\u1ea7n nh\u1ea5t",
  noJob: "Ch\u01b0a c\u00f3 job",
  applications: "H\u1ed3 s\u01a1",
  status: "Tr\u1ea1ng th\u00e1i",
  viewProfile: "Xem h\u1ed3 s\u01a1",
  error: "Kh\u00f4ng th\u1ec3 t\u00ecm \u1ee9ng vi\u00ean"
};

const RecruiterCandidateSearch = () => {
  const [filters, setFilters] = useState({ keyword: "", minExperience: "", status: "" });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.keyword) query.set("keyword", filters.keyword);
      if (filters.minExperience) query.set("minExperience", filters.minExperience);
      if (filters.status) query.set("status", filters.status);
      const data = await apiRequest(`/api/recruiter/candidates/search?${query.toString()}`);
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || text.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [filters.keyword, filters.minExperience, filters.status]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getCandidateDisplayName = (candidate) => {
    return candidate?.candidateName || candidate?.candidateEmail || text.unknownCandidate;
  };

  return (
    <RecruiterLayout title={text.title} description={text.description}>
      {error ? <p className="recruiter-state error">{error}</p> : null}

      <section className="recruiter-filters">
        <input name="keyword" value={filters.keyword} onChange={handleChange} placeholder={text.keyword} />
        <input name="minExperience" type="number" min="0" value={filters.minExperience} onChange={handleChange} placeholder={text.minExp} />
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">{text.allStatuses}</option>
          <option value="submitted">{applicationStatusLabels.submitted}</option>
          <option value="reviewing">{applicationStatusLabels.reviewing}</option>
          <option value="shortlisted">{applicationStatusLabels.shortlisted}</option>
          <option value="interviewed">{applicationStatusLabels.interviewed}</option>
          <option value="hired">{applicationStatusLabels.hired}</option>
          <option value="rejected">{applicationStatusLabels.rejected}</option>
        </select>
      </section>

      <section className="recruiter-panel">
        <header className="recruiter-panel-header">
          <h2>{text.result}</h2>
        </header>
        <div className="recruiter-table">
          {loading ? <p className="recruiter-empty">{text.loading}</p> : null}
          {!loading && candidates.length === 0 ? <p className="recruiter-empty">{text.empty}</p> : null}
          {!loading && candidates.map((candidate) => {
            const displayName = getCandidateDisplayName(candidate);
            const shouldShowEmail = candidate.candidateEmail && candidate.candidateEmail !== displayName;

            return (
              <div key={candidate.candidateId} className="recruiter-table-row recruiter-table-row-4">
                <div>
                  <strong>{text.candidate}: {displayName}</strong>
                  {shouldShowEmail ? <span>{candidate.candidateEmail}</span> : null}
                </div>
                <div>
                  <strong>{text.exp}: {candidate.experienceYears ?? 0} {text.years}</strong>
                  <span>{text.latestJob}: {candidate.latestJobTitle || text.noJob}</span>
                </div>
                <div>
                  <strong>{text.applications}: {candidate.applicationCount || 0}</strong>
                  <span>{text.status}: {applicationStatusLabels[candidate.latestStatus] || candidate.latestStatus || applicationStatusLabels.submitted}</span>
                </div>
                <Link className="recruiter-secondary-action" to={`/recruiter/applications?keyword=${encodeURIComponent(candidate.candidateEmail || candidate.candidateName || "")}`}>
                  {text.viewProfile}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </RecruiterLayout>
  );
};

export default RecruiterCandidateSearch;
