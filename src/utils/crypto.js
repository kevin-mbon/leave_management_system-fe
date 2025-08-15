// Simple encryption key - in a real app, this should be more secure and possibly environment-specific
const ENCRYPTION_KEY = 'your-secure-encryption-key';

/**
 * Encrypts data using a simple XOR cipher
 * @param {string} data - The data to encrypt
 * @returns {string} - The encrypted data
 */
export const encryptData = (data) => {
  try {
    // Convert data to string if it's an object
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Simple XOR encryption
    let encrypted = '';
    for (let i = 0; i < stringData.length; i++) {
      const charCode = stringData.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    // Convert to base64 for safe storage
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param {string} encryptedData - The encrypted data
 * @returns {string|object} - The decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    
    // Convert from base64
    const decoded = atob(encryptedData);
    
    // Simple XOR decryption
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    // Try to parse as JSON if it looks like an object
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}; 