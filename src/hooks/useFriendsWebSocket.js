import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { friendsApi } from '../api/friends.api';
import {
    updateFriendStatus,
    removeFriend,
    addNewFriend,
    clearFriendStatuses
} from '../redux/slices/friendsSlice';

export const useFriendsWebSocket = () => {
    const dispatch = useDispatch();
    const { friendsList } = useSelector(state => state.friends);
    const token = localStorage.getItem('token');

    const handleFriendUpdate = useCallback((update) => {
        switch (update.type) {
            case 'STATUS_CHANGE':
                dispatch(updateFriendStatus({
                    userId: update.userId,
                    status: update.status
                }));
                break;
            case 'FRIEND_ADDED':
                dispatch(addNewFriend(update.friend));
                break;
            case 'FRIEND_REMOVED':
                dispatch(removeFriend(update.friendId));
                break;
            default:
                console.warn('Неизвестный тип обновления:', update.type);
        }
    }, [dispatch]);

    useEffect(() => {
        if (!token) return;

        const setupConnection = async () => {
            try {
                // Устанавливаем WebSocket соединение
                await friendsApi.setupWebSocket(token);

                // Подписываемся на обновления друзей
                await friendsApi.subscribeFriendUpdates(handleFriendUpdate);

            } catch (error) {
                console.error('Ошибка при настройке WebSocket:', error);
            }
        };

        setupConnection();

        // Очистка при размонтировании
        return () => {
            dispatch(clearFriendStatuses());
            friendsApi.unsubscribeFriendUpdates();
            friendsApi.disconnectWebSocket();
        };
    }, [token, handleFriendUpdate, dispatch]);

    return {
        isConnected: friendsApi.isWebSocketConnected(),
        addFriend: friendsApi.addFriend,
        deleteFriend: friendsApi.deleteFriend
    };
};

export default useFriendsWebSocket;