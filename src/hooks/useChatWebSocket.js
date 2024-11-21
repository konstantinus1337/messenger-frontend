// hooks/useChatWebSocket.js
import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webSocketService } from '../api/websocket';
import {
    messageReceived,
    messageRead,
    messageDeleted,
    messageEdited,
    typingStatusChanged,
    setWsConnected
} from '../redux/slices/chatsSlice';

export const useChatWebSocket = () => {
    const dispatch = useDispatch();
    const { activeChat } = useSelector(state => state.chats);
    const token = localStorage.getItem('token');
    const [isConnected, setIsConnected] = useState(false);
    const typingTimeoutRef = useRef({});

    const handleMessageReceived = useCallback((message) => {
        console.log('Received message:', message);
        dispatch(messageReceived({ message }));
    }, [dispatch]);

    const handleMessageRead = useCallback((data) => {
        console.log('Message read:', data);
        dispatch(messageRead(data));
    }, [dispatch]);

    const handleMessageDeleted = useCallback((data) => {
        console.log('Message deleted:', data);
        dispatch(messageDeleted(data));
    }, [dispatch]);

    const handleMessageEdited = useCallback((data) => {
        console.log('Message edited:', data);
        dispatch(messageEdited(data));
    }, [dispatch]);

    const handleTypingStatus = useCallback((data) => {
        dispatch(typingStatusChanged(data));

        if (typingTimeoutRef.current[data.userId]) {
            clearTimeout(typingTimeoutRef.current[data.userId]);
        }

        typingTimeoutRef.current[data.userId] = setTimeout(() => {
            dispatch(typingStatusChanged({
                chatId: data.chatId,
                userId: data.userId,
                isTyping: false
            }));
        }, 3000);
    }, [dispatch]);

    const handleConnectionStatus = useCallback((connected) => {
        console.log('WebSocket connection status changed:', connected);
        setIsConnected(connected);
        dispatch(setWsConnected(connected));
    }, [dispatch]);

    // Подключение к WebSocket и установка подписок
    useEffect(() => {
        if (!token) return;

        const setupWebSocket = async () => {
            try {
                await webSocketService.connect(token);
                handleConnectionStatus(true);

                if (activeChat.type === 'private') {
                    // Подписки для приватных чатов
                    await webSocketService.subscribe('/user.messages', handleMessageReceived);
                    await webSocketService.subscribe('/message.read', handleMessageRead);
                    await webSocketService.subscribe('/message.deleted', handleMessageDeleted);
                    await webSocketService.subscribe('/message.edited', handleMessageEdited);
                    await webSocketService.subscribe('/user.typing', handleTypingStatus);

                    if (activeChat.id) {
                        await webSocketService.subscribe(
                            `/private-chat/${activeChat.id}/messages`,
                            handleMessageReceived
                        );
                    }
                } else {
                    // Подписки для групповых чатов
                    await webSocketService.subscribe('/group.messages', handleMessageReceived);
                    await webSocketService.subscribe('/message.read', handleMessageRead);
                    await webSocketService.subscribe('/message.deleted', handleMessageDeleted);
                    await webSocketService.subscribe('/message.edited', handleMessageEdited);
                    await webSocketService.subscribe('/group.typing', handleTypingStatus);

                    if (activeChat.id) {
                        await webSocketService.subscribe(
                            `/group-chat/${activeChat.id}/messages`,
                            handleMessageReceived
                        );
                    }
                }
            } catch (error) {
                console.error('Failed to setup WebSocket:', error);
                handleConnectionStatus(false);
            }
        };

        setupWebSocket();
        webSocketService.addConnectionListener(handleConnectionStatus);

        return () => {
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
            typingTimeoutRef.current = {};
            webSocketService.removeConnectionListener(handleConnectionStatus);
            webSocketService.disconnect();
        };
    }, [token, activeChat.id, activeChat.type, handleConnectionStatus, handleMessageReceived]);

    const sendMessage = useCallback(async (chatId, message) => {
        if (!isConnected) {
            console.log('Attempting to connect before sending message...');
            await webSocketService.connect(token);
        }

        const destination = activeChat.type === 'private'
            ? '/app/privateMessage.send'  // Добавляем префикс /app
            : '/app/group.send';

        console.log(`Sending message to ${destination}:`, { chatId, message });

        await webSocketService.send(destination, {
            chatId: parseInt(chatId, 10),  // Убеждаемся, что chatId - это число
            message: message
        });
    }, [activeChat.type, isConnected, token]);

    const sendTypingStatus = useCallback(async (chatId, isTyping) => {
        if (!isConnected) {
            await webSocketService.connect(token);
        }

        const destination = activeChat.type === 'private'
            ? '/private.typing'
            : '/group.typing';

        await webSocketService.send(destination, {
            chatId,
            isTyping
        });
    }, [activeChat.type, isConnected, token]);

    const markMessageAsRead = useCallback(async (messageId, chatId) => {
        if (!isConnected) {
            await webSocketService.connect(token);
        }

        const destination = activeChat.type === 'private'
            ? '/private.enter'
            : '/group.enter';

        await webSocketService.send(destination, {
            privateChatId: chatId,
            groupChatId: chatId
        });
    }, [activeChat.type, isConnected, token]);

    return {
        sendMessage,
        sendTypingStatus,
        markMessageAsRead,
        isConnected: isConnected && !!activeChat.id
    };
};

export default useChatWebSocket;