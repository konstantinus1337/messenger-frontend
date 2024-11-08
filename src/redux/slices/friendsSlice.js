// redux/slices/friendsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { friendsApi } from '../../api/friends.api';

export const fetchFriends = createAsyncThunk(
    'friends/fetchFriends',
    async () => {
        const response = await friendsApi.getFriends();
        return response.data;
    }
);

export const searchUsers = createAsyncThunk(
    'friends/searchUsers',
    async (query) => {
        const response = await friendsApi.searchUsers(query);
        return response.data;
    }
);

export const addFriend = createAsyncThunk(
    'friends/addFriend',
    async (friendId) => {
        await friendsApi.addFriend(friendId);
        // Получаем информацию о новом друге
        const response = await friendsApi.getUserProfile(friendId);
        return response.data;
    }
);

export const deleteFriend = createAsyncThunk(
    'friends/deleteFriend',
    async (friendId) => {
        await friendsApi.deleteFriend(friendId);
        return friendId;
    }
);

const friendsSlice = createSlice({
    name: 'friends',
    initialState: {
        friendsList: [],
        searchResults: [],
        onlineStatuses: {}, // { userId: "ONLINE" | "OFFLINE" }
        loading: false,
        error: null,
    },
    reducers: {
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        updateFriendStatus: (state, action) => {
            const { userId, status } = action.payload;
            // Обновляем статус и добавляем временную метку
            state.onlineStatuses[userId] = {
                status,
                timestamp: Date.now()
            };
            console.log('Status updated in Redux:', userId, status);
        },
        clearFriendStatuses: (state) => {
            state.onlineStatuses = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.friendsList = action.payload;
                // Инициализируем статусы для новых друзей
                action.payload.forEach(friend => {
                    if (!state.onlineStatuses[friend.id]) {
                        state.onlineStatuses[friend.id] = {
                            status: 'OFFLINE',
                            timestamp: Date.now()
                        };
                    }
                });
                state.loading = false;
            })
            .addCase(fetchFriends.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchResults = action.payload;
            })
            .addCase(addFriend.fulfilled, (state, action) => {
                state.friendsList.push(action.payload);
                state.searchResults = state.searchResults.filter(
                    user => user.id !== action.payload.id
                );
            })
            .addCase(deleteFriend.fulfilled, (state, action) => {
                state.friendsList = state.friendsList.filter(
                    friend => friend.id !== action.payload
                );
                delete state.onlineStatuses[action.payload];
            });
    }
});

export const {
    clearSearchResults,
    updateFriendStatus,
    clearFriendStatuses
} = friendsSlice.actions;

export default friendsSlice.reducer;