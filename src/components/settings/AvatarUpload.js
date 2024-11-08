import React from 'react';
import {
    Box,
    Avatar,
    IconButton,
    Typography,
    CircularProgress
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

export const AvatarUpload = ({
                                 avatarUrl,
                                 onAvatarUpload,
                                 onAvatarDelete,
                                 loading,
                                 error
                             }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onAvatarUpload(file);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    mb: 2
                }}
            >
                <Avatar
                    src={avatarUrl}
                    sx={{
                        width: 150,
                        height: 150,
                        mb: 1
                    }}
                />
                {loading && (
                    <CircularProgress
                        size={30}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-15px',
                            marginLeft: '-15px'
                        }}
                    />
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                />
                <label htmlFor="avatar-upload">
                    <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        disabled={loading}
                    >
                        <PhotoCamera />
                    </IconButton>
                </label>
                {avatarUrl && (
                    <IconButton
                        color="error"
                        onClick={onAvatarDelete}
                        disabled={loading}
                    >
                        <Delete />
                    </IconButton>
                )}
            </Box>
            {error && (
                <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 1 }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );
};