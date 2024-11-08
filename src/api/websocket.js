import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.connectPromise = null;
    }

    async connect(token) {
        // Если уже есть активное подключение, возвращаем его
        if (this.connected && this.stompClient) {
            return Promise.resolve(this.stompClient);
        }

        // Если уже идет процесс подключения, возвращаем существующий Promise
        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                const socket = new SockJS('http://localhost:8080/ws');
                this.stompClient = Stomp.over(socket);
                this.stompClient.debug = null; // Отключаем логи

                const headers = { Authorization: `Bearer ${token}` };

                this.stompClient.connect(
                    headers,
                    () => {
                        console.log('WebSocket Connected Successfully');
                        this.connected = true;
                        this.connectPromise = null;
                        resolve(this.stompClient);
                    },
                    (error) => {
                        console.error('WebSocket connection error:', error);
                        this.connected = false;
                        this.stompClient = null;
                        this.connectPromise = null;
                        reject(error);
                    }
                );
            } catch (error) {
                this.connectPromise = null;
                reject(error);
            }
        });

        return this.connectPromise;
    }

    async subscribe(destination, callback) {
        try {
            // Убеждаемся, что соединение установлено
            const client = await this.connect();

            // Отписываемся от предыдущей подписки на этот destination, если она есть
            if (this.subscriptions.has(destination)) {
                this.subscriptions.get(destination).unsubscribe();
            }

            const subscription = client.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    callback(payload);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });

            this.subscriptions.set(destination, subscription);
            console.log(`Subscribed to ${destination}`);
            return subscription;

        } catch (error) {
            console.error('Error subscribing to:', destination, error);
            throw error;
        }
    }

    async send(destination, message) {
        try {
            const client = await this.connect();
            client.send(destination, {}, JSON.stringify(message));
            console.log(`Message sent to ${destination}:`, message);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    unsubscribeFromChat() {
        this.subscriptions.forEach((subscription, destination) => {
            if (destination.includes('.message.') || destination.includes('.typing.')) {
                subscription.unsubscribe();
                this.subscriptions.delete(destination);
                console.log(`Unsubscribed from ${destination}`);
            }
        });
    }

    unsubscribe(destination) {
        if (this.subscriptions.has(destination)) {
            this.subscriptions.get(destination).unsubscribe();
            this.subscriptions.delete(destination);
            console.log(`Unsubscribed from ${destination}`);
        }
    }

    disconnect() {
        if (this.stompClient && this.connected) {
            // Сначала отписываемся от всех подписок
            this.subscriptions.forEach(subscription => subscription.unsubscribe());
            this.subscriptions.clear();

            this.stompClient.disconnect(() => {
                console.log('WebSocket Disconnected');
                this.connected = false;
                this.stompClient = null;
            });
        }
    }

    isConnected() {
        return this.connected && this.stompClient?.connected;
    }
}

export const webSocketService = new WebSocketService();