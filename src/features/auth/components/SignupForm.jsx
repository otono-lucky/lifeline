import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import BasicInfoStep from './BasicInfoStep';
import OriginStep from './OriginStep';
import ResidenceStep from './ResidenceStep';
import OccupationStep from './OccupationStep';
import InterestsStep from './InterestsStep';
import ChurchStep from './ChurchStep';

const SignupForm = () => {
    const [step, setStep] = useState(1);
    const totalSteps = 6;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        gender: '',
        originCountry: '',
        originState: '',
        originLga: '',
        residenceCountry: '',
        residenceState: '',
        residenceCity: '',
        residenceAddress: '',
        sameAsOrigin: false,
        occupation: '',
        interests: [],
        church: '',
        matchPreference: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'sameAsOrigin' && val) {
            setFormData(prev => ({
                ...prev,
                sameAsOrigin: true,
                residenceCountry: prev.originCountry,
                residenceState: prev.originState,
                residenceCity: prev.originLga,
            }));
        }

        // Clear error when interacting
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.firstName) newErrors.firstName = 'Required';
            if (!formData.lastName) newErrors.lastName = 'Required';
            if (!formData.email) newErrors.email = 'Required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
            if (!formData.phone) newErrors.phone = 'Required';
            if (!formData.password) newErrors.password = 'Required';
            else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
            if (!formData.gender) newErrors.gender = 'Please select your gender';
        } else if (step === 2) {
            if (!formData.originCountry) newErrors.originCountry = 'Required';
            if (!formData.originState) newErrors.originState = 'Required';
            if (!formData.originLga) newErrors.originLga = 'Required';
        } else if (step === 3) {
            if (!formData.residenceCountry) newErrors.residenceCountry = 'Required';
            if (!formData.residenceState) newErrors.residenceState = 'Required';
            if (!formData.residenceCity) newErrors.residenceCity = 'Required';
            if (!formData.residenceAddress) newErrors.residenceAddress = 'Required';
        } else if (step === 4) {
            if (!formData.occupation) newErrors.occupation = 'Required';
        } else if (step === 5) {
            if (formData.interests.length < 3) newErrors.interests = 'Select at least 3 interests';
        } else if (step === 6) {
            if (!formData.church) newErrors.church = 'Required';
            if (!formData.matchPreference) newErrors.matchPreference = 'Required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) {
            if (step < totalSteps) setStep(step + 1);
            else handleSubmit();
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // If the backend returned specific validation/logic errors
                if (data.message === 'User already exists') {
                    setErrors({ email: 'This email is already registered.' });
                    setStep(1); // Jump back to where email is
                } else {
                    alert(data.message || 'Something went wrong during signup.');
                }
                return;
            }

            console.log('Signup Successful:', data);
            navigate('/email-confirmation');
        } catch (error) {
            console.error('Network error:', error);
            alert('Could not connect to the server. Please check if the backend is running.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <BasicInfoStep data={formData} onChange={handleInputChange} errors={errors} />;
            case 2:
                return <OriginStep data={formData} onChange={handleInputChange} errors={errors} />;
            case 3:
                return <ResidenceStep data={formData} onChange={handleInputChange} errors={errors} />;
            case 4:
                return <OccupationStep data={formData} onChange={handleInputChange} errors={errors} />;
            case 5:
                return <InterestsStep data={formData} onChange={handleInputChange} errors={errors} />;
            case 6:
                return <ChurchStep data={formData} onChange={handleInputChange} errors={errors} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-lg">
            <ProgressBar currentStep={step} totalSteps={totalSteps} />

            <form onSubmit={(e) => e.preventDefault()} className="mt-8">
                <div className="min-h-[380px] mb-10">
                    {renderStep()}
                </div>

                <div className="flex gap-4">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={nextStep}
                        disabled={isSubmitting}
                        className={`flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? 'Sending...' : (step === totalSteps ? 'Complete Sign Up' : 'Continue')}
                    </button>
                </div>
            </form>

            <p className="mt-12 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/" className="text-blue-600 font-bold hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
};

export default SignupForm;
