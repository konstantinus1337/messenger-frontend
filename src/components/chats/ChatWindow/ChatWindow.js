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

    const handleSendMessage = async (message) => {
        try {
            await sendMessage(activeChat.id, message);
        } catch (error) {
            console.error('Error sending message:', error);
            // Здесь можно добавить обработку ошибки, например показ уведомления
        }
    };

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
            <MessageInput onSendMessage={handleSendMessage} />
        </Paper>
    );
};

export default ChatWindow;