import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';

const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password:'',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const data = await login(formData.email, formData.password);
            console.log('Login Successful:', data);
            
            // Navigate to appropriate dashboard based on role
            const user = data.user;
            switch (user.role) {
                case 'SuperAdmin':
                    navigate('/dashboard/admin');
                    break;
                case 'ChurchAdmin':
                    navigate('/dashboard/church-admin');
                    break;
                case 'Counselor':
                    navigate('/dashboard/counselor');
                    break;
                case 'User':
                    navigate('/dashboard/user');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Invalid credentials';
            setErrors({ auth: message });
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-lg">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">Back to Base</h2>
                <p className="text-slate-500 italic">Login to find your "Better Half" (or just someone to share coffee with).</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    error={errors.email}
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.password}
                    />
                    <div className="flex justify-end">
                        <Link to="/forgot-password" size="sm" className="text-xs font-bold text-blue-600 hover:text-indigo-700 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="rememberMe" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                        Keep me logged in (I'm here for a long time, not just a good time)
                    </label>
                </div>

                {errors.auth && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                        {errors.auth}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="mt-12 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                    to="/signup"
                    className="text-blue-600 font-bold hover:underline transition-all"
                >
                    Create one here
                </Link>
            </p>
        </div>
    );
};

export default LoginForm;