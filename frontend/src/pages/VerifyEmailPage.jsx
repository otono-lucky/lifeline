import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../features/auth/components/AuthLayout";
import ResendVerificationForm from "../features/auth/components/ResendVerificationForm";
import { authService } from "../api/services";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "pending"); // pending | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const result = await authService.verifyEmail(token);

        if (result.success) {
          setStatus("success");
          setVerifiedEmail(result.data?.account?.email || "");
          // Clear stored email after verification
          sessionStorage.removeItem("signupEmail");
        } else {
          setStatus("error");
          setErrorMessage(result.message || "Email verification failed");
        }
      } catch (error) {
        setStatus("error");
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Email verification failed";
        setErrorMessage(message);
        console.error("Email verification error:", error);
      }
    };

    verifyEmail();
  }, [token]);

  // Pending state: No token provided, show "check inbox" with resend form
  if (status === "pending") {
    return (
      <AuthLayout
        heroBadge="Holy Mail!"
        heroTitle={["We sent a", "Digital Dove"]}
        heroSubtitle="Check your inbox. We've sent a verification link to confirm you're real."
      >
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">
              Check Your Inbox
            </h2>
            <p className="text-slate-500 italic">
              We just dropped a verification link at your email. Click it to
              verify your account.
            </p>
          </div>

          <div className="mb-8">
            <ResendVerificationForm />
          </div>

          <Link
            to="/"
            className="block w-full text-center py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-all underline"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === "loading") {
    return (
      <AuthLayout
        heroBadge="Verifying..."
        heroTitle={["Hold", "Tight"]}
        heroSubtitle="We're verifying your email address"
      >
        <div className="w-full max-w-lg text-center md:text-left">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">
              Processing
            </h2>
            <p className="text-slate-500 italic">
              Please wait while we verify your email...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (status === "error") {
    return (
      <AuthLayout
        heroBadge="Oops!"
        heroTitle={["Verification", "Failed"]}
        heroSubtitle="Something went wrong with your email verification"
      >
        <div className="w-full max-w-lg text-center md:text-left">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-red-600 mb-2 italic">
              Verification Issue
            </h2>
            <p className="text-red-500 italic mb-4">{errorMessage}</p>
            <p className="text-slate-500">
              If the link is expired or invalid, you can request a new
              verification email below.
            </p>
          </div>

          <div className="mb-8">
            <ResendVerificationForm />
          </div>

          <Link
            to="/"
            className="block w-full text-center py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  return (
    <AuthLayout
      heroBadge="Success!"
      heroTitle={["You're", "Official!"]}
      heroSubtitle="Digital Sanctification Complete. Your email is verified and you're ready to find your match."
    >
      <div className="w-full max-w-lg text-center md:text-left">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">
            Door's Open
          </h2>
          <p className="text-slate-500 italic mb-2">
            Verification successful! Your journey with Lifeline starts now. Go
            find your better half.
          </p>
          {verifiedEmail && (
            <p className="text-sm text-slate-400">
              Verified email:{" "}
              <span className="font-semibold">{verifiedEmail}</span>
            </p>
          )}
        </div>

        <Link
          to="/"
          className="inline-block w-full text-center py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98]"
        >
          Proceed to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
