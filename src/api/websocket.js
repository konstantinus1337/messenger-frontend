// api/websocket.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { store } from '../redux/store';
import {
    messageReceived,
    userStatusChanged,
    typingStatusChanged,
    messageRead,
    messageDeleted,
    messageEdited
} from '../redux/slices/chatsSlice';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            try {
                const socket = new SockJS('http://localhost:8080/ws');
                this.stompClient = Stomp.over(socket);
                this.stompClient.debug = () => {};
                const headers = { Authorization: `Bearer ${token}` };

                this.stompClient.connect(
                    headers,
                    () => {
                        console.log('WebSocket Connected');
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        this.subscribeToUserEvents();
                        resolve();
                    },
                    (error) => {
                        console.error('WebSocket connection error:', error);
                        this.handleConnectionError(reject);
                    }
                );
            } catch (error) {
                console.error('WebSocket initialization error:', error);
                reject(error);
            }
        });
        if (this.connectPromise) {
            return this.connectPromise;
        }

        if (this.connected && this.stompClient) {
            return Promise.resolve(this.stompClient);
        }

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                const socket = new SockJS('http://localhost:8080/ws');
                this.stompClient = Stomp.over(socket);
                this.stompClient.debug = () => {};

                const headers = { Authorization: `Bearer ${token}` };

                this.stompClient.connect(
                    headers,
                    () => {
                        console.log('WebSocket Connected');
                        this.connected = true;
                        this.connectPromise = null;
                        this.updateUserStatus('ONLINE');
                        resolve(this.stompClient);
                    },
                    (error) => {
                        console.error('WebSocket connection error:', error);
                        this.connected = false;
                        this.stompClient = null;
                        this.connectPromise = null;
                        reject(error);
                        setTimeout(() => this.connect(token), 5000);
                    }
                );
            } catch (error) {
                this.connectPromise = null;
                reject(error);
            }
        });

        return this.connectPromise;
    }

    async subscribeToUserStatus(callback) {
        try {
            const client = await this.connect();
            if (!client) return;

            // Отписываемся от предыдущей подписки, если она есть
            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            // Подписываемся на канал статусов
            this.subscription = client.subscribe(
                '/user.status',
                (message) => {
                    try {
                        const statusUpdate = JSON.parse(message.body);
                        console.log('Received status update:', statusUpdate);
                        callback(statusUpdate);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                }
            );

        } catch (error) {
            console.error('Error subscribing to user status:', error);
        }
    }

    async updateUserStatus(status) {
        try {
            const client = await this.connect();
            if (client && this.connected) {
                console.log('Sending status update:', status);
                await client.send("/user.status", {}, JSON.stringify({ status }));
            }
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    }

    async disconnect() {
        try {
            if (this.stompClient && this.connected) {
                // Отправляем статус OFFLINE перед отключением
                await this.updateUserStatus('OFFLINE');

                // Отписываемся от подписки
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    this.subscription = null;
                }

                // Отключаем клиент
                this.stompClient.disconnect();
                this.connected = false;
                this.stompClient = null;
            }
        } catch (error) {
            console.error('Error during disconnect:', error);
        }
    }

    handleConnectionError(reject) {
        this.connected = false;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
            setTimeout(() => {
                this.connect()
                    .catch(() => {/* Handled in connect */});
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            reject(new Error('Failed to connect to WebSocket after multiple attempts'));
        }
    }

    subscribeToUserEvents() {
        // Подписка на общие события пользователя
        this.subscribe('/user/queue/status', (message) => {
            store.dispatch(userStatusChanged(JSON.parse(message.body)));
        });

        // Подписка на уведомления о прочтении сообщений
        this.subscribe('/user/queue/message.read', (message) => {
            store.dispatch(messageRead(JSON.parse(message.body)));
        });
    }

    subscribeToChat(chatId, chatType) {
        const baseRoute = chatType === 'private' ? 'private' : 'group';

        // Отписываемся от предыдущего чата, если есть
        this.unsubscribeFromChat();

        // Подписываемся на новые сообщения
        this.subscribe(`/${baseRoute}.message.${chatId}`, (message) => {
            store.dispatch(messageReceived(JSON.parse(message.body)));
        });

        // Подписываемся на статус печатания
        this.subscribe(`/${baseRoute}.typing.${chatId}`, (message) => {
            store.dispatch(typingStatusChanged(JSON.parse(message.body)));
        });

        // Подписываемся на удаление сообщений
        this.subscribe(`/${baseRoute}.message.delete.${chatId}`, (message) => {
            store.dispatch(messageDeleted(JSON.parse(message.body)));
        });

        // Подписываемся на редактирование сообщений
        this.subscribe(`/${baseRoute}.message.edit.${chatId}`, (message) => {
            store.dispatch(messageEdited(JSON.parse(message.body)));
        });
    }

    subscribe(destination, callback) {
        if (!this.connected) {
            console.warn('WebSocket not connected');
            return;
        }

        // Если подписка уже существует, сначала отписываемся
        if (this.subscriptions.has(destination)) {
            this.subscriptions.get(destination).unsubscribe();
        }

        const subscription = this.stompClient.subscribe(destination, callback);
        this.subscriptions.set(destination, subscription);
        return subscription;
    }

    unsubscribe(destination) {
        if (this.subscriptions.has(destination)) {
            this.subscriptions.get(destination).unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    unsubscribeFromChat() {
        // Отписываемся от всех подписок текущего чата
        this.subscriptions.forEach((subscription, destination) => {
            if (destination.includes('message') || destination.includes('typing')) {
                subscription.unsubscribe();
                this.subscriptions.delete(destination);
            }
        });
    }

    // Отправка сообщения
    sendMessage(chatId, chatType, message) {
        const destination = chatType === 'private'
            ? '/app/private.message.send'
            : '/app/group.message.send';

        this.send(destination, {
            chatId,
            message
        });
    }

    // Отправка статуса печатания
    sendTypingStatus(chatId, chatType, isTyping) {
        const destination = chatType === 'private'
            ? '/app/private.typing'
            : '/app/group.typing';

        this.send(destination, {
            chatId,
            typing: isTyping
        });
    }

    // Отметка сообщения как прочитанного
    markMessageAsRead(messageId) {
        this.send('/app/message.read', { messageId });
    }

    // Базовый метод отправки
    send(destination, body) {
        if (!this.connected) {
            console.warn('WebSocket not connected');
            return;
        }

        this.stompClient.send(destination, {}, JSON.stringify(body));
    }

    disconnect() {
        if (this.stompClient && this.connected) {
            // Отписываемся от всех подписок
            this.subscriptions.forEach(subscription => subscription.unsubscribe());
            this.subscriptions.clear();

            this.stompClient.disconnect(() => {
                console.log('WebSocket Disconnected');
                this.connected = false;
            });
        }
    }
}

export const webSocketService = new WebSocketService();