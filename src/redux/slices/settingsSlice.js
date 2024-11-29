// settingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfileAPI } from '../../api/profile.api';

// Async Thunks
export const fetchUserProfile = createAsyncThunk(
    'settings/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ProfileAPI.getCurrentUserProfile();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'settings/updateUserProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await ProfileAPI.updateProfile(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

export const updateUserPassword = createAsyncThunk(
    'settings/updatePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await ProfileAPI.updatePassword(passwordData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update password');
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'settings/uploadAvatar',
    async (file, { rejectWithValue }) => {
        try {
            const response = await ProfileAPI.uploadAvatar(file);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
        }
    }
);

export const deleteAvatar = createAsyncThunk(
    'settings/deleteAvatar',
    async (_, { rejectWithValue }) => {
        try {
            await ProfileAPI.deleteAvatar();
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete avatar');
        }
    }
);

export const deleteProfile = createAsyncThunk(
    'settings/deleteProfile',
    async (_, { rejectWithValue }) => {
        try {
            await ProfileAPI.deleteUserProfile();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete profile');
        }
    }
);

// Slice
const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        userProfile: null,
        avatarUrl: null,
        loading: {
            profile: false,
            avatar: false,
            update: false,
            password: false,
            delete: false
        },
        error: {
            profile: null,
            avatar: null,
            update: null,
            password: null,
            delete: null
        },
        updateSuccess: false
    },
    reducers: {
        clearError: (state, action) => {
            if (action.payload) {
                state.error[action.payload] = null;
            } else {
                Object.keys(state.error).forEach(key => {
                    state.error[key] = null;
                });
            }
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
                state.error.profile = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading.profile = false;
                state.userProfile = action.payload;
                state.avatarUrl = action.payload.avatar;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading.profile = false;
                state.error.profile = action.payload;
            })

            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading.update = true;
                state.error.update = null;
                state.updateSuccess = false;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading.update = false;
                state.userProfile = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading.update = false;
                state.error.update = action.payload;
                state.updateSuccess = false;
            })

            // Upload Avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.loading.avatar = true;
                state.error.avatar = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.loading.avatar = false;
                state.avatarUrl = action.payload;
                if (state.userProfile) {
                    state.userProfile.avatar = action.payload;
                }
                state.updateSuccess = true;
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading.avatar = false;
                state.error.avatar = action.payload;
            })

            // Delete Avatar
            .addCase(deleteAvatar.pending, (state) => {
                state.loading.avatar = true;
                state.error.avatar = null;
            })
            .addCase(deleteAvatar.fulfilled, (state) => {
                state.loading.avatar = false;
                state.avatarUrl = null;
                if (state.userProfile) {
                    state.userProfile.avatar = null;
                }
                state.updateSuccess = true;
            })
            .addCase(deleteAvatar.rejected, (state, action) => {
                state.loading.avatar = false;
                state.error.avatar = action.payload;
            })

            // Update Password
            .addCase(updateUserPassword.pending, (state) => {
                state.loading.password = true;
                state.error.password = null;
                state.updateSuccess = false;
            })
            .addCase(updateUserPassword.fulfilled, (state) => {
                state.loading.password = false;
                state.updateSuccess = true;
            })
            .addCase(updateUserPassword.rejected, (state, action) => {
                state.loading.password = false;
                state.error.password = action.payload;
                state.updateSuccess = false;
            })

            // Delete Profile
            .addCase(deleteProfile.pending, (state) => {
                state.loading.delete = true;
                state.error.delete = null;
            })
            .addCase(deleteProfile.fulfilled, (state) => {
                state.loading.delete = false;
                state.userProfile = null;
            })
            .addCase(deleteProfile.rejected, (state, action) => {
                state.loading.delete = false;
                state.error.delete = action.payload;
            });
    }
});

// Actions
export const {
    clearError,
    clearUpdateSuccess
} = settingsSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.settings.userProfile;
export const selectAvatarUrl = (state) => state.settings.avatarUrl;
export const selectLoading = (state) => state.settings.loading;
export const selectError = (state) => state.settings.error;
export const selectUpdateSuccess = (state) => state.settings.updateSuccess;

export default settingsSlice.reducer;