import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    // axios.defaults.baseURL = `http://localhost:${process.env.BACKEND_PORT}/api`;
    axios.defaults.baseURL = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api`;
    // console.log('axios.defaults.baseURL:', axios.defaults.baseURL);
    // Set auth token header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Verify token and load user data
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/auth/current-user');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        try {
            const response = await axios.post('/auth/signup', {
                username,
                email,
                password
            });
            
            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};