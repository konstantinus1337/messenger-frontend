import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Snackbar,
    IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AvatarUpload } from '../../components/settings/AvatarUpload';
import ProfileSettingsForm from '../../components/settings/ProfileSettingsForm';
import { useProfile } from '../../hooks/useProfile';

const Settings = () => {
    const navigate = useNavigate();
    const {
        userProfile,
        loading,
        error,
        avatarUrl,
        updateSuccess,
        updateProfile,
        updatePassword,
        handleAvatarUpload,
        handleAvatarDelete,
        handleClearUpdateSuccess
    } = useProfile();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        if (updateSuccess) {
            setSnackbar({
                open: true,
                message: 'Настройки успешно сохранены',
                severity: 'success'
            });
            handleClearUpdateSuccess();
        }
    }, [updateSuccess, handleClearUpdateSuccess]);

    const handleProfileUpdate = async (profileData) => {
        const success = await updateProfile(profileData);
        if (success) {
            setSnackbar({
                open: true,
                message: 'Профиль успешно обновлен',
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: 'Ошибка при обновлении профиля',
                severity: 'error'
            });
        }
    };

    const handlePasswordUpdate = async (passwordData) => {
        const success = await updatePassword(passwordData);
        if (success) {
            setSnackbar({
                open: true,
                message: 'Пароль успешно изменен',
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: 'Ошибка при изменении пароля',
                severity: 'error'
            });
        }
    };

    const handleAvatarChange = async (file) => {
        const success = await handleAvatarUpload(file);
        if (success) {
            setSnackbar({
                open: true,
                message: 'Аватар успешно обновлен',
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: 'Ошибка при обновлении аватара',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={() => navigate('/profile')}
                    sx={{ mr: 2 }}
                    color="primary"
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4">
                    Настройки профиля
                </Typography>
            </Box>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <AvatarUpload
                        avatarUrl={avatarUrl}
                        onAvatarUpload={handleAvatarChange}
                        onAvatarDelete={handleAvatarDelete}
                        loading={loading?.avatar || false}
                        error={error}
                    />

                    <ProfileSettingsForm
                        userProfile={userProfile}
                        onSubmitProfile={handleProfileUpdate}
                        onSubmitPassword={handlePasswordUpdate}
                        loading={loading?.update || false}
                        error={error}
                        success={updateSuccess}
                    />
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Container>
    );
};

export default Settings;