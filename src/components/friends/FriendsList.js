import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Stack,
    Box,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { StyledBadge } from '../common/StyledBadge';
import UserAvatar from '../common/UserAvatar';
import StartChatButton from './StartChatButton';
import { fetchFriends, removeFriend } from '../../redux/slices/friendsSlice';
import { friendsApi } from '../../api/friends.api';

const FriendsList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { friendsList } = useSelector(state => state.friends);
    const { onlineStatuses } = useSelector(state => state.friends);

    useEffect(() => {
        dispatch(fetchFriends());
    }, [dispatch]);

    const handleDeleteFriend = async (friendId, event) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        try {
            await friendsApi.deleteFriend(friendId);
            dispatch(removeFriend(friendId));
        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    };

    const handleStartChat = (event) => {
        event.stopPropagation(); // Предотвращаем всплытие события
    };

    const handleViewProfile = (friendId) => {
        navigate(`/user/${friendId}`);
    };

    if (!friendsList.length) {
        return (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                У вас пока нет друзей. Найдите новых друзей с помощью поиска!
            </Typography>
        );
    }

    // Сортировка списка друзей по имени
    const sortedFriendsList = [...friendsList].sort((a, b) => {
        const nameA = a.nickname || a.username;
        const nameB = b.nickname || b.username;
        return nameA.localeCompare(nameB);
    });

    return (
        <List>
            {sortedFriendsList.map((friend) => {
                const isOnline = onlineStatuses[friend.id]?.status === 'ONLINE';

                return (
                    <ListItem
                        key={friend.id}
                        onClick={() => handleViewProfile(friend.id)}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <ListItemAvatar>
                            <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                invisible={!isOnline}
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
                                        color={isOnline ? "success.main" : "text.secondary"}
                                    >
                                        {isOnline ? 'В сети' : 'Не в сети'}
                                    </Typography>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                                <StartChatButton
                                    friendId={friend.id}
                                    onClick={handleStartChat}
                                />
                                <Tooltip title="Удалить из друзей">
                                    <IconButton
                                        edge="end"
                                        onClick={(e) => handleDeleteFriend(friend.id, e)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default FriendsList;