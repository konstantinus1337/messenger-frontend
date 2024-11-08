// utils/tokenStorage.js
import { jwtDecode } from 'jwt-decode'; // Правильный импорт

const TOKEN_KEY = 'token';
const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_USERNAME_KEY = 'savedUsername';

export const tokenStorage = {
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    hasToken: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    setRememberMe: (username) => {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        localStorage.setItem(SAVED_USERNAME_KEY, username);
    },

    clearRememberMe: () => {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(SAVED_USERNAME_KEY);
    },

    getSavedCredentials: () => {
        return {
            rememberMe: localStorage.getItem(REMEMBER_ME_KEY) === 'true',
            savedUsername: localStorage.getItem(SAVED_USERNAME_KEY)
        };
    },

    isTokenValid: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }
};