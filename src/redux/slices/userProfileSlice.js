// slices/userProfileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfileAPI } from '../../api/profile.api';
import { friendsApi } from '../../api/friends.api';

// Асинхронное действие для загрузки профиля пользователя
export const fetchUserProfile = createAsyncThunk(
    'userProfile/fetchUserProfile',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await ProfileAPI.getAnyUserProfile(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
        }
    }
);

// Асинхронное действие для загрузки друзей пользователя
export const fetchUserFriends = createAsyncThunk(
    'userProfile/fetchUserFriends',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await friendsApi.getUserFriends(userId);
            if (!response || !response.data || !Array.isArray(response.data)) {
                return [];
            }

            // Преобразуем и дополняем данные о друзьях
            const friends = response.data.map(friend => ({
                id: friend.id,
                username: friend.username,
                nickname: friend.nickname,
                avatar: friend.avatar,
                status: friend.status,
                lastSeen: friend.lastSeen || null
            }));
            return friends;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user friends');
        }
    }
);

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState: {
        profile: null,
        friends: [],
        loading: {
            profile: false,
            friends: false
        },
        error: {
            profile: null,
            friends: null
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading.profile = true;
                state.error.profile = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading.profile = false;
                state.profile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading.profile = false;
                state.error.profile = action.payload;
            })
            .addCase(fetchUserFriends.pending, (state) => {
                state.loading.friends = true;
                state.error.friends = null;
            })
            .addCase(fetchUserFriends.fulfilled, (state, action) => {
                state.loading.friends = false;
                state.friends = action.payload;
            })
            .addCase(fetchUserFriends.rejected, (state, action) => {
                state.loading.friends = false;
                state.error.friends = action.payload;
            });
    }
});

export default userProfileSlice.reducer;