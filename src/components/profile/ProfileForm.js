import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';

export const ProfileForm = ({
                                userProfile,
                                onSubmit,
                                loading,
                                error,
                                updateSuccess
                            }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        nickname: ''
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                username: userProfile.username || '',
                email: userProfile.email || '',
                phoneNumber: userProfile.phoneNumber || '',
                nickname: userProfile.nickname || ''
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {updateSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Профиль успешно обновлен
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Имя пользователя"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                id="phoneNumber"
                label="Номер телефона"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
            />

            <TextField
                margin="normal"
                fullWidth
                id="nickname"
                label="Никнейм"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                disabled={loading}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Обновить профиль'}
            </Button>
        </Box>
    );
};