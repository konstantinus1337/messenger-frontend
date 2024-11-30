// components/chats/ChatInfo/ChatInfo.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Divider, Typography, Tabs, Tab } from '@mui/material';
import UserInfo from './UserInfo';
import GroupInfo from './GroupInfo';
import SharedFiles from './SharedFiles';
import SharedMedia from './SharedMedia';

const ChatInfo = () => {
    const { activeChat, chats } = useSelector(state => state.chats);
    const [tabValue, setTabValue] = useState(0);

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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            {activeChat.type === 'private' ? (
                <UserInfo chatId={activeChat.id} />
            ) : (
                <GroupInfo group={chatInfo} />
            )}
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Медиа" />
                    <Tab label="Файлы" />
                </Tabs>
            </Box>
            <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                    <SharedMedia chatId={activeChat.id} chatType={activeChat.type} />
                )}
                {tabValue === 1 && (
                    <SharedFiles chatId={activeChat.id} chatType={activeChat.type} />
                )}
            </Box>
        </Box>
    );
};

export default ChatInfo;