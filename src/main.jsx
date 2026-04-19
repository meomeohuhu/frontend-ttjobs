import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./styles.css";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import CompanyDetail from "./pages/CompanyDetail.jsx";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard.jsx";
import RoleGate from "./components/RoleGate.jsx";
import SavedJobs from "./pages/user/SavedJobs.jsx";
import AppliedJobs from "./pages/user/AppliedJobs.jsx";
import MatchingJobs from "./pages/user/MatchingJobs.jsx";
import ProfileSettings from "./pages/user/ProfileSettings.jsx";
import PasswordSettings from "./pages/user/PasswordSettings.jsx";
import NotificationSettings from "./pages/user/NotificationSettings.jsx";

const root = createRoot(document.getElementById("root"));
const recruiterRoles = ["RECRUITER", "ADMIN"];
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/user/saved" element={<SavedJobs />} />
        <Route path="/user/applied" element={<AppliedJobs />} />
        <Route path="/user/matching" element={<MatchingJobs />} />
        <Route path="/user/profile" element={<ProfileSettings />} />
        <Route path="/user/password" element={<PasswordSettings />} />
        <Route path="/user/notifications" element={<NotificationSettings />} />
        <Route
          path="/recruiter/dashboard"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterDashboard />
            </RoleGate>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
