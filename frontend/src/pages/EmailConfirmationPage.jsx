import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../features/auth/components/AuthLayout';

const EmailConfirmationPage = () => {
    return (
        <AuthLayout
            heroBadge="Holy Mail!"
            heroTitle={["We sent a", "Digital Dove"]}
            heroSubtitle="Check your inbox. We've sent a verification link to ensure you're a real human (and not a very clever bot)."
        >
            <div className="w-full max-w-lg text-center md:text-left">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">Check Your Inbox</h2>
                    <p className="text-slate-500 italic">We just dropped a verification link at your email. Go ahead and click it—it's like a digital handshake.</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                    <div className="flex items-center gap-4 text-slate-600 mb-4 text-sm font-medium">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            📧
                        </div>
                        Didn't get the email?
                    </div>
                    <button className="text-blue-600 font-bold hover:underline text-sm transition-all">
                        Resend Verification Link
                    </button>
                </div>

                <Link
                    to="/"
                    className="inline-block w-full text-center py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-all underline"
                >
                    Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
};

export default EmailConfirmationPage;
