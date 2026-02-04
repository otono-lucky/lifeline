import React from 'react';
import AuthLayout from '../features/auth/components/AuthLayout';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm';

const ResetPasswordPage = () => {
    return (
        <AuthLayout
            heroBadge="Secure Reset"
            heroTitle={["A Stronger", "Anchor"]}
            heroSubtitle="Update your password to keep your profile secure and your matches protected."
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
};

export default ResetPasswordPage;
