// ChatHeader.js
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

const ChatHeader = () => {
    const dispatch = useDispatch();
    const activeChat = useSelector(state => state.chats.activeChat);
    const chats = useSelector(state => state.chats.chats);

    // Проверяем наличие активного чата
    if (!activeChat?.id) {
        return null;
    }

    const chatInfo = activeChat.type === 'private'
        ? chats.private?.find(chat => chat.id === activeChat.id)
        : chats.group?.find(chat => chat.id === activeChat.id);

    // Если информация о чате еще не загрузилась
    if (!chatInfo) {
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

    const handleInfoClick = () => {
        dispatch(toggleRightPanel());
    };

    return (
        <AppBar position="static" color="transparent" elevation={1}>
            <Toolbar>
                <UserAvatar
                    userId={chatInfo.type === 'private' ? chatInfo.participants?.receiver?.id : null}
                    username={chatInfo.name || chatInfo.username}
                    size={40}
                    sx={{ mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                        {chatInfo.name || chatInfo.username || 'Без названия'}
                    </Typography>
                    {activeChat.type === 'private' ? (
                        <Typography variant="body2" color="text.secondary">
                            {chatInfo.online ? 'В сети' : 'Не в сети'}
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {chatInfo.members?.length || 0} участников
                        </Typography>
                    )}
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