import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    CircularProgress,
    Typography
} from '@mui/material';
import MessageItem from './MessageItem';

const MessageList = () => {
    const { activeChat, loading } = useSelector(state => state.chats);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat.messages]);

    if (loading.messages) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!activeChat.messages.length) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1
                }}
            >
                <Typography color="text.secondary">
                    Нет сообщений
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            {activeChat.messages.map((message, index) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    showAvatar={
                        index === 0 ||
                        activeChat.messages[index - 1].sender.id !== message.sender.id
                    }
                />
            ))}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default MessageList;