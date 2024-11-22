// friendsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { friendsApi } from '../../api/friends.api';

// Async thunks
export const fetchFriends = createAsyncThunk(
    'friends/fetchFriends',
    async (_, { rejectWithValue }) => {
        try {
            const response = await friendsApi.getFriendList();
            return response.data;
        } catch (error) {
            if (error.message === 'User ID not found in token') {
                return rejectWithValue('Необходима повторная авторизация');
            }
            return rejectWithValue(
                error.response?.data?.message || 'Не удалось загрузить список друзей'
            );
        }
    }
);

export const searchUsers = createAsyncThunk(
    'friends/searchUsers',
    async (query, { rejectWithValue }) => {
        try {
            const response = await friendsApi.searchUsers(query);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Ошибка при поиске пользователей'
            );
        }
    }
);

// Slice
const friendsSlice = createSlice({
    name: 'friends',
    initialState: {
        friendsList: [],
        searchResults: [],
        onlineStatuses: {}, // { userId: { status: "ONLINE" | "OFFLINE", timestamp: number } }
        loading: false,
        error: null,
        wsConnected: false
    },
    reducers: {
        setWsConnected: (state, action) => {
            state.wsConnected = action.payload;
        },
        // Добавление нового друга (через WebSocket)
        addNewFriend: (state, action) => {
            const newFriend = action.payload;
            if (!state.friendsList.some(friend => friend.id === newFriend.id)) {
                state.friendsList.push(newFriend);
                // Инициализируем статус для нового друга
                state.onlineStatuses[newFriend.id] = {
                    status: 'OFFLINE',
                    timestamp: Date.now()
                };
            }
            // Удаляем из результатов поиска, если есть
            state.searchResults = state.searchResults.filter(
                user => user.id !== newFriend.id
            );
        },

        // Удаление друга (через WebSocket)
        removeFriend: (state, action) => {
            // Удаляем друга из списка
            state.friendsList = state.friendsList.filter(
                friend => friend.id !== action.payload
            );
            // Удаляем статус друга
            if (state.onlineStatuses[action.payload]) {
                delete state.onlineStatuses[action.payload];
            }
        },

        // Обновление статуса друга
        updateFriendStatus: (state, action) => {
            const { userId, status } = action.payload;
            if (state.onlineStatuses[userId] ||
                state.friendsList.some(friend => friend.id === userId)) {
                state.onlineStatuses[userId] = {
                    status,
                    timestamp: Date.now()
                };
            }
        },

        // Очистка результатов поиска
        clearSearchResults: (state) => {
            state.searchResults = [];
        },

        // Очистка всех статусов (при отключении WebSocket)
        clearFriendStatuses: (state) => {
            state.onlineStatuses = {};
            state.wsConnected = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Обработка fetchFriends
            .addCase(fetchFriends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.loading = false;
                state.friendsList = action.payload;
                // Инициализируем статусы для всех друзей
                action.payload.forEach(friend => {
                    if (!state.onlineStatuses[friend.id]) {
                        state.onlineStatuses[friend.id] = {
                            status: 'OFFLINE',
                            timestamp: Date.now()
                        };
                    }
                });
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Произошла ошибка при загрузке друзей';
            })

            // Обработка searchUsers
            .addCase(searchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.loading = false;
                // Фильтруем результаты поиска, исключая существующих друзей
                state.searchResults = action.payload.filter(
                    user => !state.friendsList.some(friend => friend.id === user.id)
                );
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Произошла ошибка при поиске пользователей';
                state.searchResults = [];
            });
    }
});

export const {
    setWsConnected,
    addNewFriend,
    removeFriend,
    updateFriendStatus,
    clearSearchResults,
    clearFriendStatuses
} = friendsSlice.actions;

export default friendsSlice.reducer;