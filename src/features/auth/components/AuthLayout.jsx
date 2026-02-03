import React from 'react';

const AuthLayout = ({ children, heroTitle, heroSubtitle, heroBadge }) => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Branding Panel */}
            <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-indigo-900 overflow-hidden">
                <img
                    src="/faith_dating_hero.png"
                    alt="Lifeline Hero"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent" />
                <div className="relative z-10 flex flex-col justify-end p-16 text-white h-full">
                    <div className="mb-8">
                        <span className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-widest">
                            {heroBadge}
                        </span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                        {heroTitle[0]} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                            {heroTitle[1]}
                        </span>
                    </h1>
                    <p className="text-lg text-indigo-100/80 max-w-md leading-relaxed">
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
