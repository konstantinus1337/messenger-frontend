// components/profile/RecentChats.js
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
import { useDispatch } from 'react-redux';
import UserAvatar from '../common/UserAvatar';
import { formatMessageDate } from '../../utils/dateFormatter';
import { setActiveChat } from '../../redux/slices/chatsSlice';

export const RecentChats = ({ chats, loading }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChatClick = (chat) => {
        dispatch(setActiveChat({
            id: chat.id,
            type: chat.type
        }));
        navigate('/chats');
    };

    if (loading) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Недавние чаты
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
                    Недавние чаты
                </Typography>
                <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/chats')}
                    size="small"
                >
                    Все чаты
                </Button>
            </Box>

            <List disablePadding>
                {chats.length > 0 ? (
                    chats.map((chat) => {
                        const isPrivateChat = chat.type === 'private';
                        const chatName = isPrivateChat
                            ? (chat.participants?.receiver?.nickname || chat.participants?.receiver?.username)
                            : chat.name;

                        return (
                            <ListItem
                                key={`${chat.type}-${chat.id}`}
                                onClick={() => handleChatClick(chat)}
                                sx={{
                                    px: 0,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <UserAvatar
                                        userId={isPrivateChat ? chat.participants?.receiver?.id : null}
                                        username={chatName}
                                        size={40}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={chatName}
                                    secondary={
                                        <Box component="span">
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                component="span"
                                                sx={{
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {chat.lastMessage || 'Нет сообщений'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                component="span"
                                            >
                                                {chat.lastMessageDate && formatMessageDate(chat.lastMessageDate)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        );
                    })
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        У вас пока нет чатов
                    </Typography>
                )}
            </List>
        </Box>
    );
};