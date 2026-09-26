import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const SubscriptionPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSelectPlan = async () => {
        setLoading(true);
        try {
            const response = await apiClient.put('/subscriptions/tier', { tier: 'PREMIUM' });
            if (response.data?.success) {
                alert('Success! You have selected the Kingdom Premium plan.');
                navigate('/');
            } else {
                alert(response.data?.message || 'Subscriptions are managed through the Lifeline mobile app.');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Subscriptions and matchmaking upgrades are processed securely in the Lifeline mobile app.');
        } finally {
            setLoading(false);
        }
    };

    const premiumPlan = {
        name: 'Kingdom Premium',
        price: '10,000',
        subtitle: 'Per Year',
        description: 'Unlock the full potential of your search for a godly connection with our exclusive premium features.',
        features: [
            'Unlimited Match Suggestions',
            'Priority Verification Badge',
            'Direct Messaging Access',
            'Advanced Faith Compatibility Filters',
            'Unlimited Church Groups',
            '24/7 Prayer & Support'
        ],
        buttonText: 'Upgrade to Kingdom'
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
            {/* Visual Orbs for Premium Feel */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 w-full max-w-4xl">
                {/* Mobile Architecture Notice */}
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-left">
                    <span className="text-2xl">📱</span>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">Mobile Native Experience</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Candidate profiles, match discovery, and premium membership perks are native to the <strong>Lifeline Mobile App</strong> (iOS & Android). Web portals are dedicated to church leadership, pastoral oversight, and administration.
                        </p>
                    </div>
                </div>

                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6 transition-all">
                        Investment in Purpose
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Experience</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed italic">
                        Choose our premium plan to gain deeper insights and broader connections within the community.
                    </p>
                </div>

                {/* Single Premium Pricing Card */}
                <div className="flex justify-center">
                    <div className="w-full max-w-lg bg-white p-10 rounded-[2.5rem] border-2 border-blue-600 shadow-2xl shadow-blue-200/50 transform hover:scale-[1.01] transition-all duration-500 relative">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-black uppercase tracking-widest shadow-xl">
                            Highly Recommended
                        </div>

                        <div className="mb-8 text-center md:text-left">
                            <h3 className="text-3xl font-extrabold mb-3 text-blue-600">
                                {premiumPlan.name}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {premiumPlan.description}
                            </p>
                        </div>

                        <div className="mb-10 flex items-baseline justify-center md:justify-start gap-2">
                            <span className="text-sm font-bold text-slate-400">₦</span>
                            <span className="text-6xl font-black tracking-tighter text-slate-900">
                                {premiumPlan.price}
                            </span>
                            <span className="text-slate-400 text-sm font-medium">{premiumPlan.subtitle}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-12">
                            {premiumPlan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSelectPlan}
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-[0.98] bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-300/60 hover:shadow-blue-400/80 hover:-translate-y-1 ${loading ? 'opacity-70 !translate-y-0 shadow-none' : ''
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : premiumPlan.buttonText}
                        </button>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-16 text-center space-y-6">
                    <p className="text-slate-500 font-medium">
                        Not ready yet? No problem.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        Skip for now (Continue for Free)
                    </Link>
                    <p className="text-slate-400 text-xs mt-8">
                        Lifeline is currently free for all users. Premium features are optional and can be unlocked anytime.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
