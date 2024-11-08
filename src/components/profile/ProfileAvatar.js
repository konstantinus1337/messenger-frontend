import React, { useState, useEffect } from 'react';
import {
    Badge,
    IconButton,
    Stack,
    CircularProgress,
    styled
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { ProfileAPI } from '../../api/profile.api';
import UserAvatar from '../common/UserAvatar';
import { useSelector } from 'react-redux';

const Input = styled('input')({
    display: 'none',
});

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        }
    }
}));

export const ProfileAvatar = ({
                                  onAvatarUpload,
                                  onAvatarDelete,
                                  loading = false
                              }) => {
    const userId = useSelector(state => state.auth.user?.id);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Сброс прогресса перед новой загрузкой
            setUploadProgress(0);
            await onAvatarUpload(file);

            // Очищаем кеш аватара после успешной загрузки
            ProfileAPI.clearAvatarCache(userId);

            // Сбрасываем input для возможности повторной загрузки того же файла
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading avatar:', error);
            // Можно добавить обработку ошибки, например показ уведомления
        }
    };

    const handleDelete = async () => {
        try {
            await onAvatarDelete();
            // Очищаем кеш аватара после удаления
            ProfileAPI.clearAvatarCache(userId);
        } catch (error) {
            console.error('Error deleting avatar:', error);
            // Можно добавить обработку ошибки
        }
    };

    return (
        <Stack direction="column" alignItems="center" spacing={2}>
            <Box sx={{ position: 'relative' }}>
                <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <label htmlFor="avatar-upload-input">
                            <Input
                                accept="image/*"
                                id="avatar-upload-input"
                                type="file"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="span"
                                disabled={loading}
                                size="small"
                            >
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    }
                >
                    <UserAvatar
                        userId={userId}
                        size={100}
                    />
                </StyledBadge>

                {loading && (
                    <CircularProgress
                        size={100}
                        thickness={2}
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                            color: 'primary.main',
                        }}
                    />
                )}
            </Box>

            <IconButton
                color="error"
                onClick={handleDelete}
                disabled={loading}
                aria-label="delete avatar"
                size="small"
                sx={{
                    mt: 1,
                    visibility: loading ? 'hidden' : 'visible'
                }}
            >
                <Delete />
            </IconButton>
        </Stack>
    );
};

export default ProfileAvatar;