import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";

const TOKEN_KEY = "ttjobs_token";

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState([]);
  const [error, setError] = useState("");

  const savedIdSet = useMemo(() => new Set(savedJobs.map((item) => item.jobId)), [savedJobs]);

  const loadSavedJobs = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setSavedJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/saved-jobs");
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải việc đã lưu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const toggleSavedJob = async (jobId) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error("Bạn cần đăng nhập để lưu công việc");
    }

    const isSaved = savedIdSet.has(jobId);
    setSavingIds((prev) => [...new Set([...prev, jobId])]);

    try {
      if (isSaved) {
        await apiRequest(`/api/saved-jobs/${jobId}`, { method: "DELETE" });
        setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
        return { saved: false };
      }

      const data = await apiRequest(`/api/saved-jobs/${jobId}`, { method: "POST" });
      setSavedJobs((prev) => [data, ...prev.filter((item) => item.jobId !== jobId)]);
      return { saved: true, data };
    } finally {
      setSavingIds((prev) => prev.filter((item) => item !== jobId));
    }
  };

  return {
    loading,
    error,
    savedJobs,
    savedIdSet,
    savingIds,
    reloadSavedJobs: loadSavedJobs,
    toggleSavedJob
  };
}
