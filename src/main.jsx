import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./styles.css";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import JobsList from "./pages/JobsList.jsx";
import CompanyDetail from "./pages/CompanyDetail.jsx";
import CareerGuide from "./pages/CareerGuide.jsx";
import Tools from "./pages/Tools.jsx";
import GrossNet from "./pages/tools/GrossNet.jsx";
import PersonalIncomeTax from "./pages/tools/PersonalIncomeTax.jsx";
import UnemploymentInsurance from "./pages/tools/UnemploymentInsurance.jsx";
import SocialInsuranceOnce from "./pages/tools/SocialInsuranceOnce.jsx";
import CompoundInterest from "./pages/tools/CompoundInterest.jsx";
import SavingPlan from "./pages/tools/SavingPlan.jsx";
import MBTI from "./pages/tools/MBTI.jsx";
import MultipleIntelligence from "./pages/tools/MultipleIntelligence.jsx";
import InterviewQuestions from "./pages/tools/InterviewQuestions.jsx";
import SalaryLookup from "./pages/tools/SalaryLookup.jsx";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard.jsx";
import RecruiterHistory from "./pages/recruiter/RecruiterHistory.jsx";
import RecruiterChat from "./pages/recruiter/RecruiterChat.jsx";
import RecruiterNotifications from "./pages/recruiter/RecruiterNotifications.jsx";
import RecruiterCompanies from "./pages/recruiter/RecruiterCompanies.jsx";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs.jsx";
import RecruiterApplications from "./pages/recruiter/RecruiterApplications.jsx";
import RecruiterCandidateSearch from "./pages/recruiter/RecruiterCandidateSearch.jsx";
import RecruiterInterviews from "./pages/recruiter/RecruiterInterviews.jsx";
import RecruiterCampaigns from "./pages/recruiter/RecruiterCampaigns.jsx";
import RecruiterReports from "./pages/recruiter/RecruiterReports.jsx";
import MessagesPage from "./pages/user/Messages.jsx";
import CandidateDashboard from "./pages/user/CandidateDashboard.jsx";
import RoleGate from "./components/RoleGate.jsx";

import ProfileSettings from "./pages/user/ProfileSettings.jsx";
import PasswordSettings from "./pages/user/PasswordSettings.jsx";
import NotificationSettings from "./pages/user/NotificationSettings.jsx";
import JobNeedsSettings from "./pages/user/JobNeedsSettings.jsx";
import SavedJobs from "./pages/user/SavedJobs.jsx";
import AppliedJobs from "./pages/user/AppliedJobs.jsx";
import MatchingJobs from "./pages/user/MatchingJobs.jsx";
import MyInterviews from "./pages/user/MyInterviews.jsx";
import MyCv from "./pages/user/MyCv.jsx";
import CoverLetters from "./pages/user/CoverLetters.jsx";
import RecruiterConnections from "./pages/user/RecruiterConnections.jsx";
import ProfileViews from "./pages/user/ProfileViews.jsx";
import CreateCV from "./pages/CreateCV.jsx";

const root = createRoot(document.getElementById("root"));
const recruiterRoles = ["RECRUITER", "ADMIN"];
root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/create-cv" element={<CreateCV />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/gross-net" element={<GrossNet />} />
        <Route path="/tools/personal-income-tax" element={<PersonalIncomeTax />} />
        <Route path="/tools/unemployment-insurance" element={<UnemploymentInsurance />} />
        <Route path="/tools/social-insurance-once" element={<SocialInsuranceOnce />} />
        <Route path="/tools/compound-interest" element={<CompoundInterest />} />
        <Route path="/tools/saving-plan" element={<SavingPlan />} />
        <Route path="/tools/mbti" element={<MBTI />} />
        <Route path="/tools/mi" element={<MultipleIntelligence />} />
        <Route path="/tools/interview-questions" element={<InterviewQuestions />} />
        <Route path="/tools/salary-lookup" element={<SalaryLookup />} />
        <Route path="/career-guide" element={<CareerGuide />} />
        <Route path="/career-guide/:slug" element={<CareerGuide />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route
          path="/user/dashboard"
          element={
            <RoleGate allowedRoles={["CANDIDATE"]}>
              <CandidateDashboard />
            </RoleGate>
          }
        />
        <Route path="/user/saved" element={<SavedJobs />} />
        <Route path="/user/applied" element={<AppliedJobs />} />
        <Route
          path="/user/matching"
          element={
            <RoleGate>
              <MatchingJobs />
            </RoleGate>
          }
        />
        <Route path="/user/profile" element={<ProfileSettings />} />
        <Route path="/user/cv" element={<MyCv />} />
        <Route path="/user/cover-letters" element={<CoverLetters />} />
        <Route path="/user/recruiter-connections" element={<RecruiterConnections />} />
        <Route path="/user/profile-views" element={<ProfileViews />} />
        <Route path="/user/password" element={<PasswordSettings />} />
        <Route path="/user/notifications" element={<NotificationSettings />} />
        <Route
          path="/user/job-needs"
          element={
            <RoleGate>
              <JobNeedsSettings />
            </RoleGate>
          }
        />
        <Route
          path="/job-needs"
          element={
            <RoleGate>
              <JobNeedsSettings />
            </RoleGate>
          }
        />
        <Route path="/user/interviews" element={<MyInterviews />} />
        <Route
          path="/messages"
          element={
            <RoleGate allowedRoles={["CANDIDATE"]}>
              <MessagesPage />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/dashboard"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterDashboard />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/history"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterHistory />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/chat"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterChat />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/notifications"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterNotifications />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/companies"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterCompanies />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/jobs"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterJobs />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/applications"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterApplications />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/applications/:id"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterApplications />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/candidates"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterCandidateSearch />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/interviews"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterInterviews />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/campaigns"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterCampaigns />
            </RoleGate>
          }
        />
        <Route
          path="/recruiter/reports"
          element={
            <RoleGate allowedRoles={recruiterRoles}>
              <RecruiterReports />
            </RoleGate>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
