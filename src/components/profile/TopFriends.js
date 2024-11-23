// components/profile/TopFriends.js
import React from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Skeleton,
    Box,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StyledBadge } from '../common/StyledBadge';
import UserAvatar from '../common/UserAvatar';

export const TopFriends = ({ friends, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Друзья
                </Typography>
                {[1, 2, 3].map((item) => (
                    <ListItem key={item}>
                        <ListItemAvatar>
                            <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Skeleton width="60%" />}
                            secondary={<Skeleton width="40%" />}
                        />
                    </ListItem>
                ))}
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Друзья
                </Typography>
                <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/friends')}
                    size="small"
                >
                    Все друзья
                </Button>
            </Box>

            <List disablePadding>
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <ListItem key={friend.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    invisible={!friend.online}
                                >
                                    <UserAvatar
                                        userId={friend.id}
                                        username={friend.username}
                                        size={40}
                                    />
                                </StyledBadge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={friend.nickname || friend.username}
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        {friend.online ? 'В сети' : 'Не в сети'}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        У вас пока нет друзей
                    </Typography>
                )}
            </List>
        </Box>
    );
};