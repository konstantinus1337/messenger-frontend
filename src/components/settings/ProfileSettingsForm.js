import React, {useState, useEffect} from 'react';
import {
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Typography,
    Paper
} from '@mui/material';
import {Save as SaveIcon, Lock as LockIcon} from '@mui/icons-material';

const ProfileSettingsForm = ({
                                 userProfile,
                                 onSubmitProfile,
                                 onSubmitPassword,
                                 loading = false,
                                 error,
                                 success
                             }) => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        nickname: ''
    });

    const [passwordData, setPasswordData] = useState({
        password: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                username: userProfile.username || '',
                email: userProfile.email || '',
                phoneNumber: userProfile.phoneNumber || '',
                nickname: userProfile.nickname || ''
            });
        }
    }, [userProfile]);

    const validateProfileData = () => {
        const errors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (profileData.email && !emailRegex.test(profileData.email)) {
            errors.email = 'Введите корректный email адрес';
        }

        const phoneRegex = /^\d{10}$/;
        if (profileData.phoneNumber && !phoneRegex.test(profileData.phoneNumber)) {
            errors.phoneNumber = 'Номер телефона должен содержать 10 цифр';
        }

        return errors;
    };

    const validatePasswordData = () => {
        const errors = {};

        if (!passwordData.password) {
            errors.password = 'Введите текущий пароль';
        }

        if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Пароль должен быть не менее 6 символов';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }

        return errors;
    };

    const handleProfileChange = (e) => {
        const {name, value} = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const {name, value} = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const errors = validateProfileData();
        if (Object.keys(errors).length === 0) {
            onSubmitProfile(profileData);
        } else {
            setValidationErrors(errors);
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const errors = validatePasswordData();
        if (Object.keys(errors).length === 0) {
            onSubmitPassword(passwordData);
        } else {
            setValidationErrors(errors);
        }
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success">
                    Изменения успешно сохранены
                </Alert>
            )}

            <Paper sx={{p: 3}}>
                <Typography variant="h6" sx={{mb: 3}}>
                    Основная информация
                </Typography>

                <Box component="form" onSubmit={handleProfileSubmit}>
                    <TextField
                        fullWidth
                        label="Имя пользователя"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        margin="normal"
                        error={!!validationErrors.username}
                        helperText={validationErrors.username}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        margin="normal"
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Номер телефона"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        margin="normal"
                        error={!!validationErrors.phoneNumber}
                        helperText={validationErrors.phoneNumber}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Никнейм"
                        name="nickname"
                        value={profileData.nickname}
                        onChange={handleProfileChange}
                        margin="normal"
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20}/> : <SaveIcon/>}
                        sx={{mt: 3}}
                    >
                        {loading ? 'Сохранение...' : 'Сохранить информацию'}
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{p: 3}}>
                <Typography variant="h6" sx={{mb: 3}}>
                    Изменение пароля
                </Typography>

                <Box component="form" onSubmit={handlePasswordSubmit}>
                    <TextField
                        fullWidth
                        label="Текущий пароль"
                        name="password"
                        type="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        margin="normal"
                        error={!!validationErrors.password}
                        helperText={validationErrors.password}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Новый пароль"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        error={!!validationErrors.newPassword}
                        helperText={validationErrors.newPassword}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Подтвердите новый пароль"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        error={!!validationErrors.confirmPassword}
                        helperText={validationErrors.confirmPassword}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20}/> : <LockIcon/>}
                        sx={{mt: 3}}
                    >
                        {loading ? 'Сохранение...' : 'Изменить пароль'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfileSettingsForm;