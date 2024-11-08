// hooks/useChatWebSocket.js
import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webSocketService } from '../api/websocket';
import { debounce } from 'lodash';

export const useChatWebSocket = () => {
    const dispatch = useDispatch();
    const { activeChat } = useSelector(state => state.chats);
    const token = localStorage.getItem('token');
    const typingTimeoutRef = useRef(null);

    // Подключение к WebSocket
    useEffect(() => {
        if (!token) return;

        const connectWebSocket = async () => {
            try {
                await webSocketService.connect(token);
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
            }
        };

        connectWebSocket();

        return () => {
            webSocketService.disconnect();
        };
    }, [token]);

    // Подписка на события активного чата
    useEffect(() => {
        if (!activeChat.id || !webSocketService.connected) return;

        webSocketService.subscribeToChat(activeChat.id, activeChat.type);

        return () => {
            webSocketService.unsubscribeFromChat();
        };
    }, [activeChat.id, activeChat.type]);

    // Отправка сообщения
    const sendMessage = useCallback((message) => {
        webSocketService.sendMessage(
            activeChat.id,
            activeChat.type,
            message
        );
    }, [activeChat]);

    // Обработка статуса печатания
    const sendTypingStatus = useCallback(
        debounce((isTyping) => {
            if (!activeChat.id) return;

            webSocketService.sendTypingStatus(
                activeChat.id,
                activeChat.type,
                isTyping
            );

            // Очищаем предыдущий таймаут
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Устанавливаем новый таймаут для сброса статуса
            if (isTyping) {
                typingTimeoutRef.current = setTimeout(() => {
                    webSocketService.sendTypingStatus(
                        activeChat.id,
                        activeChat.type,
                        false
                    );
                }, 3000);
            }
        }, 300),
        [activeChat]
    );

    // Отметка о прочтении сообщения
    const markMessageAsRead = useCallback((messageId) => {
        webSocketService.markMessageAsRead(messageId);
    }, []);

    return {
        sendMessage,
        sendTypingStatus,
        markMessageAsRead,
        isConnected: webSocketService.connected
    };
};