// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout } from '../redux/slices/authSlice';
import { AuthAPI } from '../api/auth.api';
import { tokenStorage } from '../utils/tokenStorage';
import { ROUTES, ERROR_MESSAGES } from '../utils/constants';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, error } = useSelector(state => state.auth);

    const login = async (credentials, rememberMe = false) => {
        dispatch(loginStart());

        try {
            const response = await AuthAPI.login(credentials);
            const { token } = response;

            // Сохраняем токен
            tokenStorage.setToken(token);

            // Обрабатываем "Запомнить меня"
            if (rememberMe) {
                tokenStorage.setRememberMe(credentials.username);
            } else {
                tokenStorage.clearRememberMe();
            }

            dispatch(loginSuccess(response));
            navigate(ROUTES.PROFILE);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || ERROR_MESSAGES.LOGIN_FAILED;
            dispatch(loginFailure(errorMessage));
            throw new Error(errorMessage);
        }
    };

    const register = async (userData) => {
        dispatch(loginStart());

        try {
            const response = await AuthAPI.register(userData);
            const { token } = response;

            tokenStorage.setToken(token);
            dispatch(loginSuccess(response));
            navigate(ROUTES.PROFILE);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || ERROR_MESSAGES.REGISTER_FAILED;
            dispatch(loginFailure(errorMessage));
            throw new Error(errorMessage);
        }
    };

    const logoutUser = () => {
        dispatch(logout());
        tokenStorage.removeToken();
        tokenStorage.clearRememberMe();
        navigate(ROUTES.HOME);
    };

    const checkAuth = async () => {
        if (!tokenStorage.hasToken() || !tokenStorage.isTokenValid()) {
            dispatch(logout());
            return false;
        }

        try {
            const response = await AuthAPI.getCurrentUser();
            dispatch(loginSuccess({
                user: response,
                token: tokenStorage.getToken()
            }));
            return true;
        } catch (err) {
            dispatch(logout());
            return false;
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: logoutUser,
        checkAuth,
        getSavedCredentials: tokenStorage.getSavedCredentials
    };
};

export default useAuth;