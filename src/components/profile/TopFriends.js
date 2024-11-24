import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Skeleton,
    Button
} from '@mui/material';
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
                {[1, 2, 3].map((i) => (
                    <ListItem key={i}>
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

    const handleFriendClick = (friendId) => {
        navigate(`/user/${friendId}`);
    };

    const handleViewAllFriends = () => {
        navigate('/friends');
    };

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h6">
                    Друзья
                </Typography>
                <Button
                    variant="text"
                    size="small"
                    onClick={handleViewAllFriends}
                >
                    Все друзья
                </Button>
            </Box>

            <List sx={{
                '& .MuiListItem-root': {
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    }
                }
            }}>
                {friends && friends.length > 0 ? (
                    friends.map((friend) => (
                        <ListItem
                            key={friend.id}
                            onClick={() => handleFriendClick(friend.id)}
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ListItemAvatar>
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
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle2">
                                        {friend.nickname || friend.username}
                                    </Typography>
                                }
                                secondary={
                                    <Box component="span">
                                        {friend.nickname && (
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                @{friend.username}
                                                {" • "}
                                            </Typography>
                                        )}
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color={friend.status === 'ONLINE' ? "success.main" : "text.secondary"}
                                        >
                                            {friend.status === 'ONLINE' ? 'В сети' : 'Не в сети'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', py: 2 }}
                    >
                        У вас пока нет друзей
                    </Typography>
                )}
            </List>
        </Box>
    );
};

export default TopFriends;