// redux/slices/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfileAPI } from '../../api/profile.api';

export const fetchUserProfile = createAsyncThunk(
    'profile/fetchUserProfile',
    async () => {
        const response = await ProfileAPI.getCurrentUserProfile();
        return response.data;
    }
);

export const updateUserProfile = createAsyncThunk(
    'profile/updateUserProfile',
    async (userData) => {
        const response = await ProfileAPI.updateProfile(userData);
        return response.data;
    }
);

export const updateUserPassword = createAsyncThunk(
    'profile/updatePassword',
    async (passwordData) => {
        const response = await ProfileAPI.updatePassword(passwordData);
        return response.data;
    }
);

export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async (file) => {
        const response = await ProfileAPI.uploadAvatar(file);
        return response.data;
    }
);

export const deleteAvatar = createAsyncThunk(
    'profile/deleteAvatar',
    async () => {
        await ProfileAPI.deleteAvatar();
        return null;
    }
);

export const fetchRecentChats = createAsyncThunk(
    'profile/fetchRecentChats',
    async () => {
        const privateChats = await ProfileAPI.getPrivateChats();
        const groupChats = await ProfileAPI.getGroupChats();

        const allChats = [...privateChats.data, ...groupChats.data]
            .sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate))
            .slice(0, 3);

        return allChats;
    }
);

export const fetchTopFriends = createAsyncThunk(
    'profile/fetchTopFriends',
    async () => {
        const response = await ProfileAPI.getFriendList();
        return response.data.slice(0, 3);
    }
);
export const deleteProfile = createAsyncThunk(
    'profile/deleteProfile',
    async (_, { rejectWithValue }) => {
        try {
            await ProfileAPI.deleteUserProfile();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete profile');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        userProfile: null,
        recentChats: [],
        topFriends: [],
        loading: {
            profile: false,
            chats: false,
            friends: false,
            avatar: false,
            update: false
        },
        error: null,
        avatarUrl: null,
        updateSuccess: false
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearUpdateSuccess: (state) => {
            state.updateSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading.profile = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading.profile = false;
                state.userProfile = action.payload;
                state.avatarUrl = action.payload.avatar;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading.profile = false;
                state.error = action.error.message;
            })

            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading.update = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading.update = false;
                state.userProfile = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading.update = false;
                state.error = action.error.message;
                state.updateSuccess = false;
            })

            // Upload Avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.loading.avatar = true;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.loading.avatar = false;
                state.avatarUrl = action.payload;
                state.updateSuccess = true;
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading.avatar = false;
                state.error = action.error.message;
            })

            // Delete Avatar
            .addCase(deleteAvatar.pending, (state) => {
                state.loading.avatar = true;
                state.error = null;
            })
            .addCase(deleteAvatar.fulfilled, (state) => {
                state.loading.avatar = false;
                state.avatarUrl = null;
                state.updateSuccess = true;
            })
            .addCase(deleteAvatar.rejected, (state, action) => {
                state.loading.avatar = false;
                state.error = action.error.message;
            })

            // Recent Chats
            .addCase(fetchRecentChats.pending, (state) => {
                state.loading.chats = true;
            })
            .addCase(fetchRecentChats.fulfilled, (state, action) => {
                state.loading.chats = false;
                state.recentChats = action.payload;
            })
            .addCase(fetchRecentChats.rejected, (state, action) => {
                state.loading.chats = false;
                state.error = action.error.message;
            })

            // Top Friends
            .addCase(fetchTopFriends.pending, (state) => {
                state.loading.friends = true;
            })
            .addCase(fetchTopFriends.fulfilled, (state, action) => {
                state.loading.friends = false;
                state.topFriends = action.payload;
            })
            .addCase(fetchTopFriends.rejected, (state, action) => {
                state.loading.friends = false;
                state.error = action.error.message;
            })
            .addCase(updateUserPassword.pending, (state) => {
                state.loading.password = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateUserPassword.fulfilled, (state) => {
                state.loading.password = false;
                state.updateSuccess = true;
            })
            .addCase(updateUserPassword.rejected, (state, action) => {
                state.loading.password = false;
                state.error = action.error.message;
                state.updateSuccess = false;
            })
            .addCase(deleteProfile.pending, (state) => {
                state.loading.delete = true;
                state.error = null;
            })
            .addCase(deleteProfile.fulfilled, (state) => {
                state.loading.delete = false;
                state.userProfile = null;
            })
            .addCase(deleteProfile.rejected, (state, action) => {
                state.loading.delete = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearUpdateSuccess } = profileSlice.actions;
export default profileSlice.reducer;