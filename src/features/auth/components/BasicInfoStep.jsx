import React from 'react';
import Input from '../../../components/Input';

const BasicInfoStep = ({ data, onChange, errors = {} }) => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">The Identity Check</h2>
                <p className="text-slate-500">Let's start with the basics (the legal version, please).</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        name="firstName"
                        value={data.firstName}
                        onChange={onChange}
                        placeholder="John"
                        error={errors.firstName}
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        value={data.lastName}
                        onChange={onChange}
                        placeholder="Doe"
                        error={errors.lastName}
                    />
                </div>
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={onChange}
                    placeholder="john@example.com"
                    error={errors.email}
                />
                <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={onChange}
                    placeholder="+234 ..."
                    error={errors.phone}
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    error={errors.password}
                />

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Gender</label>
                    <div className="flex gap-4">
                        {['Male', 'Female'].map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => onChange({ target: { name: 'gender', value: option } })}
                                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${data.gender === option
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                                    } ${errors.gender ? 'border-red-300' : ''}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {errors.gender && <p className="text-xs text-red-500 ml-1 mt-1">{errors.gender}</p>}
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
