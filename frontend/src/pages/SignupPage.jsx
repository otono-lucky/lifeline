import React from "react";
import AuthLayout from "../features/auth/components/AuthLayout";
import SignupForm from "../features/auth/components/SignupForm";

const SignupPage = () => {
  return (
    <AuthLayout
      heroBadge="Verified Connections"
      heroTitle={["Find your", "Godly Match"]}
      heroSubtitle="A safe, authentic community where faith meets purpose. Experience human-mediated verification for a dating environment you can trust."
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;
