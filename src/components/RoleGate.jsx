import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const normalizeRoles = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

const RoleGate = ({ allowedRoles, children }) => {
  const hasToken = Boolean(localStorage.getItem("ttjobs_token"));
  const [status, setStatus] = useState({
    loading: true,
    allowed: false
  });

  const roles = useMemo(
    () => normalizeRoles(allowedRoles).map((role) => String(role).toUpperCase()),
    [allowedRoles]
  );

  useEffect(() => {
    let active = true;

    const validateRole = async () => {
      if (!hasToken) {
        if (active) {
          setStatus({ loading: false, allowed: false });
        }
        return;
      }

      try {
        const profile = await apiRequest("/api/users/me");
        const role = String(profile?.role || "").toUpperCase();
        const isAllowed = roles.length === 0 || roles.includes(role);
        if (active) {
          setStatus({ loading: false, allowed: isAllowed });
        }
      } catch (error) {
        if ((error?.message || "").toLowerCase().includes("unauthorized")) {
          localStorage.removeItem("ttjobs_token");
        }
        if (active) {
          setStatus({ loading: false, allowed: false });
        }
      }
    };

    validateRole();

    return () => {
      active = false;
    };
  }, [roles, hasToken]);

  if (status.loading) {
    return <div className="role-gate-state">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (!status.allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGate;
