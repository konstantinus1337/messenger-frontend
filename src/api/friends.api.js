// friends.api.js
import apiClient from './axios';
import { webSocketService } from './websocket';
import { getUserIdFromToken } from '../utils/jwtUtils';

export const friendsApi = {
    // REST API методы
    getFriendList: () => {
        const userId = getUserIdFromToken();
        if (!userId) {
            return Promise.reject(new Error('User ID not found in token'));
        }
        return apiClient.get(`/friends/${userId}`);
    },

    // Поиск пользователей (через UserProfileController)
    searchUsers: (query) =>
        apiClient.get(`/user/search`, {
            params: { query }
        }),

    // WebSocket методы
    addFriend: async (friendId) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }

        await webSocketService.send('/friend.add', {
            friendId: friendId
        });
    },

    deleteFriend: async (friendId) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }

        await webSocketService.send('/friend.delete', {
            friendId: friendId
        });
    },

    // Подписка на обновления списка друзей
    subscribeFriendUpdates: async (callback) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }

        try {
            await webSocketService.subscribe('/topic/friends.updates', (message) => {
                callback(message);
            });
        } catch (error) {
            console.error('Ошибка при подписке на обновления друзей:', error);
            throw error;
        }
    },

    // Отписка от обновлений
    unsubscribeFriendUpdates: () => {
        webSocketService.unsubscribe('/topic/friends.updates');
    },

    // Настройка WebSocket соединения
    setupWebSocket: async (token) => {
        try {
            await webSocketService.connect(token);
        } catch (error) {
            console.error('Ошибка при подключении WebSocket:', error);
            throw error;
        }
    },

    disconnectWebSocket: () => {
        webSocketService.disconnect();
    },

    isWebSocketConnected: () => {
        return webSocketService.isConnected();
    }
};
