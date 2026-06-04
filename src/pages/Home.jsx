import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, hasAuthToken } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import HeroSearch from "../sections/HeroSearch.jsx";
import BestJobsSection from "../sections/BestJobsSection.jsx";
import HighlightJobsSection from "../sections/HighlightJobsSection.jsx";
import { LatestJobsSection, PersonalizedJobsSection } from "../sections/HomeJobSections.jsx";
import BrandsSection from "../sections/BrandsSection.jsx";
import TopCategoriesSection from "../sections/TopCategoriesSection.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";
import Footer from "../sections/Footer.jsx";
import { useSavedJobs } from "../hooks/useSavedJobs.js";

const Home = () => {
  const navigate = useNavigate();
  const [bestJobs, setBestJobs] = useState([]);
  const [highlightJobs, setHighlightJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [personalizedJobs, setPersonalizedJobs] = useState([]);
  const [personalizedConfigured, setPersonalizedConfigured] = useState(false);
  const [bestLoading, setBestLoading] = useState(true);
  const [highlightLoading, setHighlightLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(true);
  const [personalizedLoading, setPersonalizedLoading] = useState(true);
  const [bestError, setBestError] = useState("");
  const [highlightError, setHighlightError] = useState("");
  const [latestError, setLatestError] = useState("");
  const [personalizedError, setPersonalizedError] = useState("");
  const { savedIdSet, savingIds, toggleSavedJob } = useSavedJobs();
  const [authVersion, setAuthVersion] = useState(0);
  const isLoggedIn = hasAuthToken();

  useEffect(() => {
    const handleAuthChanged = () => setAuthVersion((value) => value + 1);
    window.addEventListener("ttjobs:auth-changed", handleAuthChanged);
    return () => window.removeEventListener("ttjobs:auth-changed", handleAuthChanged);
  }, []);

  useEffect(() => {
    let active = true;

    const loadHomeJobs = async () => {
      setBestLoading(true);
      setHighlightLoading(true);
      setLatestLoading(true);
      setBestError("");
      setHighlightError("");
      setLatestError("");

      try {
        const [bestResult, highlightsResult, latestResult] = await Promise.allSettled([
          apiRequest("/api/jobs/best?type=most_saved&size=12", { skipAuth: true }),
          apiRequest("/api/jobs/highlights?type=high_salary&size=12", { skipAuth: true }),
          apiRequest("/api/jobs?sort=latest&size=6", { skipAuth: true })
        ]);

        if (!active) return;

        if (bestResult.status === "fulfilled") {
          setBestJobs(Array.isArray(bestResult.value) ? bestResult.value : []);
        } else {
          setBestError(bestResult.reason?.message || "Không thể tải danh sách việc làm được lưu nhiều.");
        }

        if (highlightsResult.status === "fulfilled") {
          setHighlightJobs(Array.isArray(highlightsResult.value) ? highlightsResult.value : []);
        } else {
          setHighlightError(highlightsResult.reason?.message || "Không thể tải danh sách việc làm nổi bật.");
        }

        if (latestResult.status === "fulfilled") {
          setLatestJobs(Array.isArray(latestResult.value) ? latestResult.value : []);
        } else {
          setLatestError(latestResult.reason?.message || "Không thể tải việc làm mới.");
        }
      } catch (err) {
        if (active) {
          setBestError(err.message || "Không thể tải danh sách việc làm được lưu nhiều.");
          setHighlightError(err.message || "Không thể tải danh sách việc làm nổi bật.");
          setLatestError(err.message || "Không thể tải việc làm mới.");
        }
      } finally {
        if (active) {
          setBestLoading(false);
          setHighlightLoading(false);
          setLatestLoading(false);
        }
      }
    };

    loadHomeJobs();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadPersonalizedJobs = async () => {
      if (!isLoggedIn) {
        setPersonalizedJobs([]);
        setPersonalizedConfigured(false);
        setPersonalizedError("");
        setPersonalizedLoading(false);
        return;
      }

      setPersonalizedLoading(true);
      setPersonalizedError("");
      try {
        await apiRequest("/api/users/me");
        const [preferenceData, jobsData] = await Promise.all([
          apiRequest("/api/job-needs/preferences"),
          apiRequest("/api/recommendations/job-needs")
        ]);
        if (active) {
          setPersonalizedConfigured(Boolean(preferenceData?.configured));
          setPersonalizedJobs(Array.isArray(jobsData) ? jobsData : []);
        }
      } catch (err) {
        if (active) {
          setPersonalizedError(err.message || "Không thể tải gợi ý phù hợp.");
          setPersonalizedJobs([]);
          setPersonalizedConfigured(false);
        }
      } finally {
        if (active) {
          setPersonalizedLoading(false);
        }
      }
    };

    loadPersonalizedJobs();
    return () => {
      active = false;
    };
  }, [isLoggedIn, authVersion]);

  const handleToggleSave = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
    } catch (err) {
      if ((err.message || "").toLowerCase().includes("đăng nhập")) {
        navigate("/login");
        return;
      }
      setBestError(err.message || "Không thể lưu công việc lúc này.");
    }
  };

  return (
    <div className="topcv-shell">
      <HomeHeader />
      <AnnouncementBar />
      <HeroSearch />
      <BrandsSection />
      <HighlightJobsSection
        jobs={highlightJobs}
        loading={highlightLoading}
        error={highlightError}
        savedIdSet={savedIdSet}
        savingIds={savingIds}
        onToggleSave={handleToggleSave}
      />
      <BestJobsSection
        jobs={bestJobs}
        loading={bestLoading}
        error={bestError}
        savedIdSet={savedIdSet}
        savingIds={savingIds}
        onToggleSave={handleToggleSave}
      />
      <LatestJobsSection
        jobs={latestJobs}
        loading={latestLoading}
        error={latestError}
        savedIdSet={savedIdSet}
        savingIds={savingIds}
        onToggleSave={handleToggleSave}
      />
      <PersonalizedJobsSection
        jobs={personalizedJobs}
        loading={personalizedLoading}
        error={personalizedError}
        isLoggedIn={isLoggedIn}
        hasConfiguredNeeds={personalizedConfigured}
        savedIdSet={savedIdSet}
        savingIds={savingIds}
        onToggleSave={handleToggleSave}
      />
      <TopCategoriesSection />
      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Home;
