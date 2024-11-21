// hooks/useChatWebSocket.js
import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserIdFromToken } from '../utils/jwtUtils';  // Добавляем этот импорт
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
        console.log('Received message:', message);const formattedMessage = {
            id: message.id,
            chatId: message.privateChatId || message.groupChatId, // учитываем оба типа чатов
            type: activeChat.type,
            text: message.message,
            timestamp: message.sendTime,
            sender: {
                id: message.senderId,
                username: message.senderUsername,
                nickname: message.senderNickname
            },
            read: false
        };

        console.log('Dispatching formatted message:', formattedMessage);
        dispatch(messageReceived({ message: formattedMessage }));
    }, [dispatch, activeChat.type]);

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

                if (activeChat.id) {
                    // Подписываемся на сообщения чата
                    const topicDestination = activeChat.type === 'private'
                        ? `/topic/private-message.${activeChat.id}`
                        : `/topic/group-message.${activeChat.id}`;

                    await webSocketService.subscribe(
                        topicDestination,
                        handleMessageReceived
                    );

                    console.log(`Subscribed to ${topicDestination}`);
                }

            } catch (error) {
                console.error('Failed to setup WebSocket:', error);
                handleConnectionStatus(false);
            }
        };

        setupWebSocket();

        // Cleanup function
        return () => {
            if (activeChat.id) {
                const topicDestination = activeChat.type === 'private'
                    ? `/topic/private-message.${activeChat.id}`
                    : `/topic/group-message.${activeChat.id}`;

                // Используем unsubscribeFromDestination вместо unsubscribe
                webSocketService.unsubscribeFromDestination(topicDestination);
            }
            // Отключаем WebSocket только если компонент полностью размонтируется
            // webSocketService.disconnect();
        };
    }, [token, activeChat.id, activeChat.type]);

    const sendMessage = useCallback(async (chatId, message) => {
        if (!isConnected) {
            console.log('Attempting to connect before sending message...');
            await webSocketService.connect(token);
        }

        const destination = activeChat.type === 'private'
            ? '/app/privateMessage.send'
            : '/app/group.send';

        console.log(`Sending message to ${destination}:`, { chatId, message });

        try {
            await webSocketService.send(destination, {
                chatId: parseInt(chatId, 10),
                message: message
            });

            // Добавим логирование для отладки
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
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