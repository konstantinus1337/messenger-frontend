// hooks/useChat.js
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webSocketService } from '../api/websocket';
import {
    messageReceived,
    userStatusChanged,
    markMessageAsRead
} from '../redux/slices/chatsSlice';

export const useChat = () => {
    const dispatch = useDispatch();
    const { activeChat } = useSelector(state => state.chats);
    const token = localStorage.getItem('token');

    const handleNewMessage = useCallback((message) => {
        dispatch(messageReceived({
            chatId: message.chatId,
            message: message
        }));
    }, [dispatch]);

    const handleUserStatus = useCallback((statusUpdate) => {
        dispatch(userStatusChanged({
            userId: statusUpdate.userId,
            status: statusUpdate.status
        }));
    }, [dispatch]);

    const handleMessageRead = useCallback((data) => {
        dispatch(markMessageAsRead({
            chatId: data.chatId,
            messageId: data.messageId
        }));
    }, [dispatch]);

    useEffect(() => {
        if (!token) return;

        const setupWebSocket = async () => {
            try {
                await webSocketService.connect(token);

                // Подписываемся на сообщения текущего чата
                if (activeChat.id) {
                    const chatType = activeChat.type;
                    const topic = chatType === 'private'
                        ? `/private.message.${activeChat.id}`
                        : `/group.message.${activeChat.id}`;

                    await webSocketService.subscribe(topic, handleNewMessage);
                }

                // Подписываемся на обновления статусов
                await webSocketService.subscribe('/user.status', handleUserStatus);

                // Подписываемся на уведомления о прочтении
                await webSocketService.subscribe('/message.read', handleMessageRead);

            } catch (error) {
                console.error('WebSocket connection error:', error);
            }
        };

        setupWebSocket();

        return () => {
            webSocketService.disconnect();
        };
    }, [token, activeChat.id, handleNewMessage, handleUserStatus, handleMessageRead]);

    return {
        sendMessage: webSocketService.sendMessage,
        markAsRead: webSocketService.markMessageAsRead
    };
};