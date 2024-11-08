import apiClient from './axios';
import {store} from "../redux/store";

export const privateChatApi = {
    getPrivateChats: () =>
        apiClient.get('/private-chat'),

    getChatMessages: (chatId) =>
        apiClient.get(`/private-message/${chatId}`),

    getChatMembers: (chatId) =>
        apiClient.get(`/private-chat/${chatId}/members`),

    sendMessage: (chatId, message) =>
        apiClient.post(`/private-message/${chatId}`, null, {
            params: { message }
        }),

    deleteMessage: (messageId) =>
        apiClient.delete(`/private-message/${messageId}`),

    editMessage: (messageId, editedMessage) =>
        apiClient.patch(`/private-message/${messageId}`, null, {
            params: { editedMessage }
        }),

    sendFile: (chatId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post(`/private-file/${chatId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                // Dispatch action to update progress
                store.dispatch({
                    type: 'chats/updateFileUploadProgress',
                    payload: percentCompleted
                });
            }
        });
    },

    searchMessages: (chatId, query) =>
        apiClient.get(`/private-message/${chatId}/search`, {
            params: { query }
        }),

    getFiles: (chatId) =>
        apiClient.get(`/private-file/${chatId}`),

    deleteFile: (fileId) =>
        apiClient.delete(`/private-file/${fileId}`)
};