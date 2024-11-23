import React from 'react';
import {
    Box,
    Typography,
    Skeleton, // Добавляем импорт Skeleton
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StyledBadge } from '../common/StyledBadge';
import UserAvatar from '../common/UserAvatar';
const UserFriendsList = ({ friends, isLoading, error }) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Друзья
                </Typography>
                {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box sx={{ width: '100%' }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    const hasFriends = Array.isArray(friends) && friends.length > 0;

    if (!hasFriends) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Друзья
                </Typography>
                <Typography color="text.secondary">
                    У пользователя пока нет друзей
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Друзья ({friends.length})
            </Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2
            }}>
                {friends.map((friend) => (
                    <Box
                        key={friend.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            cursor: 'pointer',
                            borderRadius: 1,
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                        onClick={() => navigate(`/user/${friend.id}`)}
                    >
                        <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            invisible={friend.status !== 'ONLINE'}
                        >
                            <UserAvatar
                                userId={friend.id}
                                username={friend.username}
                                size={40}
                            />
                        </StyledBadge>
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle2">
                                {friend.nickname || friend.username}
                            </Typography>
                            {friend.nickname && (
                                <Typography variant="body2" color="text.secondary">
                                    @{friend.username}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
export default UserFriendsList;