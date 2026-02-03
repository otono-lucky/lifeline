import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/Input';

const ResetPasswordForm = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log('Password reset successful');
        navigate('/password-confirmed');
    };

    return (
        <div className="w-full max-w-lg">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2 italic">Fresh Start</h2>
                <p className="text-slate-500 italic">Time for a new anchor. Make it strong, like your faith.</p>
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
                />
                <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                />

                <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 transform hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;
