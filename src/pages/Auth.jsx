import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'collector' // Default role
    });
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                login(formData.email, formData.password);
            } else {
                signup(formData.name, formData.email, formData.password, formData.role);
            }
            navigate('/');
        } catch (err) {
            setError('Authentication failed. Please try again.');
        }
    };

    return (
        <div className="page-content container auth-page">
            <div className="auth-card animate-fade-in">
                <h1 className="auth-title">
                    {isLogin ? 'Welcome Back' : 'Join the Gallery'}
                </h1>
                <p className="auth-subtitle">
                    {isLogin ? 'Sign in to access your collection' : 'Create an account to start collecting'}
                </p>

                {error && <div className="text-red-500 mb-4">{error}</div>}

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
                                        Collector
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${formData.role === 'artist' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'artist' })}
                                    >
                                        Artist
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

                    <Button className="auth-submit" size="lg" type="submit">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button className="text-gold" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
