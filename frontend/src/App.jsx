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
import RequestVerificationPage from "./pages/RequestVerificationPage";
import SubscriptionPage from "./pages/SubscriptionPage";

// Dashboard pages
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ChurchAdminDashboard from "./pages/ChurchAdminDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
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

  // Redirect to appropriate dashboard based on role
  switch (user.role) {
    case "SuperAdmin":
      return <Navigate to="/dashboard/admin" replace />;
    case "ChurchAdmin":
      return <Navigate to="/dashboard/church-admin" replace />;
    case "Counselor":
      return <Navigate to="/dashboard/counselor" replace />;
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
            <Route
              path="/request-verification"
              element={<RequestVerificationPage />}
            />
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/church-admin"
              element={
                <ProtectedRoute allowedRoles={["ChurchAdmin"]}>
                  <ChurchAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/counselor"
              element={
                <ProtectedRoute allowedRoles={["Counselor"]}>
                  <CounselorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute allowedRoles={["User"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

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
