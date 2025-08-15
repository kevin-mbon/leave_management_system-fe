import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData } from '@/utils/crypto';
import api from '@/api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored auth data on mount
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const decryptedAuth = decryptData(storedAuth);
        setAuth(decryptedAuth);
      } catch (error) {
        console.error('Error decrypting auth data:', error);
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store the entire data object
      const authData = response.data.data;

      // Encrypt and store auth data
      const encryptedAuth = encryptData(authData);
      localStorage.setItem('auth', encryptedAuth);
      setAuth(authData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const signup = async (firstName, lastName, email, password) => {
    try {
       await api.post('/auth/register', { firstName, lastName, email, password });
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuth({});
    navigate('/login');
  };

  // Helper function to get user data
  const getUser = () => {
    return auth?.user || null;
  };

  // Helper function to check if user has a specific role
  const hasRole = (role) => {
    return auth?.user?.role === role;
  };

  const value = {
    auth,
    setAuth,
    login,
    logout,
    loading,
    getUser,
    hasRole,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 