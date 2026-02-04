import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PasswordConfirmedPage from './pages/PasswordConfirmedPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SubscriptionPage from './pages/SubscriptionPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/password-confirmed" element={<PasswordConfirmedPage />} />
          <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
