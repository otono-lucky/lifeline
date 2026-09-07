import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../../api/services";
import { Toast } from "../../../components/Toast";

const ResendVerificationForm = ({ initialEmail = "", onPreviewReady }) => {
  const navigate = useNavigate();
  // Read email ONLY from session storage or props — never allow manual user input to avoid manipulation
  const [email] = useState(() => {
    const stored = sessionStorage.getItem("signupEmail");
    return stored || initialEmail || "";
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isCoolingDown = cooldownSeconds > 0;

  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      setToast({
        type: "error",
        message: "No registered email found in session. Please sign in first.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.requestVerification(email);

      if (result.success) {
        const preview = result?.data?.emailPreview;
        if (preview?.html) {
          sessionStorage.setItem("emailPreviewHtml", preview.html);
          sessionStorage.setItem("emailPreviewType", "verify");
          if (typeof onPreviewReady === "function") {
            onPreviewReady();
          }
        }
        if (preview?.verificationUrl) {
          sessionStorage.setItem(
            "emailPreviewActionUrl",
            preview.verificationUrl,
          );
          sessionStorage.setItem(
            "emailPreviewActionLabel",
            "Open Verification Link",
          );
        }
        setCooldownSeconds(60);
        setToast({
          type: "success",
          message: "Verification email sent successfully. Please check your inbox.",
        });
      } else {
        setToast({
          type: "error",
          message: result.message || "Failed to send verification email",
        });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send verification email";
      const retryAfterSeconds =
        error?.response?.data?.errors?.retryAfterSeconds;
      if (retryAfterSeconds) {
        setCooldownSeconds(retryAfterSeconds);
      }
      setToast({ type: "error", message });
      console.error("Request verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 text-slate-600 mb-4 text-sm font-medium">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            @
          </div>
          Didn't receive the email?
        </div>

        {isEmailValid ? (
          <>
            <p className="text-slate-500 text-sm mb-4">
              We'll resend the verification link to{" "}
              <span className="font-semibold text-slate-800">{email}</span>.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <button
                type="submit"
                disabled={loading || isCoolingDown}
                className={`w-full py-2.5 px-3 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors ${
                  loading || isCoolingDown ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading
                  ? "Sending..."
                  : isCoolingDown
                    ? `Resend available in ${cooldownSeconds}s`
                    : "Resend Verification Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm">
              No registered email found in your current session. Please sign in to verify your email.
            </p>
            <Link
              to="/login"
              className="block w-full text-center py-2 px-3 text-sm rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

export default ResendVerificationForm;
