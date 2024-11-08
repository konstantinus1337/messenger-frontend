import apiClient from './axios';

export const AuthAPI = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/registration', userData);
        return response.data;
    }
};