// src/components/chats/ChatWindow/ChatWindow.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper, Typography } from '@mui/material';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { fetchChatMessages } from '../../../redux/slices/chatsSlice';
import { useChatWebSocket } from '../../../hooks/useChatWebSocket';

const ChatWindow = () => {
    const dispatch = useDispatch();
    const { activeChat, loading } = useSelector(state => state.chats);
    const { sendMessage } = useChatWebSocket();

    useEffect(() => {
        if (activeChat.id) {
            dispatch(fetchChatMessages({
                chatId: activeChat.id,
                chatType: activeChat.type
            }));
        }
    }, [activeChat.id, activeChat.type, dispatch]);

    if (!activeChat.id) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    bgcolor: 'background.default'
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    Выберите чат для начала общения
                </Typography>
            </Box>
        );
    }

    return (
        <Paper
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 0
            }}
        >
            <ChatHeader />
            <MessageList />
            <MessageInput onSendMessage={sendMessage} />
        </Paper>
    );
};

export default ChatWindow;