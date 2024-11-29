import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    Snackbar,
    IconButton,
    Divider,
    Button,
    Alert
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AvatarUpload } from '../../components/settings/AvatarUpload';
import ProfileSettingsForm from '../../components/settings/ProfileSettingsForm';
import DeleteAccountDialog from '../../components/settings/DeleteAccountDialog';
import useSettingsHook from '../../hooks/useSettings';
import { logout } from '../../redux/slices/authSlice';

const Settings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        userProfile,
        avatarUrl,
        loading,
        error,
        updateSuccess,
        handleAvatarUpload,
        handleAvatarDelete,
        handleUpdateProfile,
        handleUpdatePassword,
        handleDeleteAccount,
        handleClearUpdateSuccess
    } = useSettingsHook();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccountConfirm = async () => {
        setIsDeleting(true);
        try {
            const success = await handleDeleteAccount();
            if (success) {
                dispatch(logout());
                navigate('/');
            } else {
                setSnackbar({
                    open: true,
                    message: 'Ошибка при удалении аккаунта',
                    severity: 'error'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Ошибка при удалении аккаунта',
                severity: 'error'
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    React.useEffect(() => {
        if (updateSuccess) {
            setSnackbar({
                open: true,
                message: 'Настройки успешно сохранены',
                severity: 'success'
            });
            handleClearUpdateSuccess();
        }
    }, [updateSuccess, handleClearUpdateSuccess]);

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
                        onAvatarUpload={handleAvatarUpload}
                        onAvatarDelete={handleAvatarDelete}
                        loading={loading.avatar || false}
                        error={error.avatar}
                    />

                    <ProfileSettingsForm
                        userProfile={userProfile}
                        onSubmitProfile={handleUpdateProfile}
                        onSubmitPassword={handleUpdatePassword}
                        loading={loading.update || false}
                        error={error.update}
                        success={updateSuccess}
                    />

                    <Divider sx={{ my: 4 }} />

                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            После удаления аккаунта все ваши данные будут безвозвратно удалены
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={() => setDeleteDialogOpen(true)}
                            size="large"
                        >
                            Удалить аккаунт
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <DeleteAccountDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteAccountConfirm}
                isDeleting={isDeleting}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Settings;