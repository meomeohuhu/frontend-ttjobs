import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./styles.css";
import RoleGate from "./components/RoleGate.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const JobDetail = lazy(() => import("./pages/JobDetail.jsx"));
const JobsList = lazy(() => import("./pages/JobsList.jsx"));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail.jsx"));
const CareerGuide = lazy(() => import("./pages/CareerGuide.jsx"));
const CareerRoadmap = lazy(() => import("./pages/CareerRoadmap.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const Tools = lazy(() => import("./pages/Tools.jsx"));
const GrossNet = lazy(() => import("./pages/tools/GrossNet.jsx"));
const PersonalIncomeTax = lazy(() => import("./pages/tools/PersonalIncomeTax.jsx"));
const UnemploymentInsurance = lazy(() => import("./pages/tools/UnemploymentInsurance.jsx"));
const SocialInsuranceOnce = lazy(() => import("./pages/tools/SocialInsuranceOnce.jsx"));
const CompoundInterest = lazy(() => import("./pages/tools/CompoundInterest.jsx"));
const SavingPlan = lazy(() => import("./pages/tools/SavingPlan.jsx"));
const MBTI = lazy(() => import("./pages/tools/MBTI.jsx"));
const MultipleIntelligence = lazy(() => import("./pages/tools/MultipleIntelligence.jsx"));
const InterviewQuestions = lazy(() => import("./pages/tools/InterviewQuestions.jsx"));
const SalaryLookup = lazy(() => import("./pages/tools/SalaryLookup.jsx"));
const RecruiterDashboard = lazy(() => import("./pages/recruiter/RecruiterDashboard.jsx"));
const RecruiterHistory = lazy(() => import("./pages/recruiter/RecruiterHistory.jsx"));
const RecruiterChat = lazy(() => import("./pages/recruiter/RecruiterChat.jsx"));
const RecruiterNotifications = lazy(() => import("./pages/recruiter/RecruiterNotifications.jsx"));
const RecruiterCompanies = lazy(() => import("./pages/recruiter/RecruiterCompanies.jsx"));
const RecruiterJobs = lazy(() => import("./pages/recruiter/RecruiterJobs.jsx"));
const RecruiterApplications = lazy(() => import("./pages/recruiter/RecruiterApplications.jsx"));
const RecruiterCandidateSearch = lazy(() => import("./pages/recruiter/RecruiterCandidateSearch.jsx"));
const RecruiterInterviews = lazy(() => import("./pages/recruiter/RecruiterInterviews.jsx"));
const RecruiterCampaigns = lazy(() => import("./pages/recruiter/RecruiterCampaigns.jsx"));
const RecruiterReports = lazy(() => import("./pages/recruiter/RecruiterReports.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminModulePage = lazy(() => import("./pages/admin/AdminModulePage.jsx"));
const MessagesPage = lazy(() => import("./pages/user/Messages.jsx"));
const CandidateDashboard = lazy(() => import("./pages/user/CandidateDashboard.jsx"));
const ProfileSettings = lazy(() => import("./pages/user/ProfileSettings.jsx"));
const PasswordSettings = lazy(() => import("./pages/user/PasswordSettings.jsx"));
const NotificationSettings = lazy(() => import("./pages/user/NotificationSettings.jsx"));
const JobNeedsSettings = lazy(() => import("./pages/user/JobNeedsSettings.jsx"));
const SavedJobs = lazy(() => import("./pages/user/SavedJobs.jsx"));
const AppliedJobs = lazy(() => import("./pages/user/AppliedJobs.jsx"));
const MatchingJobs = lazy(() => import("./pages/user/MatchingJobs.jsx"));
const MyInterviews = lazy(() => import("./pages/user/MyInterviews.jsx"));
const MyCv = lazy(() => import("./pages/user/MyCv.jsx"));
const CoverLetters = lazy(() => import("./pages/user/CoverLetters.jsx"));
const RecruiterConnections = lazy(() => import("./pages/user/RecruiterConnections.jsx"));
const ProfileViews = lazy(() => import("./pages/user/ProfileViews.jsx"));
const SavedSearches = lazy(() => import("./pages/user/SavedSearches.jsx"));
const InterviewRoom = lazy(() => import("./pages/InterviewRoom.jsx"));
const CreateCV = lazy(() => import("./pages/CreateCV.jsx"));

const root = createRoot(document.getElementById("root"));
const recruiterRoles = ["RECRUITER"];
const adminRoles = ["ADMIN"];
root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="route-loading">Đang tải giao diện...</div>}>
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
        <Route path="/career-roadmap" element={<CareerRoadmap />} />
        <Route path="/api/ai/career-roadmap" element={<Navigate to="/career-roadmap" replace />} />
        <Route path="/community" element={<Community />} />
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
        <Route
          path="/user/saved-searches"
          element={
            <RoleGate allowedRoles={["CANDIDATE"]}>
              <SavedSearches />
            </RoleGate>
          }
        />
        <Route
          path="/user/interviews"
          element={
            <RoleGate allowedRoles={["CANDIDATE"]}>
              <MyInterviews />
            </RoleGate>
          }
        />
        <Route
          path="/interviews/:interviewId/room"
          element={
            <RoleGate allowedRoles={["CANDIDATE", "RECRUITER"]}>
              <InterviewRoom />
            </RoleGate>
          }
        />
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
        <Route
          path="/admin/dashboard"
          element={
            // Frontend gate chan user khong phai ADMIN truoc khi render admin console.
            // Backend van la lop bao ve chinh cho /api/admin/**.
            <RoleGate allowedRoles={adminRoles}>
              <AdminDashboard />
            </RoleGate>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminUsers />
            </RoleGate>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="companies" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/company-approvals"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="companyApprovals" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="jobs" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/forum"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="forum" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/email-campaigns"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="emailCampaigns" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/ai-monitoring"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="aiMonitoring" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="analytics" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="reports" />
            </RoleGate>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleGate allowedRoles={adminRoles}>
              <AdminModulePage module="auditLogs" />
            </RoleGate>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
