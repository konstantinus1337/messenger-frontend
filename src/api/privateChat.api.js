// api/privateChat.api.js
import apiClient from './axios';
import { webSocketService } from './websocket';

export const privateChatApi = {
    // REST API методы
    getPrivateChats: () =>
        apiClient.get('/private-chat'),

    getPrivateChat: (chatId) =>
        apiClient.get(`/private-chat/${chatId}`),

    createPrivateChat: (receiverId) =>
        apiClient.post('/private-chat/create', { receiverId }),

    getChatMembers: (chatId) =>
        apiClient.get(`/private-chat/${chatId}/members`),

    getChatMessages: (chatId) =>
        apiClient.get(`/private-message/${chatId}`),

    // Методы для WebSocket
    enterChat: async (chatId) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/private.enter', { privateChatId: chatId });
    },

    sendMessage: async (chatId, message) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/privateMessage.send', {
            chatId,
            message
        });
    },

    deleteMessage: async (messageId) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/privateMessage.delete', {
            messageId
        });
    },

    editMessage: async (messageId, editedMessage) => {
        if (!webSocketService.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        await webSocketService.send('/privateMessage.edit', {
            messageId,
            editedMessage
        });
    },

    // Методы для файлов
    sendFile: (chatId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(`/private-file/${chatId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getFiles: (chatId) =>
        apiClient.get(`/private-file/${chatId}`),

    deleteFile: (fileId) =>
        apiClient.delete(`/private-file/${fileId}`)
};