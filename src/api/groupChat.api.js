// api/privateChat.api.js
import apiClient from './axios';
import {store} from "../redux/store";

export const groupChatApi = {
    getGroupChats: () =>
        apiClient.get('/group-chat'),

    getChatMessages: (chatId) =>
        apiClient.get(`/group-message/${chatId}`),

    sendMessage: (chatId, message) =>
        apiClient.post(`/group-message/${chatId}`, null, {
            params: { message }
        }),

    deleteMessage: (messageId) =>
        apiClient.delete(`/group-message/${messageId}`),

    editMessage: (messageId, editedMessage) =>
        apiClient.patch(`/group-message/${messageId}`, null, {
            params: { editedMessage }
        }),

    sendFile: (chatId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post(`/group-file/${chatId}`, formData, {
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
        apiClient.get(`/group-message/${chatId}/search`, {
            params: { query }
        }),

    getFiles: (chatId) =>
        apiClient.get(`/group-file/${chatId}`),

    deleteFile: (fileId) =>
        apiClient.delete(`/group-file/${fileId}`)
};