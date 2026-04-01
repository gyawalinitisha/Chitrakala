import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const getPasswordStrength = (password) => {
    if (!password) return { label: '', score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', score: 1 };
    if (score === 2) return { label: 'Fair', score: 2 };
    if (score === 3) return { label: 'Good', score: 3 };
    return { label: 'Strong', score: 4 };
};

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'collector'
    });
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup, googleLogin } = useAuth();
    const from = location.state?.from || null;
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const userData = await googleLogin(credentialResponse.credential);
            if (userData.role === 'artist') {
                navigate('/artist-dashboard');
            } else if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(from || '/');
            }
        } catch (err) {
            setError(err.message || 'Google authentication failed.');
        }
    };

    const handleGoogleError = () => {
        setError('Google authentication failed. Please try again.');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const strength = getPasswordStrength(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin) {
            // Client-side password validation
            if (formData.password.length < 8) {
                return setError('Password must be at least 8 characters long.');
            }
            if (!/[A-Z]/.test(formData.password)) {
                return setError('Password must contain at least one uppercase letter.');
            }
            if (!/[0-9]/.test(formData.password)) {
                return setError('Password must contain at least one number.');
            }
            if (formData.password !== formData.confirmPassword) {
                return setError('Passwords do not match.');
            }
        }

        try {
            let userData;
            if (isLogin) {
                userData = await login(formData.email, formData.password);
            } else {
                userData = await signup(formData.name, formData.email, formData.password, formData.role);
            }

            if (userData.role === 'artist') {
                navigate('/artist-dashboard');
            } else if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(from || '/');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        }
    };

    const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
    const strengthColor = strengthColors[strength.score];

    return (
        <div className="page-content container auth-page">
            <div className="auth-card animate-fade-in">
                <h1 className="auth-title">
                    {isLogin ? 'Welcome Back' : 'Join the Gallery'}
                </h1>
                <p className="auth-subtitle">
                    {isLogin ? 'Sign in to access your collection' : 'Create an account to start collecting'}
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <Input
                                id="name"
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <div className="form-group">
                                <label className="form-label">I am a...</label>
                                <div className="role-selector">
                                    <button
                                        type="button"
                                        className={`role-btn ${formData.role === 'collector' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'collector' })}
                                    >
                                        🖼️ Collector
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${formData.role === 'artist' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'artist' })}
                                    >
                                        🎨 Artist
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {/* Password strength meter – only on signup */}
                    {!isLogin && formData.password && (
                        <div className="strength-meter">
                            <div className="strength-bars">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className="strength-bar"
                                        style={{
                                            backgroundColor: i <= strength.score ? strengthColor : 'rgba(255,255,255,0.1)'
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="strength-label" style={{ color: strengthColor }}>
                                {strength.label}
                            </span>
                        </div>
                    )}

                    {!isLogin && (
                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    )}

                    {!isLogin && (
                        <p className="password-hint">
                            Must be 8+ characters with a number and uppercase letter.
                        </p>
                    )}

                    <Button className="auth-submit" size="lg" type="submit">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div className="google-auth-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                     <div className="divider" style={{ width: '100%', textAlign: 'center', borderBottom: '1px solid var(--border-color)', lineHeight: '0.1em', margin: '10px 0 20px' }}>
                        <span style={{ background: 'var(--bg-main)', padding: '0 10px', color: 'var(--text-secondary)' }}>or</span>
                     </div>
                     <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                     />
                </div>

                <div className="auth-footer" style={{ marginTop: '20px' }}>
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button className="text-gold" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
