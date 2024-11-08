// components/friends/FriendsList.js
import React from 'react';
import { useSelector } from 'react-redux';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    IconButton,
    Badge,
    styled
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const OnlineBadge = styled(Badge)(({ theme }) => ({
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

const FriendsList = ({ onDelete }) => {
    const { friendsList } = useSelector(state => state.friends);
    const onlineStatuses = useSelector(state => state.friends.onlineStatuses);

    return (
        <List>
            {friendsList.map((friend) => {
                const statusData = onlineStatuses[friend.id];
                const isOnline = statusData?.status === 'ONLINE';

                console.log(`Friend ${friend.id} status:`, statusData);

                return (
                    <ListItem key={friend.id}>
                        <ListItemAvatar>
                            <OnlineBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                invisible={!isOnline}
                            >
                                <Avatar
                                    src={friend.avatar}
                                    alt={friend.username}
                                >
                                    {friend.username[0].toUpperCase()}
                                </Avatar>
                            </OnlineBadge>
                        </ListItemAvatar>
                        <ListItemText
                            primary={friend.nickname || friend.username}
                            secondary={
                                <>
                                    {friend.nickname && `@${friend.username} • `}
                                    {isOnline ? 'Online' : 'Offline'}
                                </>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={() => onDelete(friend.id)}
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default FriendsList;