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
import { formatMessageDate } from '../../utils/dateFormatter';

export const RecentChats = ({ chats, loading }) => {
    if (loading) {
        return <Skeleton variant="rectangular" height={200} />;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Недавние чаты
            </Typography>
            <List>
                {chats.map((chat, index) => (
                    <React.Fragment key={chat.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar src={chat.avatar}>
                                    {chat.name?.[0]?.toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={chat.name}
                                secondary={
                                    <>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {chat.lastMessage?.substring(0, 30)}
                                            {chat.lastMessage?.length > 30 ? '...' : ''}
                                        </Typography>
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block' }}
                                        >
                                            {formatMessageDate(chat.lastMessageDate)}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        {index < chats.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};