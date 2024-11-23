import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    CircularProgress,
    Typography
} from '@mui/material';
import MessageItem from './MessageItem';
import { groupMessages } from '../../../utils/messageUtils';

const MessageList = () => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const lastMessageRef = useRef(null);
    const { activeChat, loading } = useSelector(state => state.chats);
    const messages = useSelector(state =>
        state.chats.activeChat.messages || []
    );

    // Проверяем положение скролла
    const isNearBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
            return scrollHeight - scrollTop - clientHeight < 150; // Увеличиваем порог до 150px
        }
        return true;
    };

    const scrollToBottom = (force = false) => {
        if (messagesEndRef.current && (force || isNearBottom())) {
            try {
                messagesEndRef.current.scrollIntoView({
                    behavior: force ? 'auto' : 'smooth',
                    block: 'end'
                });
            } catch (error) {
                // Fallback для старых браузеров
                messagesEndRef.current.scrollIntoView(false);
            }
        }
    };

    // Отслеживаем изменения в сообщениях
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];

            // Если это новое сообщение
            if (lastMessage !== lastMessageRef.current) {
                lastMessageRef.current = lastMessage;
                scrollToBottom();
            }
        }
    }, [messages]);

    // Прокрутка при первой загрузке чата или смене чата
    useEffect(() => {
        if (activeChat.id) {
            // Используем setTimeout для гарантии, что контент отрендерился
            setTimeout(() => scrollToBottom(true), 100);
        }
    }, [activeChat.id]);

    // Добавляем слушатель изменения размера окна
    useEffect(() => {
        const handleResize = () => scrollToBottom(true);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Проверяем, загружены ли сообщения и прокручиваем вниз
    useEffect(() => {
        if (!loading.messages && messages.length > 0) {
            scrollToBottom(true);
        }
    }, [loading.messages, messages]);

    // Обработчик события прокрутки
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
            if (scrollHeight - scrollTop === clientHeight) {
                // Блокируем прокрутку, если достигли конца
                messagesContainerRef.current.style.overflowY = 'hidden';
            } else {
                // Разблокируем прокрутку, если не достигли конца
                messagesContainerRef.current.style.overflowY = 'auto';
            }
        }
    };

    // Добавляем слушатель события прокрутки
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

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
            <Box sx={{ minHeight: 'min-content', pb: 2 }}>
                {messageGroups.map((group, groupIndex) => (
                    <Box key={groupIndex} sx={{ mb: 2 }}>
                        {group.map((message, messageIndex) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                isLastInGroup={messageIndex === group.length - 1}
                            />
                        ))}
                    </Box>
                ))}
                <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
            </Box>
        </Box>
    );
};

export default MessageList;