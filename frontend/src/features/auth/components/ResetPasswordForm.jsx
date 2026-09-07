import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Input from '../../../components/Input';
import { authService } from '../../../api/services';

const ResetPasswordForm = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    // Stage machine:
    // 'validating'  → verifying token with backend API on mount
    // 'invalid'     → token missing or malformed in URL
    // 'form'        → verified valid: show password entry form
    // 'submitting'  → password reset submission in progress
    // 'error'       → backend rejected token as invalid/expired
    const [stage, setStage] = useState('validating');
    const [errorMessage, setErrorMessage] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!token || token.trim().length < 10) {
            setStage('invalid');
            return;
        }

        const verifyToken = async () => {
            setStage('validating');
            try {
                const response = await authService.verifyResetToken(token);
                if (response?.success && response?.data?.valid) {
                    setUserInfo(response.data);
                    setStage('form');
                } else {
                    setErrorMessage(response?.message || 'Invalid or expired password reset link');
                    setStage('error');
                }
            } catch (err) {
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    'This password reset link has expired or has already been used.';
                setErrorMessage(message);
                setStage('error');
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.password) {
            errors.password = 'New password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords don't match";
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setStage('submitting');
        try {
            const response = await authService.resetPassword(
                token,
                formData.password,
                formData.confirmPassword
            );
            if (response?.success) {
                navigate('/password-confirmed', { replace: true });
            } else {
                setErrorMessage(response?.message || 'Failed to reset password.');
                setStage('error');
            }
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to reset password.';
            setErrorMessage(message);
            setStage('error');
        }
    };

    // ── Checking & verifying token with backend ──────────────────────────────
    if (stage === 'validating') {
        return (
            <div className="w-full max-w-lg text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Verifying reset link...</p>
                <p className="text-slate-400 text-sm mt-1">Please wait while we authenticate your request.</p>
            </div>
        );
    }

    // ── Token missing from URL ──────────────────────────────────────────────
    if (stage === 'invalid') {
        return (
            <div className="w-full max-w-lg">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold text-red-600 mb-2 italic">Invalid Link</h2>
                    <p className="text-slate-500 italic mb-4">
                        This password reset link is missing or malformed. Reset links can only be used once.
                    </p>
                </div>
                <Link
                    to="/forgot-password"
                    className="block w-full text-center py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                    Request a New Reset Link
                </Link>
            </div>
        );
    }

    // ── Token rejected by server (expired / already used) ──────────────────
    if (stage === 'error') {
        return (
            <div className="w-full max-w-lg">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold text-red-600 mb-2 italic">Reset Link Expired</h2>
                    <p className="text-red-500 italic mb-2">{errorMessage}</p>
                    <p className="text-slate-500 text-sm mb-6">
                        Password reset links are valid for 15 minutes and can only be used once. Please request a fresh link below.
                    </p>
                </div>
                <Link
                    to="/forgot-password"
                    className="block w-full text-center py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                    Request a New Reset Link
                </Link>
            </div>
        );
    }

    // ── Password entry form (only shown after token is verified by backend) ──
    const isSubmitting = stage === 'submitting';

    return (
        <div className="w-full max-w-lg">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">Fresh Start</h2>
                <p className="text-slate-500 italic">
                    {userInfo?.firstName
                        ? `Hi ${userInfo.firstName}, choose a new password for your account.`
                        : 'Time for a new anchor. Make it strong, like your faith.'}
                </p>
                {userInfo?.email && (
                    <p className="text-xs text-slate-400 mt-1">
                        Account: <span className="font-semibold text-slate-600">{userInfo.email}</span>
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="New Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={fieldErrors.password}
                />
                <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={fieldErrors.confirmPassword}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;
