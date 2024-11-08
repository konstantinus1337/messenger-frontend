import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Skeleton,
    Divider
} from '@mui/material';

export const TopFriends = ({ friends, loading }) => {
    if (loading) {
        return <Skeleton variant="rectangular" height={200} />;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Друзья
            </Typography>
            <List>
                {friends.map((friend, index) => (
                    <React.Fragment key={friend.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar src={friend.avatar}>
                                    {friend.username?.[0]?.toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={friend.nickname || friend.username}
                                secondary={
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {friend.online ? 'В сети' : 'Не в сети'}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < friends.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};