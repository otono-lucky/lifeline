import React from 'react';
import AuthLayout from '../features/auth/components/AuthLayout';
import LoginForm from '../features/auth/components/LoginForm';

const LoginPage = () => {
    return (
        <AuthLayout
            heroBadge="Welcome Back"
            heroTitle={["Ready for", "Soul Searching?"]}
            heroSubtitle="Rejoin the community where faith meets purpose. Your match might have prayed for you today."
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginPage;
