import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Skeleton,
    Badge,
    styled
} from '@mui/material';
import { ProfileAPI } from '../../api/profile.api';

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const StyledAvatar = styled('div')({
    width: 100,
    height: 100,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: 'white',
    backgroundColor: '#1976d2',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
});

export const ProfileInfo = ({ profile, loading }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (profile?.id) {
                try {
                    // Используем метод для получения аватара текущего пользователя
                    const url = await ProfileAPI.getUserAvatar();
                    if (url) {
                        setAvatarUrl(url);
                    }
                } catch (error) {
                    console.error('Error fetching user avatar:', error);
                }
            }
        };

        fetchAvatar();
    }, [profile?.id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Skeleton variant="circular" width={100} height={100} />
                <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="30%" height={20} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                invisible={!profile?.online}
            >
                <StyledAvatar
                    sx={{
                        backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                    }}
                >
                    {!avatarUrl && profile?.username?.[0]?.toUpperCase()}
                </StyledAvatar>
            </StyledBadge>
            <Box>
                <Typography variant="h4" gutterBottom>
                    {profile?.nickname || profile?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    @{profile?.username}
                </Typography>
                {profile?.email && (
                    <Typography variant="body2" color="text.secondary">
                        {profile.email}
                    </Typography>
                )}
                {profile?.phoneNumber && (
                    <Typography variant="body2" color="text.secondary">
                        {profile.phoneNumber}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};