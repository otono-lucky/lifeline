import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

// Auth pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PasswordConfirmedPage from "./pages/PasswordConfirmedPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailPreviewPage from "./pages/EmailPreviewPage";
import SubscriptionPage from "./pages/SubscriptionPage";

// Layouts & Dynamic Portals
import { AdminLayout, ChurchLayout } from "./layouts";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ChurchDetailPage from "./pages/ChurchDetailPage";
import AppealsQueuePage from "./pages/AppealsQueuePage";
import SubscriptionAnalyticsPage from "./pages/SubscriptionAnalyticsPage";
import ChurchPortalPage from "./pages/ChurchPortalPage";
import MemberDetailPage from "./pages/MemberDetailPage";
import VettingQueuePage from "./pages/VettingQueuePage";
import MonitoredChatsPage from "./pages/MonitoredChatsPage";
import ParishSettingsPage from "./pages/ParishSettingsPage";
import UserDashboard from "./pages/UserDashboard";

// Redirect component based on role
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role per §2 RBAC
  switch (user.role) {
    case "SuperAdmin":
      return <Navigate to="/admin" replace />;
    case "ChurchAdmin":
    case "Counselor":
      return <Navigate to="/church" replace />;
    case "User":
      return <Navigate to="/dashboard/user" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/password-confirmed"
              element={<PasswordConfirmedPage />}
            />
            <Route
              path="/email-confirmation"
              element={<EmailConfirmationPage />}
            />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/email-preview" element={<EmailPreviewPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* Canonical SuperAdmin Portal (/admin/*) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperAdminDashboard bare defaultTab="overview" />} />
              <Route path="churches" element={<SuperAdminDashboard bare defaultTab="churches" />} />
              <Route path="churches/:id" element={<ChurchDetailPage />} />
              <Route path="users" element={<SuperAdminDashboard bare defaultTab="users" />} />
              <Route path="church-admins" element={<SuperAdminDashboard bare defaultTab="admins" />} />
              <Route path="counselors" element={<SuperAdminDashboard bare defaultTab="counselors" />} />
              <Route path="matches" element={<SuperAdminDashboard bare defaultTab="matches" />} />
              <Route path="appeals" element={<AppealsQueuePage />} />
              <Route path="appeals/:id" element={<AppealsQueuePage />} />
              <Route path="subscriptions" element={<SubscriptionAnalyticsPage />} />
            </Route>

            {/* Canonical Unified Church Portal (/church/*) */}
            <Route
              path="/church"
              element={
                <ProtectedRoute allowedRoles={["ChurchAdmin", "Counselor", "SuperAdmin"]}>
                  <ChurchLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ChurchPortalPage section="overview" />} />
              <Route path="members" element={<ChurchPortalPage section="members" />} />
              <Route path="members/:id" element={<MemberDetailPage />} />
              <Route path="counselors" element={<ChurchPortalPage section="counselors" />} />
              <Route path="vetting" element={<VettingQueuePage />} />
              <Route path="vetting/:id" element={<VettingQueuePage />} />
              <Route path="matches" element={<ChurchPortalPage section="matches" />} />
              <Route path="chats" element={<MonitoredChatsPage />} />
              <Route path="chats/:conversationId" element={<MonitoredChatsPage />} />
              <Route path="debriefs" element={<VettingQueuePage />} />
              <Route path="settings" element={<ParishSettingsPage />} />
            </Route>

            {/* User Profile View (Web dater inspector / legacy) */}
            <Route
              path="/dashboard/user/:id?"
              element={
                <ProtectedRoute
                  allowedRoles={["User", "Counselor", "ChurchAdmin", "SuperAdmin"]}
                >
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Backward Compatibility Redirects */}
            <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />
            <Route path="/dashboard/church-admin/:id?" element={<Navigate to="/church" replace />} />
            <Route path="/dashboard/counselor/:id?" element={<Navigate to="/church" replace />} />

            {/* Home redirect */}
            <Route path="/" element={<DashboardRedirect />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
