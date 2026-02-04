import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
