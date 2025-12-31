import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        // Check local storage for persisted user on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Load all users (mock database)
        const storedUsers = localStorage.getItem('all_users');
        if (storedUsers) {
            setAllUsers(JSON.parse(storedUsers));
        }

        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Super simple Admin backdoor for testing
        if (email === 'admin@gallery.com' && password === 'admin123') {
            const adminUser = {
                id: 'admin-001',
                name: 'Gallery Admin',
                email: 'admin@gallery.com',
                role: 'admin'
            };
            setUser(adminUser);
            localStorage.setItem('user', JSON.stringify(adminUser));
            return true;
        }

        // Check against registered users
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (foundUser) {
            const { password, ...userWithoutPass } = foundUser; // Don't put pass in session
            setUser(userWithoutPass);
            localStorage.setItem('user', JSON.stringify(userWithoutPass));
            return true;
        }

        // Fallback for "Demo User" if not found in list (backward compatibility)
        if (email.includes('@')) {
            const mockUser = {
                id: '1',
                name: 'Demo User',
                email: email,
                role: 'collector',
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return true;
        }

        throw new Error("Invalid credentials");
    };

    const signup = (name, email, password, role) => {
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // Storing password in plain text for this mock only!
            role,
            joined: new Date().toLocaleDateString()
        };

        setAllUsers(prev => {
            const updated = [...prev, newUser];
            localStorage.setItem('all_users', JSON.stringify(updated));
            return updated;
        });

        // Auto login after signup
        const { password: _, ...userSession } = newUser;
        setUser(userSession);
        localStorage.setItem('user', JSON.stringify(userSession));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        allUsers, // Expose for Admin Dashboard
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
