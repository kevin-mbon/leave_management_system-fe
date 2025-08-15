import { decryptData } from './crypto';

export const getAuthToken = () => {
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
