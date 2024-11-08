// api/friends.api.js
import axios from './axios';

export const friendsApi = {
    // Получение списка друзей
    getFriends: () =>
        axios.get('/user/friendList'),

    // Поиск пользователей по запросу
    searchUsers: (query) =>
        axios.get(`/user/search?query=${query}`),

    // Добавление друга
    addFriend: (friendId) =>
        axios.post(`/user/addFriend?friendId=${friendId}`),

    // Удаление друга
    deleteFriend: (friendId) =>
        axios.delete(`/user/deleteFriend?friendId=${friendId}`)
};