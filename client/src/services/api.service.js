// client/src/services/api.service.js
import { authService } from './auth.service';

const BASE_URL = 'http://localhost:5001'; // Backend URL

const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Su sesión ha expirado o no tiene autorización',
    SERVER_ERROR: 'Error en el servidor',
    NETWORK_ERROR: 'Error de conexión',
    INVALID_RESPONSE: 'Respuesta inválida del servidor',
    SESSION_EXPIRED: 'Su sesión ha expirado'
};

const formatUrl = (endpoint) => {
    // Remove leading slash from endpoint if it exists
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${BASE_URL}${formattedEndpoint}`;
};

const handleResponse = async (response) => {
    try {
        if (!response) {
            throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }

        // Get response data
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            console.error('Unexpected content type:', contentType);
            throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
        }

        // Handle unsuccessful responses
        if (!response.ok) {
            if (response.status === 401) {
                authService.clearSession();
                throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
            }

            throw new Error(
                data.error || 
                data.message || 
                `${ERROR_MESSAGES.SERVER_ERROR}: ${response.status}`
            );
        }

        return data;
    } catch (error) {
        console.error('Response handling error:', error);
        throw error;
    }
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

export const apiService = {
    get: async (endpoint) => {
        try {
            const url = formatUrl(endpoint);
            console.log(`Making GET request to: ${url}`);  // Changed to use url
            const response = await fetch(url, {  // Changed to use url
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            return handleResponse(response);
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    },

    post: async (endpoint, data) => {
        try {
            const url = formatUrl(endpoint);
            console.log(`Making POST request to: ${url}`);  // Changed to use url
            console.log('Request data:', data);

            const response = await fetch(url, {  // Changed to use url
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            return handleResponse(response);
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    },

    put: async (endpoint, data) => {
        try {
            const url = formatUrl(endpoint);
            console.log(`Making PUT request to: ${url}`);  // Changed to use url
            const response = await fetch(url, {  // Changed to use url
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(data)
            });
            return handleResponse(response);
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            const url = formatUrl(endpoint);
            console.log(`Making DELETE request to: ${url}`);  // Changed to use url
            const response = await fetch(url, {  // Changed to use url
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            return handleResponse(response);
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }
};