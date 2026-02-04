import React from 'react';
import Input from '../../../components/Input';

const OccupationStep = ({ data, onChange, errors = {} }) => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">The Daily Grind</h2>
                <p className="text-slate-500">How do you fund your coffee (or tea) addiction?</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="What is your occupation?"
                    name="occupation"
                    value={data.occupation}
                    onChange={onChange}
                    placeholder="Software Engineer, Doctor, etc."
                    error={errors.occupation}
                />
                <p className="text-sm text-slate-500 mt-2">
                    Sharing your occupation helps us understand your lifestyle and professional background.
                </p>
            </div>
        </div>
    );
};

export default OccupationStep;
