import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { friendsApi } from '../api/friends.api';
import {
    updateFriendStatus,
    removeFriend,
    addNewFriend,
    clearFriendStatuses,
    setWsConnected
} from '../redux/slices/friendsSlice';

export const useFriendsWebSocket = () => {
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');

    const handleFriendUpdate = useCallback((update) => {
        try {
            switch (update.type) {
                case 'STATUS_CHANGE':
                    dispatch(updateFriendStatus({
                        userId: update.userId,
                        status: update.status
                    }));
                    break;
                case 'FRIEND_REMOVED':
                    dispatch(removeFriend(update.friendId));
                    break;
                case 'FRIEND_ADDED':
                    dispatch(addNewFriend(update.friend));
                    break;
                default:
                    console.warn('Неизвестный тип обновления:', update.type);
            }
        } catch (error) {
            console.error('Error handling friend update:', error);
        }
    }, [dispatch]);

    useEffect(() => {
        if (!token) return;

        let isSubscribed = true;

        const setupConnection = async () => {
            try {
                await friendsApi.subscribeFriendUpdates((message) => {
                    if (isSubscribed) {
                        handleFriendUpdate(message);
                    }
                });
                dispatch(setWsConnected(true));
            } catch (error) {
                console.error('Ошибка при настройке WebSocket:', error);
                dispatch(setWsConnected(false));
            }
        };

        setupConnection();

        return () => {
            isSubscribed = false;
            dispatch(clearFriendStatuses());
            dispatch(setWsConnected(false));
            friendsApi.unsubscribeFriendUpdates();
        };
    }, [token, handleFriendUpdate, dispatch]);

    // Функции для работы с друзьями через WebSocket
    const addFriend = async (friendId) => {
        try {
            await friendsApi.addFriend(friendId);
        } catch (error) {
            console.error('Error adding friend:', error);
            throw error;
        }
    };

    const deleteFriend = async (friendId) => {
        try {
            await friendsApi.deleteFriend(friendId);
        } catch (error) {
            console.error('Error deleting friend:', error);
            throw error;
        }
    };

    return {
        addFriend,
        deleteFriend
    };
};

export default useFriendsWebSocket;