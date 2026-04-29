import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import HeroSearch from "../sections/HeroSearch.jsx";
import BestJobsSection from "../sections/BestJobsSection.jsx";
import HighlightJobsSection from "../sections/HighlightJobsSection.jsx";
import BrandsSection from "../sections/BrandsSection.jsx";
import TopCategoriesSection from "../sections/TopCategoriesSection.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";
import Footer from "../sections/Footer.jsx";
import { useSavedJobs } from "../hooks/useSavedJobs.js";

const Home = () => {
  const navigate = useNavigate();
  const [bestJobs, setBestJobs] = useState([]);
  const [highlightJobs, setHighlightJobs] = useState([]);
  const [bestLoading, setBestLoading] = useState(true);
  const [highlightLoading, setHighlightLoading] = useState(true);
  const [bestError, setBestError] = useState("");
  const [highlightError, setHighlightError] = useState("");
  const { savedIdSet, savingIds, toggleSavedJob } = useSavedJobs();

  useEffect(() => {
    let active = true;

    const loadHomeJobs = async () => {
      setBestLoading(true);
      setHighlightLoading(true);
      setBestError("");
      setHighlightError("");

      try {
        const [bestResult, highlightsResult] = await Promise.allSettled([
          apiRequest("/api/jobs/best?type=most_saved&size=12", { skipAuth: true }),
          apiRequest("/api/jobs/highlights?type=high_salary&size=12", { skipAuth: true })
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
      } catch (err) {
        if (active) {
          setBestError(err.message || "Không thể tải danh sách việc làm được lưu nhiều.");
          setHighlightError(err.message || "Không thể tải danh sách việc làm nổi bật.");
        }
      } finally {
        if (active) {
          setBestLoading(false);
          setHighlightLoading(false);
        }
      }
    };

    loadHomeJobs();
    return () => {
      active = false;
    };
  }, []);

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
      <TopCategoriesSection />
      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Home;
