// src/components/auth/LoginForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Alert,
    IconButton,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

function LoginForm() {
    const navigate = useNavigate();
    const { loading, error, login, getSavedCredentials } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    // Загружаем сохраненные данные при монтировании
    useEffect(() => {
        const { rememberMe: savedRememberMe, savedUsername } = getSavedCredentials();

        if (savedRememberMe && savedUsername) {
            setRememberMe(true);
            setFormData(prev => ({
                ...prev,
                username: savedUsername
            }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData, rememberMe);
        } catch (error) {
            // Ошибка уже обработана в хуке
            console.error('Login failed:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                autoFocus={!formData.username}
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
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
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
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

            <FormControlLabel
                control={
                    <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        name="rememberMe"
                        color="primary"
                    />
                }
                label="Запомнить меня"
                sx={{ mb: 2 }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mb: 2 }}
            >
                {loading ? 'Выполняется вход...' : 'Войти'}
            </Button>

            <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/register')}
            >
                Нет аккаунта? Зарегистрироваться
            </Button>
        </Box>
    );
}

export default LoginForm;