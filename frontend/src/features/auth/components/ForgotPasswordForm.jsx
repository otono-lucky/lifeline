import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/Input';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Password recovery requested for:', email);
        // Simulate API call
        alert('Recovery link sent! (Mock behavior)');
        navigate('/reset-password'); // For demo purposes, we move to the next step
    };

    return (
        <div className="w-full max-w-lg">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">Key Search</h2>
                <p className="text-slate-500 italic">Lost your key to the kingdom? No worries, we'll help you back in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                />

                <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                    Send Recovery Link
                </button>
            </form>

            <p className="mt-12 text-center text-sm text-slate-400">
                Wait, I remember it!{' '}
                <Link to="/" className="text-blue-600 font-bold hover:underline">
                    Take me back
                </Link>
            </p>
        </div>
    );
};

export default ForgotPasswordForm;
