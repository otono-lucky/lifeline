import React from 'react';

const InterestsStep = ({ data, onChange, errors = {} }) => {
    const interests = [
        'Art', 'Cooking', 'Dancing', 'Fitness', 'Music',
        'Photography', 'Reading', 'Sports', 'Technology', 'Travel'
    ].sort();

    const toggleInterest = (interest) => {
        const current = data.interests || [];
        const updated = current.includes(interest)
            ? current.filter(i => i !== interest)
            : [...current, interest];

        onChange({ target: { name: 'interests', value: updated } });
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">What Makes You Tick</h2>
                <p className="text-slate-500">Aside from oxygen and faith, what else do you like?</p>
            </div>

            <div className="space-y-4">
                <div className={`p-4 rounded-2xl border transition-all ${errors.interests ? 'border-red-300 bg-red-50/30' : 'border-slate-100'}`}>
                    <label className="text-xs font-bold text-slate-400 mb-3 block">Select at least 3</label>
                    <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                            <button
                                key={interest}
                                type="button"
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${data.interests?.includes(interest)
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                                    }`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>
                {errors.interests && <p className="text-xs text-red-500 ml-1">{errors.interests}</p>}
            </div>
        </div>
    );
};

export default InterestsStep;
