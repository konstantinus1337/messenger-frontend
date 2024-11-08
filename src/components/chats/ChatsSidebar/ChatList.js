import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    List,
    ListItemText,
    ListItemButton,
    Badge,
    Typography,
    Box
} from '@mui/material';
import { formatMessageDate } from '../../../utils/dateFormatter';
import { setActiveChat } from '../../../redux/slices/chatsSlice';
import UserAvatar from '../../common/UserAvatar';

const ChatList = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const { chats, filter, activeChat, unreadMessages } = useSelector(state => state.chats);

    console.log('Current user:', currentUser); // Для отладки
    console.log('Chats:', chats); // Для отладки

    const filteredChats = React.useMemo(() => {
        let result = [];
        if (filter === 'all' || filter === 'private') {
            result = [...result, ...chats.private];
        }
        if (filter === 'all' || filter === 'group') {
            result = [...result, ...chats.group];
        }
        return result.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    }, [chats, filter]);

    const getOtherParticipant = (chat) => {
        // Проверяем, что у нас есть текущий пользователь и участники чата
        if (!currentUser || !chat.participants) {
            console.warn('Missing current user or chat participants');
            return null;
        }

        // Отладочная информация
        console.log('Chat participants:', chat.participants);
        console.log('Current user ID:', currentUser.id);

        let otherUser;
        if (chat.participants.sender.id === currentUser.id) {
            otherUser = chat.participants.receiver;
        } else if (chat.participants.receiver.id === currentUser.id) {
            otherUser = chat.participants.sender;
        } else {
            console.warn('Current user not found in chat participants');
            return null;
        }

        return otherUser;
    };

    const getChatInfo = (chat) => {
        if (chat.type === 'private') {
            const otherUser = getOtherParticipant(chat);

            // Отладочная информация
            console.log('Other user:', otherUser);

            // Если не удалось определить собеседника, возвращаем запасной вариант
            if (!otherUser) {
                return {
                    name: 'Неизвестный пользователь',
                    userId: null,
                    online: false,
                    isGroup: false
                };
            }

            return {
                name: otherUser.nickname || otherUser.username,
                username: otherUser.username,
                userId: otherUser.id,
                online: chat.online,
                isGroup: false
            };
        }

        return {
            name: chat.name,
            description: chat.description,
            userId: null,
            membersCount: chat.members?.length || 0,
            isGroup: true
        };
    };

    const handleChatSelect = (chatId, chatType) => {
        dispatch(setActiveChat({ id: chatId, type: chatType }));
    };

    if (!filteredChats.length) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    {filter === 'private' ? 'Нет личных чатов' :
                        filter === 'group' ? 'Нет групповых чатов' :
                            'Нет активных чатов'}
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {filteredChats.map((chat) => {
                const info = getChatInfo(chat);
                const isActive = activeChat.id === chat.id && activeChat.type === chat.type;

                // Отладочная информация
                console.log('Chat info:', info);

                return (
                    <ListItemButton
                        key={`${chat.type}-${chat.id}`}
                        selected={isActive}
                        onClick={() => handleChatSelect(chat.id, chat.type)}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            backgroundColor: isActive ? 'action.selected' : 'inherit'
                        }}
                    >
                        <Badge
                            badgeContent={unreadMessages[chat.id] || 0}
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            <UserAvatar
                                userId={info.userId}
                                username={info.name}
                                size={40}
                            />
                        </Badge>
                        <ListItemText
                            primary={
                                <Typography
                                    variant="subtitle2"
                                    component="div"
                                    sx={{
                                        fontWeight: unreadMessages[chat.id] ? 600 : 400,
                                        color: 'text.primary'
                                    }}
                                >
                                    {info.name}
                                </Typography>
                            }
                            secondary={
                                <Box>
                                    {chat.lastMessage && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '200px',
                                                display: 'inline-block',
                                                verticalAlign: 'bottom'
                                            }}
                                        >
                                            {chat.lastMessage}
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: 'block',
                                            mt: 0.5
                                        }}
                                    >
                                        {info.isGroup ? `${info.membersCount} участников` :
                                            (info.online ? 'В сети' : 'Не в сети')}
                                        {chat.lastMessageDate && ` • ${formatMessageDate(chat.lastMessageDate)}`}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItemButton>
                );
            })}
        </List>
    );
};

export default ChatList;