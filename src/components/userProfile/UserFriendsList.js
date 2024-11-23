// components/UserFriendsList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Tooltip
} from '@mui/material';
import {
    Person as PersonIcon
} from '@mui/icons-material';
import { StyledBadge } from '../common/StyledBadge';
import UserAvatar from '../common/UserAvatar';

const UserFriendsList = ({ friends }) => {
    const navigate = useNavigate();

    const handleViewProfile = (friendId) => {
        navigate(`/user/${friendId}`);
    };

    console.log('UserFriendsList friends:', friends); // Добавляем логирование

    if (!friends.length) {
        return (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                У пользователя пока нет друзей
            </Typography>
        );
    }

    // Сортировка списка друзей по имени
    const sortedFriendsList = [...friends].sort((a, b) => {
        const nameA = a.nickname || a.username;
        const nameB = b.nickname || b.username;
        return nameA.localeCompare(nameB);
    });

    return (
        <List>
            {sortedFriendsList.map((friend) => {
                const isOnline = friend.status === 'ONLINE';

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
                            <Tooltip title="Просмотреть профиль">
                                <IconButton
                                    edge="end"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewProfile(friend.id);
                                    }}
                                    color="primary"
                                    size="small"
                                >
                                    <PersonIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default UserFriendsList;