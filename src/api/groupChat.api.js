// api/groupChat.api.js
import apiClient from './axios';
import { webSocketService } from './websocket';

export const groupChatApi = {
    // REST API методы
    getGroupChats: () =>
        apiClient.get('/group-chat'),

    getGroupChat: (chatId) =>
        apiClient.get(`/group-chat/${chatId}`),

    createGroupChat: (data) =>
        apiClient.post('/group-chat/create', data),

    getChatMembers: (chatId) =>
        apiClient.get(`/group-chat/${chatId}/members`),

    getChatMessages: (chatId) =>
        apiClient.get(`/group-message/${chatId}`),

    editDescription: (chatId, newDesc) =>
        apiClient.patch(`/group-chat/${chatId}/edit-description`, null, {
            params: { newDesc }
        }),

    editName: (chatId, newName) =>
        apiClient.patch(`/group-chat/${chatId}/edit-name`, null, {
            params: { newName }
        }),

    addUser: (chatId, userId) =>
        apiClient.patch(`/group-chat/${chatId}/add-user`, null, {
            params: { userId }
        }),

    deleteUser: (chatId, userId) =>
        apiClient.delete(`/group-chat/${chatId}/delete-user`, {
            params: { userId },
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }),

    changeRole: (chatId, memberId, role) =>
        apiClient.patch(`/group-chat/${chatId}/change-role/${memberId}`, null, {
            params: { role },
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }),

    leaveChat: (chatId) =>
        apiClient.delete(`/group-chat/${chatId}/leave`),

    // Методы для WebSocket
    enterChat: async (chatId) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/group.enter', { groupChatId: chatId });
    },

    sendMessage: async (chatId, message) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/group.send', {
            chatId,
            message
        });
    },

    deleteMessage: async (messageId) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/group.delete', {
            messageId
        });
    },

    editMessage: async (messageId, editedMessage) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/group.edit', {
            messageId,
            editedMessage
        });
    },

    // Методы для файлов
    sendFile: (chatId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(`/group-file/${chatId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getFiles: (chatId) =>
        apiClient.get(`/group-file/${chatId}`),

    deleteFile: (fileId) =>
        apiClient.delete(`/group-file/${fileId}`)
};