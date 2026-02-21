import React, { useState, useEffect } from "react";
import { authService } from "../../../api/services";
import {Toast} from "../../../components/Toast";

const ResendVerificationForm = ({ initialEmail = "" }) => {
  const [email, setEmail] = useState(() => {
    // Try to get email from sessionStorage first, then use initialEmail prop
    const stored = sessionStorage.getItem("signupEmail");
    return stored || initialEmail || "";
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setToast({
          type: "error",
          message: "Please enter a valid email address",
        });
        setLoading(false);
        return;
      }

      const result = await authService.requestVerification(email);

      if (result.success) {
        setSent(true);
        setToast({
          type: "success",
          message: "Verification link sent! Check your inbox.",
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
      setToast({ type: "error", message });
      console.error("Request verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
        <div className="flex items-center gap-4 text-green-700 mb-3">
          <div className="text-2xl">✓</div>
          <div>
            <h3 className="font-semibold">Email Sent Successfully!</h3>
            <p className="text-sm text-green-600">Check your inbox for the verification link</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
        >
          Send to another email
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 text-slate-600 mb-4 text-sm font-medium">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            📧
          </div>
          Didn't receive the email?
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Enter your email and we'll resend the verification link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            disabled={loading}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-3 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Resend Verification Link"}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

export default ResendVerificationForm;
