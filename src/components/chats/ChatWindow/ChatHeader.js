import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Info as InfoIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { toggleRightPanel } from '../../../redux/slices/chatsSlice';
import UserAvatar from '../../common/UserAvatar';
import { getUserIdFromToken } from '../../../utils/jwtUtils';

const ChatHeader = () => {
    const dispatch = useDispatch();
    const currentUserId = getUserIdFromToken();
    const activeChat = useSelector(state => state.chats.activeChat);
    const chats = useSelector(state => state.chats.chats);

    // Проверяем наличие активного чата
    if (!activeChat?.id) {
        return null;
    }

    const chat = activeChat.type === 'private'
        ? chats.private?.find(chat => chat.id === activeChat.id)
        : chats.group?.find(chat => chat.id === activeChat.id);

    // Если информация о чате еще не загрузилась
    if (!chat) {
        return (
            <AppBar position="static" color="transparent" elevation={1}>
                <Toolbar>
                    <Typography variant="subtitle1">
                        Загрузка...
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }

    const getChatInfo = () => {
        if (chat.type === 'private') {
            const sender = chat.participants?.sender;
            const receiver = chat.participants?.receiver;
            let otherUser;

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
                userId: otherUser?.id,
                isGroup: false,
                online: chat.online,
                membersCount: null
            };
        }

        return {
            name: chat.name,
            userId: null,
            isGroup: true,
            membersCount: chat.members?.length || 0
        };
    };

    const handleInfoClick = () => {
        dispatch(toggleRightPanel());
    };

    const chatInfo = getChatInfo();

    return (
        <AppBar position="static" color="transparent" elevation={1}>
            <Toolbar>
                <UserAvatar
                    userId={chatInfo.userId}
                    username={chatInfo.name}
                    size={40}
                    sx={{ mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                        {chatInfo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {chatInfo.isGroup
                            ? `${chatInfo.membersCount} участников`
                            : (chatInfo.online ? 'В сети' : 'Не в сети')
                        }
                    </Typography>
                </Box>
                <Tooltip title="Поиск по сообщениям">
                    <IconButton>
                        <SearchIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Информация">
                    <IconButton onClick={handleInfoClick}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Дополнительно">
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
};

export default ChatHeader;