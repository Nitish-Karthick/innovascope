export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        // Handle expiration
        removeAuthToken();
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
    }
    return response;
};
