import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webSocketService } from '../api/websocket';
import { updateFriendStatus, clearFriendStatuses, fetchFriends } from '../redux/slices/friendsSlice';

export const useFriendsWebSocket = () => {
    const dispatch = useDispatch();
    const { friendsList } = useSelector(state => state.friends);
    const token = localStorage.getItem('token');

    const handleStatusUpdate = useCallback((statusUpdate) => {
        const { userId, status } = statusUpdate;
        // Проверяем, является ли пользователь нашим другом
        if (friendsList.some(friend => friend.id === userId)) {
            console.log('Updating friend status:', userId, status);
            dispatch(updateFriendStatus({ userId, status }));
        }
    }, [friendsList, dispatch]);

    useEffect(() => {
        if (!token) return;

        const setupWebSocket = async () => {
            try {
                // Сначала подключаемся
                await webSocketService.connect(token);

                // После успешного подключения подписываемся на обновления статусов
                await webSocketService.subscribe('/user.status', handleStatusUpdate);

                // Запрашиваем актуальный список друзей
                dispatch(fetchFriends());
            } catch (error) {
                console.error('Error setting up WebSocket:', error);
            }
        };

        setupWebSocket();

        return () => {
            dispatch(clearFriendStatuses());
            webSocketService.disconnect();
        };
    }, [token, handleStatusUpdate, dispatch]);
};

export default useFriendsWebSocket;