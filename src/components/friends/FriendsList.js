import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Stack,
    Badge,
    styled
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import UserAvatar from '../common/UserAvatar';
import StartChatButton from './StartChatButton';
import { fetchFriends, removeFriend } from '../../redux/slices/friendsSlice'; // Добавлен импорт removeFriend
import { useFriendsWebSocket } from '../../hooks/useFriendsWebSocket';
import { friendsApi } from '../../api/friends.api';

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

const FriendsList = () => {
    const dispatch = useDispatch();
    const { friendsList } = useSelector(state => state.friends);
    const { onlineStatuses } = useSelector(state => state.friends);

    useEffect(() => {
        dispatch(fetchFriends());
    }, [dispatch]);

    const handleDeleteFriend = async (friendId) => {
        try {
            await friendsApi.deleteFriend(friendId);
            // Локально обновляем состояние после успешного удаления
            dispatch(removeFriend(friendId));
        } catch (error) {
            console.error('Error deleting friend:', error);
        }
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
                    <ListItem key={friend.id}>
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
                                <>
                                    {friend.nickname && `@${friend.username} • `}
                                    {isOnline ? 'В сети' : 'Не в сети'}
                                </>
                            }
                        />
                        <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                                <StartChatButton friendId={friend.id} />
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDeleteFriend(friend.id)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default FriendsList;