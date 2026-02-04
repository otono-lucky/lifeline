import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../features/auth/components/AuthLayout';

const PasswordConfirmedPage = () => {
    return (
        <AuthLayout
            heroBadge="Victory!"
            heroTitle={["Mission", "Accomplished"]}
            heroSubtitle="Your account is secure and ready for action. Let's get you back into the community."
        >
            <div className="w-full max-w-lg text-center md:text-left">
                <div className="mb-10">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">All Systems Go</h2>
                    <p className="text-slate-500 italic">Your password has been successfully reset. Now go find that "Better Half" we talked about.</p>
                </div>

                <Link
                    to="/"
                    className="inline-block w-full py-4 text-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                    Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
};

export default PasswordConfirmedPage;
