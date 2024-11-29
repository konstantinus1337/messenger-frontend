import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    CircularProgress,
    Typography,
    Divider
} from '@mui/material';
import MessageItem from './MessageItem';
import { groupMessages, formatDateSeparator, shouldShowDateSeparator } from '../../../utils/messageUtils';
import { getUserIdFromToken } from '../../../utils/jwtUtils';
import { useChatWebSocket } from '../../../hooks/useChatWebSocket';
import { messageEdited, messageReceived } from '../../../redux/slices/chatsSlice';
import { webSocketService } from '../../../api/websocket'; // Импорт webSocketService

const MessageList = () => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const lastMessageRef = useRef(null);
    const { activeChat, loading, messageSearch } = useSelector(state => state.chats);
    const messages = useSelector(state => state.chats.activeChat.messages || []);
    const { results, currentIndex } = messageSearch;
    const currentUserId = getUserIdFromToken();
    const { wsConnected } = useChatWebSocket();
    const dispatch = useDispatch();

    const isNearBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
            return scrollHeight - scrollTop - clientHeight < 150;
        }
        return true;
    }, []);

    const scrollToBottom = useCallback((force = false) => {
        if (messagesEndRef.current && (force || isNearBottom())) {
            try {
                messagesEndRef.current.scrollIntoView({
                    behavior: force ? 'auto' : 'smooth',
                    block: 'end'
                });
            } catch (error) {
                messagesEndRef.current.scrollIntoView(false);
            }
        }
    }, [isNearBottom]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage !== lastMessageRef.current) {
                lastMessageRef.current = lastMessage;
                scrollToBottom();
            }
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (activeChat.id) {
            setTimeout(() => scrollToBottom(true), 100);
        }
    }, [activeChat.id, scrollToBottom]);

    useEffect(() => {
        const handleResize = () => scrollToBottom(true);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [scrollToBottom]);

    useEffect(() => {
        if (!loading.messages && messages.length > 0) {
            scrollToBottom(true);
        }
    }, [loading.messages, messages, scrollToBottom]);

    const handleScroll = useCallback(() => {
        if (messagesContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
            if (scrollHeight - scrollTop === clientHeight) {
                messagesContainerRef.current.style.overflowY = 'hidden';
            } else {
                messagesContainerRef.current.style.overflowY = 'auto';
            }
        }
    }, []);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleMessageEdited = useCallback((data) => {
        console.log('Message edited:', data);
        dispatch(messageEdited(data));
    }, [dispatch]);

    const handleMessageReceived = useCallback((data) => {
        console.log('Message received:', data);
        dispatch(messageReceived(data));
    }, [dispatch]);

    useEffect(() => {
        if (!wsConnected) return;

        const topicDestination = activeChat.type === 'private'
            ? `/topic/private-message.${activeChat.id}`
            : `/topic/group-message.${activeChat.id}`;

        const subscription = webSocketService.subscribe(
            topicDestination,
            (message) => {
                if (message.type === 'MESSAGE_EDITED') {
                    handleMessageEdited(message);
                } else {
                    handleMessageReceived(message);
                }
            }
        );

        return () => {
            webSocketService.unsubscribeFromDestination(topicDestination);
        };
    }, [wsConnected, activeChat.id, activeChat.type, handleMessageEdited, handleMessageReceived]);

    const renderDateSeparator = (date) => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                my: 2,
                position: 'relative'
            }}
        >
            <Divider sx={{ flex: 1 }} />
            <Typography
                variant="caption"
                sx={{
                    mx: 2,
                    px: 1,
                    py: 0.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    color: 'text.secondary'
                }}
            >
                {formatDateSeparator(date)}
            </Typography>
            <Divider sx={{ flex: 1 }} />
        </Box>
    );

    if (loading.messages) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!messages.length) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography color="text.secondary">
                    Нет сообщений
                </Typography>
                {!wsConnected && (
                    <Typography variant="caption" color="error">
                    </Typography>
                )}
            </Box>
        );
    }

    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const messageGroups = groupMessages(sortedMessages);
    let lastMessageDate = null;

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
                {messageGroups.map((group, groupIndex) => {
                    const firstMessageInGroup = group[0];
                    const currentDate = new Date(firstMessageInGroup.timestamp);
                    let dateSeparator = null;

                    if (!lastMessageDate || shouldShowDateSeparator(firstMessageInGroup, { timestamp: lastMessageDate })) {
                        dateSeparator = renderDateSeparator(currentDate);
                        lastMessageDate = currentDate;
                    }

                    return (
                        <React.Fragment key={groupIndex}>
                            {dateSeparator}
                            <Box sx={{ mb: 2 }}>
                                {group.map((message, messageIndex) => {
                                    const isHighlighted = results[currentIndex]?.id === message.id;
                                    return (
                                        <MessageItem
                                            key={message.id}
                                            message={message}
                                            isFirstInGroup={messageIndex === 0}
                                            isMine={message.sender.id === currentUserId}
                                            chatType={activeChat.type}
                                            isHighlighted={isHighlighted}
                                            ref={isHighlighted ? messagesEndRef : null}
                                        />
                                    );
                                })}
                            </Box>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
            </Box>
        </Box>
    );
};

export default MessageList;