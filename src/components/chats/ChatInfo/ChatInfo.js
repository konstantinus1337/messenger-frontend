// components/chats/ChatInfo/ChatInfo.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Divider, Typography } from '@mui/material';
import UserInfo from './UserInfo';
import GroupInfo from './GroupInfo';
import SharedFiles from './SharedFiles';
import SharedMedia from './SharedMedia';

const ChatInfo = () => {
    const { activeChat, chats } = useSelector(state => state.chats);

    // Проверка, что activeChat и его id определены
    if (!activeChat || !activeChat.id) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Нет активного чата
                </Typography>
            </Box>
        );
    }

    const chatInfo = activeChat.type === 'private'
        ? chats.private.find(chat => chat.id === activeChat.id)
        : chats.group.find(chat => chat.id === activeChat.id);

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            {activeChat.type === 'private' ? (
                <UserInfo chatId={activeChat.id} />
            ) : (
                <GroupInfo group={chatInfo} />
            )}
            <Divider />
            <SharedMedia chatId={activeChat.id} chatType={activeChat.type} />
            <Divider />
            <SharedFiles chatId={activeChat.id} chatType={activeChat.type} />
        </Box>
    );
};
export default ChatInfo;