// src/utils/constants.js

// API endpoints
export const API_BASE_URL = 'http://localhost:8080/api';
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/registration',
    PROFILE: '/user/profile'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REMEMBER_ME: 'rememberMe',
    SAVED_USERNAME: 'savedUsername'
};

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile'
};

// Error Messages
export const ERROR_MESSAGES = {
    LOGIN_FAILED: 'Ошибка входа',
    REGISTER_FAILED: 'Ошибка регистрации',
    NETWORK_ERROR: 'Ошибка сети',
    INVALID_CREDENTIALS: 'Неверные учетные данные',
    SESSION_EXPIRED: 'Сессия истекла'
};

// Validation
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_LENGTH: 10,
    USERNAME_MIN_LENGTH: 3
};