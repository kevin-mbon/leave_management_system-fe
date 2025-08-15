import axios from "axios";
import { decryptData } from '@/utils/crypto';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
});

// Helper function to get the current auth token
const getAuthToken = () => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
        try {
            const decryptedAuth = decryptData(storedAuth);
            return decryptedAuth?.token;
        } catch (error) {
            console.error('Error decrypting auth token:', error);
            return null;
        }
    }
    return null;
};

// Helper function to handle token refresh
const refreshToken = async () => {
    try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            const decryptedAuth = decryptData(storedAuth);
            const { refreshToken } = decryptedAuth;
            
            console.log('Attempting to refresh token...');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh`,
                { refreshToken }
            );

            const { token } = response.data.data;
            
            // Update the auth in localStorage with new token
            const updatedAuth = { ...decryptedAuth, token };
            localStorage.setItem('auth', JSON.stringify(updatedAuth));
            
            return token;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('auth');
        window.location.href = '/login';
        throw error;
    }
};

// Helper function to make authenticated requests
export const makeAuthenticatedRequest = async (method, url, data = null) => {
    try {
        const token = getAuthToken();
        if (!token) {
            console.error('No auth token found');
            throw new Error('No auth token found');
        }

        console.log(`Making ${method} request to ${url}`);
        const response = await api({
            method,
            url,
            data,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Request failed:', {
            method,
            url,
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.status === 401) {
            try {
                console.log('Attempting token refresh after 401...');
                const newToken = await refreshToken();
                console.log('Token refreshed, retrying request...');
                return await api({
                    method,
                    url,
                    data,
                    headers: {
                        Authorization: `Bearer ${newToken}`
                    }
                });
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                throw refreshError;
            }
        }
        throw error;
    }
};

export default api;


