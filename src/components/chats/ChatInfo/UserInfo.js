// components/chats/ChatInfo/UserInfo.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    Delete as DeleteIcon,
    AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { privateChatApi } from '../../../api/privateChat.api';
import { ProfileAPI } from '../../../api/profile.api';
import { getUserIdFromToken } from '../../../utils/jwtUtils';
import { useNavigate } from 'react-router-dom';

const UserInfo = ({ chatId }) => {
    const [user, setUser] = useState(null);
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = getUserIdFromToken();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatInfo = async () => {
            if (!chatId) {
                setError('Не указан идентификатор чата');
                setLoading(false);
                return;
            }

            try {
                // Получаем информацию о чате
                const chatResponse = await privateChatApi.getPrivateChat(chatId);
                const chatData = chatResponse.data;

                if (!chatData || !chatData.senderId || !chatData.receiverId) {
                    setError('Некорректные данные чата');
                    setLoading(false);
                    return;
                }

                setChat(chatData);

                // Логируем данные чата и текущий ID пользователя
                console.log('Chat Data:', chatData);
                console.log('Current User ID:', currentUserId);

                // Определяем собеседника
                const interlocutor = chatData.senderId === currentUserId
                    ? {
                        id: chatData.receiverId,
                        username: chatData.receiverUsername,
                        nickname: chatData.receiverNickname
                    }
                    : {
                        id: chatData.senderId,
                        username: chatData.senderUsername,
                        nickname: chatData.senderNickname
                    };

                // Логируем собеседника
                console.log('Interlocutor:', interlocutor);

                // Получаем информацию о собеседнике
                const userResponse = await ProfileAPI.getAnyUserProfile(interlocutor.id);
                setUser(userResponse.data);
            } catch (error) {
                setError('Не удалось загрузить информацию о чате');
                console.error('Error fetching chat info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatInfo();
    }, [chatId, currentUserId]);

    const handleDeleteChat = async () => {
        try {
            await privateChatApi.deletePrivateChat(chatId);
            // Обработка успешного удаления чата
        } catch (error) {
            console.error('Error deleting chat:', error);
            // Обработка ошибки удаления чата
        }
    };

    const handleGoToProfile = () => {
        if (user?.id) {
            navigate(`/user/${user.id}`);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                    src={user?.avatar}
                    alt={user?.username}
                    sx={{ width: 100, height: 100, mb: 1 }}
                >
                    {user?.username[0].toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                    {user?.nickname || user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {user?.online ? 'В сети' : 'Не в сети'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Чат создан: {new Date(chat?.createdAt).toLocaleString()}
                </Typography>
            </Box>

            <List dense>
                {user?.email && (
                    <ListItem>
                        <ListItemIcon>
                            <EmailIcon />
                        </ListItemIcon>
                        <ListItemText primary={user.email} />
                    </ListItem>
                )}
                {user?.phone && (
                    <ListItem>
                        <ListItemIcon>
                            <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText primary={user.phone} />
                    </ListItem>
                )}
            </List>

            <Box sx={{ mt: 2 }}>
                <Button
                    fullWidth
                    color="primary"
                    startIcon={<AccountCircleIcon />}
                    onClick={handleGoToProfile}
                >
                    Перейти в профиль
                </Button>
                <Divider sx={{ my: 2 }} />
                <Button
                    fullWidth
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteChat}
                >
                    Удалить чат
                </Button>
            </Box>
        </Box>
    );
};
export default UserInfo;