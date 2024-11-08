// src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    TextField,
    Alert,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import { AuthAPI } from '../../api/auth.api';

function RegisterForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        nickname: ''
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Валидация username
        if (!formData.username) {
            newErrors.username = 'Имя пользователя обязательно';
        }

        // Валидация password
        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email обязателен';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Введите корректный email';
        }

        // Валидация номера телефона
        const phoneRegex = /^\d{10}$/;
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Номер телефона обязателен';
        } else if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Введите 10 цифр номера телефона без +7';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        dispatch(loginStart());

        try {
            const response = await AuthAPI.register(formData);
            dispatch(loginSuccess(response));
            navigate('/profile');
        } catch (err) {
            dispatch(loginFailure(err.response?.data?.message || 'Ошибка регистрации'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Для номера телефона разрешаем только цифры
        if (name === 'phoneNumber' && !/^\d*$/.test(value)) {
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });

        // Очищаем ошибку поля при изменении
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Имя пользователя"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 2 }}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                    endAdornment: (
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="email"
                label="Email"
                type="email"
                id="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="phoneNumber"
                label="Номер телефона (без +7)"
                type="tel"
                id="phoneNumber"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={loading}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                placeholder="9991234567"
                sx={{ mb: 2 }}
            />

            <TextField
                margin="normal"
                fullWidth
                name="nickname"
                label="Никнейм (необязательно)"
                id="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                disabled={loading}
                sx={{ mb: 3 }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mb: 2 }}
            >
                {loading ? 'Выполняется регистрация...' : 'Зарегистрироваться'}
            </Button>

            <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
            >
                Уже есть аккаунт? Войти
            </Button>
        </Box>
    );
}

export default RegisterForm;