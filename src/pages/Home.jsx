import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import HeroSearch from "../sections/HeroSearch.jsx";
import BestJobsSection from "../sections/BestJobsSection.jsx";
import HighlightJobsSection from "../sections/HighlightJobsSection.jsx";
import BrandsSection from "../sections/BrandsSection.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";

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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="topcv-shell">
      <HomeHeader />
      <AnnouncementBar />
      <HeroSearch />
      <BestJobsSection jobs={bestJobs} loading={loading} error={error} />
      <HighlightJobsSection
        jobs={highSalaryJobs}
        loading={loading}
        error={error}
      />
      <BrandsSection />
      <FloatingActions />
    </div>
  );
};

export default Home;
