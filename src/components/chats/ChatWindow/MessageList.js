// components/chats/ChatWindow/MessageList.js
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    CircularProgress,
    Typography
} from '@mui/material';
import MessageItem from './MessageItem';
import { groupMessages } from '../../../utils/messageUtils';

const MessageList = ({ onEditMessage, onDeleteMessage }) => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { activeChat, loading } = useSelector(state => state.chats);
    const messages = useSelector(state =>
        state.chats.activeChat.messages || []
    );

    // Сохраняем позицию скролла перед обновлением
    const preserveScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
            // Проверяем, был ли скролл внизу (с небольшим порогом в 100px)
            return scrollHeight - scrollTop - clientHeight < 100;
        }
        return true;
    };

    const scrollToBottom = (force = false) => {
        if (force || preserveScroll()) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Прокрутка при получении новых сообщений
    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    // Прокрутка при первой загрузке чата
    useEffect(() => {
        scrollToBottom(true);
    }, [activeChat.id]);

    if (loading.messages) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!messages.length) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1
                }}
            >
                <Typography color="text.secondary">
                    Нет сообщений
                </Typography>
            </Box>
        );
    }

    // Сортируем сообщения по времени (старые вверху, новые внизу)
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Группируем отсортированные сообщения
    const messageGroups = groupMessages(sortedMessages);

    return (
        <Box
            ref={messagesContainerRef}
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'background.default',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'action.hover',
                    borderRadius: '4px',
                    '&:hover': {
                        backgroundColor: 'action.selected',
                    }
                }
            }}
        >
            {/* Контейнер для сообщений с отступом снизу для скролла */}
            <Box sx={{ minHeight: 'min-content', pb: 2 }}>
                {messageGroups.map((group, groupIndex) => (
                    <Box key={groupIndex} sx={{ mb: 2 }}>
                        {group.map((message, messageIndex) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                onEdit={onEditMessage}
                                onDelete={onDeleteMessage}
                                isLastInGroup={messageIndex === group.length - 1}
                            />
                        ))}
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>
        </Box>
    );
};

export default MessageList;