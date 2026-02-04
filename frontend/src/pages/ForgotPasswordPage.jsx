import React from 'react';
import AuthLayout from '../features/auth/components/AuthLayout';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';

const ForgotPasswordPage = () => {
    return (
        <AuthLayout
            heroBadge="Security First"
            heroTitle={["Locked", "Out?"]}
            heroSubtitle="Don't lose heart. We'll help you reconnect with your faith community in no time."
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
