// components/common/UserAvatar.js
import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { ProfileAPI } from '../../api/profile.api';

const UserAvatar = ({
                        userId,
                        username,
                        size = 40,
                        onClick = null,
                        className = ''
                    }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAvatarUrl = async () => {
            try {
                const url = await ProfileAPI.getCachedAvatarUrl(userId);
                if (isMounted && url) {
                    setAvatarUrl(url);
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        };

        if (userId) {
            fetchAvatarUrl();
        }

        return () => {
            isMounted = false;
        };
    }, [userId]);

    return (
        <Avatar
            src={avatarUrl}
            alt={username || ''}
            onClick={onClick}
            className={className}
            sx={{
                width: size,
                height: size,
                cursor: onClick ? 'pointer' : 'default'
            }}
        >
            {username ? username[0].toUpperCase() : ''}
        </Avatar>
    );
};

export default UserAvatar;