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

    // Поиск пользователей
    searchUsers: (query) =>
        apiClient.get(`/user/search`, {
            params: { query }
        }),

    // WebSocket методы
    deleteFriend: async (friendId) => {
        try {
            if (!webSocketService.isConnected()) {
                await webSocketService.connect(localStorage.getItem('token'));
            }
            // Убедимся, что friendId передается как число
            await webSocketService.send('/app/friend.delete', {
                friendId: parseInt(friendId, 10)
            });
        } catch (error) {
            console.error('Failed to delete friend:', error);
            throw error;
        }
    },

    addFriend: async (friendId) => {
        try {
            if (!webSocketService.isConnected()) {
                await webSocketService.connect(localStorage.getItem('token'));
            }
            await webSocketService.send('/friend.add', {
                friendId: friendId
            });
        } catch (error) {
            console.error('Failed to add friend:', error);
            throw error;
        }
    },

    // Подписка на обновления списка друзей
    subscribeFriendUpdates: async (callback) => {
        try {
            if (!webSocketService.isConnected()) {
                await webSocketService.connect(localStorage.getItem('token'));
            }
            await webSocketService.subscribe('/topic/friends.updates', (message) => {
                callback(message);
            });
        } catch (error) {
            console.error('Ошибка при подписке на обновления друзей:', error);
            throw error;
        }
    },

    unsubscribeFriendUpdates: () => {
        webSocketService.unsubscribe('/topic/friends.updates');
    },
};