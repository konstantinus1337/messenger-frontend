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
import { getUserIdFromToken } from '../../../utils/jwtUtils';

const ChatList = () => {
    const dispatch = useDispatch();
    const currentUserId = getUserIdFromToken();
    const { chats, filter, activeChat, unreadMessages } = useSelector(state => state.chats);

    // Определяем filteredChats
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

    // Определяем функцию handleChatSelect
    const handleChatSelect = (chatId, chatType) => {
        dispatch(setActiveChat({ id: chatId, type: chatType }));
    };

    const getChatInfo = (chat) => {
        if (chat.type === 'private') {
            let otherUser;

            // Получаем данные из объекта participants
            const sender = chat.participants?.sender;
            const receiver = chat.participants?.receiver;

            if (Number(currentUserId) === Number(sender?.id)) {
                otherUser = {
                    id: receiver?.id,
                    username: receiver?.username,
                    nickname: receiver?.nickname
                };
            } else if (Number(currentUserId) === Number(receiver?.id)) {
                otherUser = {
                    id: sender?.id,
                    username: sender?.username,
                    nickname: sender?.nickname
                };
            }

            return {
                // Если есть nickname - показываем его, если нет - показываем username
                name: otherUser?.nickname || otherUser?.username || 'Неизвестный пользователь',
                // Убираем secondaryName, так как он нам больше не нужен
                secondaryName: null,
                username: otherUser?.username,
                userId: otherUser?.id,
                online: chat.online,
                isGroup: false
            };
        }

        return {
            name: chat.name,
            displayName: chat.name,
            description: chat.description,
            userId: null,
            membersCount: chat.members?.length || 0,
            isGroup: true
        };
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
                                username={info.username}
                                size={40}
                            />
                        </Badge>
                        <ListItemText
                            primary={
                                <Typography
                                    variant="subtitle2"
                                    component="span"
                                    sx={{
                                        fontWeight: unreadMessages[chat.id] ? 600 : 400,
                                        color: 'text.primary'
                                    }}
                                >
                                    {info.name}
                                </Typography>
                            }
                            secondary={
                                <Box component="span">
                                    {info.secondaryName && (
                                        <Typography
                                            variant="caption"
                                            component="span"
                                            color="text.secondary"
                                            sx={{ display: 'block' }}
                                        >
                                            {info.secondaryName}
                                        </Typography>
                                    )}
                                    {chat.lastMessage && (
                                        <Typography
                                            variant="body2"
                                            component="span"
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
                                        component="span"
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