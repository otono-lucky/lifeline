import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../features/auth/components/AuthLayout";

const VerifyEmailPage = () => {
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
          <p className="text-slate-500 italic">
            Verification successful! Your journey with Lifeline starts now. Go
            find your better half.
          </p>
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
