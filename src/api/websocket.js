// api/websocket.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.connectPromise = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.messageQueue = [];
        this.connectionListeners = new Set();
    }

    async connect(token) {
        if (this.connected && this.stompClient) {
            return Promise.resolve(this.stompClient);
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        console.log('Attempting to connect to WebSocket...');

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                const socket = new SockJS('http://localhost:8080/ws');
                this.stompClient = Stomp.over(socket);

                // Включаем логи для отладки
                this.stompClient.debug = (str) => {
                    console.log(str);
                };

                // Добавляем Bearer префикс к токену
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'heart-beat': '0,0',
                    'accept-version': '1.1,1.0',
                };

                this.stompClient.connect(
                    headers,
                    () => {
                        console.log('WebSocket Connected Successfully');
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        this.connectPromise = null;
                        this.notifyConnectionListeners(true);
                        resolve(this.stompClient);
                    },
                    (error) => {
                        console.error('WebSocket connection error:', error);
                        this.handleConnectionError();
                        this.connectPromise = null;
                        reject(error);
                    }
                );

                socket.onclose = () => {
                    if (this.connected) {
                        console.log('WebSocket connection lost');
                        this.handleConnectionError();
                    }
                };
            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                this.connectPromise = null;
                reject(error);
            }
        });

        return this.connectPromise;
    }

    addConnectionListener(listener) {
        this.connectionListeners.add(listener);
    }

    removeConnectionListener(listener) {
        this.connectionListeners.delete(listener);
    }

    notifyConnectionListeners(connected) {
        this.connectionListeners.forEach(listener => listener(connected));
    }

    handleConnectionError() {
        console.log('Handling connection error...');
        this.connected = false;
        this.stompClient = null;
        this.notifyConnectionListeners(false);

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect(localStorage.getItem('token'));
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    async subscribe(destination, callback) {
        console.log(`Attempting to subscribe to ${destination}`);
        try {
            const client = await this.connect(localStorage.getItem('token'));

            // Отписываемся от предыдущей подписки, если она существует
            if (this.subscriptions.has(destination)) {
                this.unsubscribeFromDestination(destination);
            }

            const subscription = client.subscribe(destination, (message) => {
                console.log(`Received message on ${destination}:`, message);
                try {
                    const payload = JSON.parse(message.body);
                    callback(payload);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });

            this.subscriptions.set(destination, subscription);
            console.log(`Successfully subscribed to ${destination}`);
            return subscription;
        } catch (error) {
            console.error(`Error subscribing to ${destination}:`, error);
            throw error;
        }
    }

    // Добавляем метод для отписки от конкретного destination
    unsubscribeFromDestination(destination) {
        if (this.subscriptions.has(destination)) {
            const subscription = this.subscriptions.get(destination);
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log(`Unsubscribed from ${destination}`);
        }
    }

    // Добавляем общий метод unsubscribe
    unsubscribe(destination) {
        if (destination) {
            this.unsubscribeFromDestination(destination);
        } else {
            // Если destination не указан, отписываемся от всех подписок
            this.subscriptions.forEach((subscription, dest) => {
                subscription.unsubscribe();
                console.log(`Unsubscribed from ${dest}`);
            });
            this.subscriptions.clear();
        }
    }

    disconnect() {
        console.log('Disconnecting WebSocket...');
        // Сначала отписываемся от всех подписок
        this.unsubscribe();

        if (this.stompClient && this.connected) {
            this.stompClient.disconnect(() => {
                console.log('WebSocket Disconnected');
                this.connected = false;
                this.stompClient = null;
            });
        }
    }

    async send(destination, message) {
        console.log(`Sending message to ${destination}:`, message);
        try {
            const client = await this.connect(localStorage.getItem('token'));

            // Добавляем Bearer префикс к токену в заголовках каждого сообщения
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'content-type': 'application/json'
            };

            client.send(destination, headers, JSON.stringify(message));
            console.log(`Message sent successfully to ${destination}`);
        } catch (error) {
            console.error(`Error sending message to ${destination}:`, error);
            throw error;
        }
    }

        unsubscribeFromChat(chatId) {
        console.log(`Unsubscribing from chat ${chatId}...`);
        const chatDestinations = [
            `/chat.${chatId}.messages`,
            `/chat.${chatId}.typing`,
            `/chat.${chatId}.presence`
        ];

        chatDestinations.forEach(destination => {
            if (this.subscriptions.has(destination)) {
                this.subscriptions.get(destination).unsubscribe();
                this.subscriptions.delete(destination);
                console.log(`Unsubscribed from ${destination}`);
            }
        });
    }

    isConnected() {
        return this.connected && this.stompClient?.connected;
    }
}

export const webSocketService = new WebSocketService();