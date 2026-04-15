import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import HeroSearch from "../sections/HeroSearch.jsx";
import BestJobsSection from "../sections/BestJobsSection.jsx";
import HighlightJobsSection from "../sections/HighlightJobsSection.jsx";
import BrandsSection from "../sections/BrandsSection.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";
import { useSavedJobs } from "../hooks/useSavedJobs.js";

const getSalaryValue = (job) => {
  const candidates = [job.salaryMax, job.salaryMin, job.salary];
  for (const value of candidates) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue) && numberValue > 0) {
      return numberValue;
    }
  }
  return 0;
};

const Home = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { savedIdSet, savingIds, toggleSavedJob } = useSavedJobs();

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/jobs");
        if (active) {
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải dữ liệu công việc");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobs();
    return () => {
      active = false;
    };
  }, []);

  const bestJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => (b.savedCount || 0) - (a.savedCount || 0))
      .slice(0, 6);
  }, [jobs]);

  const highSalaryJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => getSalaryValue(b) - getSalaryValue(a))
      .slice(0, 4);
  }, [jobs]);

  const handleToggleSave = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
    } catch (err) {
      if ((err.message || "").toLowerCase().includes("đăng nhập")) {
        navigate("/login");
        return;
      }
      setError(err.message || "Không thể lưu công việc");
    }
  };

  return (
    <div className="topcv-shell">
      <HomeHeader />
      <AnnouncementBar />
      <HeroSearch />
      <BestJobsSection
        jobs={bestJobs}
        loading={loading}
        error={error}
        savedIdSet={savedIdSet}
        savingIds={savingIds}
        onToggleSave={handleToggleSave}
      />
      <HighlightJobsSection
        jobs={highSalaryJobs}
        loading={loading}
        error={error}
        savedIdSet={savedIdSet}
        savingIds={savingIds}
        onToggleSave={handleToggleSave}
      />
      <BrandsSection />
      <FloatingActions />
    </div>
  );
};

export default Home;
