// api/profile.api.js
import apiClient from './axios';

export const ProfileAPI = {
    // Получение профиля пользователя
    getUserProfile: (userId) =>
        apiClient.get(`/user/profile`),

    // Обновление профиля
    updateProfile: (userData) =>
        apiClient.patch('/user/update', userData),

    // Загрузка аватара
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updatePassword: async (passwordData) => {
        return await apiClient.post('/user/updatePassword', {
            password: passwordData.newPassword
        });
    },



    // Удаление аватара
    deleteAvatar: () =>
        apiClient.delete('/user/avatar'),

    getUserAvatar: async () => {
        try {
            const response = await apiClient.get('/user/avatar');
            return response.data;
        } catch (error) {
            console.error('Error fetching user avatar:', error);
            return null;
        }
    },

    // Получение аватара любого пользователя по ID
    getAnyUserAvatar: async (userId) => {
        try {
            const response = await apiClient.get(`/user/${userId}/avatar`);
            return response.data;
        } catch (error) {
            console.error('Error fetching any user avatar:', error);
            return null;
        }
    },

    // Кеш для URL аватаров
    avatarCache: new Map(),

    // Метод для получения URL аватара с кешированием
    getCachedAvatarUrl: async (userId, isCurrentUser = false) => {
        const cacheKey = isCurrentUser ? 'currentUser' : userId;

        if (ProfileAPI.avatarCache.has(cacheKey)) {
            return ProfileAPI.avatarCache.get(cacheKey);
        }

        try {
            const avatarUrl = isCurrentUser
                ? await ProfileAPI.getUserAvatar()
                : await ProfileAPI.getAnyUserAvatar(userId);

            if (avatarUrl) {
                ProfileAPI.avatarCache.set(cacheKey, avatarUrl);
            }
            return avatarUrl;
        } catch (error) {
            console.error('Error fetching cached avatar URL:', error);
            return null;
        }
    },

    // Очистка кеша для конкретного пользователя
    clearAvatarCache: (userId) => {
        ProfileAPI.avatarCache.delete(userId);
    },

    // Очистка всего кеша аватаров
    clearAllAvatarCache: () => {
        ProfileAPI.avatarCache.clear();
    }
};