import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    CircularProgress,
    Typography
} from '@mui/material';
import MessageItem from './MessageItem';
import { fetchChatMessages } from '../../../redux/slices/chatsSlice';

const MessageList = () => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const { activeChat, loading } = useSelector(state => state.chats);
    const messages = useSelector(state => state.chats.activeChat.messages);

    useEffect(() => {
        if (activeChat.id) {
            dispatch(fetchChatMessages({
                chatId: activeChat.id,
                chatType: activeChat.type
            }));
        }
    }, [activeChat.id, activeChat.type, dispatch]);

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Сортируем сообщения от старых к новым
    const sortedMessages = React.useMemo(() => {
        return [...(messages || [])].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    }, [messages]);

    if (loading.messages) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1,
                    minHeight: '200px'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!activeChat.id) {
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
                    Выберите чат для начала общения
                </Typography>
            </Box>
        );
    }

    if (!sortedMessages || sortedMessages.length === 0) {
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
                    Нет сообщений. Начните общение прямо сейчас!
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                height: 'calc(100vh - 200px)', // Учитываем высоту header и input
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'background.paper',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'action.hover',
                    borderRadius: '4px',
                },
            }}
        >
            {sortedMessages.map((message, index) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    showAvatar={
                        index === 0 ||
                        sortedMessages[index - 1].sender.id !== message.sender.id ||
                        new Date(message.timestamp).getTime() -
                        new Date(sortedMessages[index - 1].timestamp).getTime() > 300000 // 5 минут
                    }
                />
            ))}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default MessageList;