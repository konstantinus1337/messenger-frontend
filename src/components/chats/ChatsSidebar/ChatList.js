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
        if (!currentUser || !chat.participants) {
            return null;
        }

        const { sender, receiver } = chat.participants;
        return sender.id === currentUser.id ? receiver : sender;
    };

    const getChatInfo = (chat) => {
        if (chat.type === 'private') {
            const otherUser = getOtherParticipant(chat);

            if (!otherUser) {
                return {
                    name: 'Неизвестный пользователь',
                    displayName: 'Неизвестный пользователь',
                    userId: null,
                    online: false,
                    isGroup: false
                };
            }

            const displayName = otherUser.nickname || otherUser.username;
            const secondaryName = otherUser.nickname ? `@${otherUser.username}` : null;

            return {
                name: displayName,
                secondaryName,
                username: otherUser.username,
                userId: otherUser.id,
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
                                    {info.secondaryName && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block' }}
                                        >
                                            {info.secondaryName}
                                        </Typography>
                                    )}
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