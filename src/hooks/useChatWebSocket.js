import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webSocketService } from '../api/websocket';
import { messageReceived } from '../redux/slices/chatsSlice';

export const useChatWebSocket = () => {
    const dispatch = useDispatch();
    const { activeChat } = useSelector(state => state.chats);
    const token = localStorage.getItem('token');

    const handleNewMessage = useCallback((message) => {
        console.log('Received message:', message);
        const formattedMessage = {
            id: message.id,
            chatId: message.privateChatId || message.groupChatId,
            type: activeChat.type,
            text: message.message,
            timestamp: message.sendTime,
            sender: {
                id: message.senderId,
                username: message.senderUsername,
                nickname: message.senderNickname
            },
            receiver: activeChat.type === 'private' ? {
                id: message.receiverId,
                username: message.receiverUsername,
                nickname: message.receiverNickname
            } : null,
            read: false
        };

        dispatch(messageReceived(formattedMessage));
    }, [dispatch, activeChat.type]);

    // Подключение к WebSocket
    useEffect(() => {
        if (!token) return;

        const connect = async () => {
            try {
                await webSocketService.connect(token);
                console.log('WebSocket connection established');
            } catch (error) {
                console.error('WebSocket connection failed:', error);
            }
        };

        connect();

        return () => {
            webSocketService.disconnect();
        };
    }, [token]);

    // Подписка на сообщения
    useEffect(() => {
        if (!activeChat.id || !token) return;

        const subscribe = async () => {
            try {
                const messageDestination = `/${activeChat.type === 'private' ? 'private' : 'group'}.message.${activeChat.id}`;
                await webSocketService.subscribe(messageDestination, handleNewMessage);
                console.log('Subscribed to messages:', messageDestination);
            } catch (error) {
                console.error('Failed to subscribe:', error);
            }
        };

        subscribe();

        return () => {
            webSocketService.unsubscribeFromChat();
        };
    }, [activeChat.id, activeChat.type, handleNewMessage, token]);

    // Функция отправки сообщения
    const sendMessage = useCallback(async ({ chatId, type, message }) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket not connected');
        }

        const destination = `/${type === 'private' ? 'app/private' : 'app/group'}.message.send/${chatId}`;
        console.log('Sending message to:', destination, message);

        try {
            await webSocketService.send(destination, message);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, []);

    return {
        sendMessage,
        isConnected: webSocketService.isConnected()
    };
};

export default useChatWebSocket;