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
    const {
        chats,
        filter,
        activeChat,
        unreadMessages,
        chatSearch: { query, results }
    } = useSelector(state => state.chats);

    // Определяем filteredChats с учетом поиска
    const filteredChats = React.useMemo(() => {
        // Если есть поисковой запрос, используем результаты поиска
        if (query.trim()) {
            return results;
        }

        // Если поиска нет, используем стандартную фильтрацию
        let result = [];
        if (filter === 'all' || filter === 'private') {
            result = [...result, ...chats.private];
        }
        if (filter === 'all' || filter === 'group') {
            result = [...result, ...chats.group];
        }
        return result.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    }, [chats, filter, query, results]);

    const handleChatSelect = (chatId, chatType) => {
        dispatch(setActiveChat({ id: chatId, type: chatType }));
    };

    const getChatInfo = (chat) => {
        const chatType = chat.type || chat.searchType;
        if (chatType === 'private') {
            let otherUser;

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
                name: otherUser?.nickname || otherUser?.username || 'Неизвестный пользователь',
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
                    {query.trim()
                        ? 'Чаты не найдены'
                        : filter === 'private'
                            ? 'Нет личных чатов'
                            : filter === 'group'
                                ? 'Нет групповых чатов'
                                : 'Нет активных чатов'
                    }
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {filteredChats.map((chat) => {
                const info = getChatInfo(chat);
                const chatType = chat.type || chat.searchType;
                const isActive = activeChat.id === chat.id && activeChat.type === chatType;

                return (
                    <ListItemButton
                        key={`${chatType}-${chat.id}`}
                        selected={isActive}
                        onClick={() => handleChatSelect(chat.id, chatType)}
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