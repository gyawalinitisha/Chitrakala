import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                    } else {
                        // Token invalid/expired
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Auth check failed:", err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data);
                return data;
            } else {
                setError(data.message || 'Login failed');
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signup = async (name, email, password, role) => {
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data);
                return data;
            } else {
                setError(data.message || 'Signup failed');
                throw new Error(data.message || 'Signup failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const googleLogin = async (credential) => {
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: credential })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data);
                return data;
            } else {
                setError(data.message || 'Google Auth failed');
                throw new Error(data.message || 'Google Auth failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const value = {
        user,
        setUser,
        login,
        signup,
        googleLogin,
        logout,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', color: '#111' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>Chitrakala - Digital Art Gallery</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Verifying your session...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
