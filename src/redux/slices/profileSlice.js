import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfileAPI } from '../../api/profile.api';
import { privateChatApi } from '../../api/privateChat.api';
import { groupChatApi } from '../../api/groupChat.api';
import { friendsApi } from '../../api/friends.api';

// Async Thunks
export const fetchUserProfile = createAsyncThunk(
    'profile/fetchUserProfile',
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
    'profile/updateUserProfile',
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
    'profile/updatePassword',
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
    'profile/uploadAvatar',
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
    'profile/deleteAvatar',
    async (_, { rejectWithValue }) => {
        try {
            await ProfileAPI.deleteAvatar();
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete avatar');
        }
    }
);

export const fetchRecentChats = createAsyncThunk(
    'profile/fetchRecentChats',
    async (_, { rejectWithValue }) => {
        try {
            // Получаем оба типа чатов параллельно
            const [privateChatsResponse, groupChatsResponse] = await Promise.all([
                privateChatApi.getPrivateChats(),
                groupChatApi.getGroupChats()
            ]);

            // Преобразуем приватные чаты
            const privateChats = privateChatsResponse.data.map(chat => ({
                id: chat.id,
                type: 'private',
                name: chat.receiverNickname || chat.receiverUsername,
                lastMessage: chat.lastMessage?.message || null,
                lastMessageDate: chat.lastMessage?.sendTime || chat.createdAt,
                participants: {
                    sender: {
                        id: chat.senderId,
                        username: chat.senderUsername,
                        nickname: chat.senderNickname
                    },
                    receiver: {
                        id: chat.receiverId,
                        username: chat.receiverUsername,
                        nickname: chat.receiverNickname
                    }
                },
                unreadCount: chat.unreadCount || 0
            }));

            // Преобразуем групповые чаты
            const groupChats = groupChatsResponse.data.map(chat => ({
                id: chat.id,
                type: 'group',
                name: chat.name,
                description: chat.description,
                lastMessage: chat.lastMessage?.message || null,
                lastMessageDate: chat.lastMessage?.sendTime || chat.createdAt,
                membersCount: chat.members?.length || 0,
                unreadCount: chat.unreadCount || 0
            }));

            // Объединяем и сортируем все чаты
            const allChats = [...privateChats, ...groupChats]
                .sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate))
                .slice(0, 3); // Берем только 3 последних чата

            return allChats;

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent chats');
        }
    }
);

export const fetchTopFriends = createAsyncThunk(
    'profile/fetchTopFriends',
    async (_, { rejectWithValue }) => {
        try {
            const response = await friendsApi.getFriendList();
            // Преобразуем и дополняем данные о друзьях
            const friends = response.data.slice(0, 3).map(friend => ({
                id: friend.id,
                username: friend.username,
                nickname: friend.nickname,
                avatar: friend.avatar,
                online: friend.online || false,
                lastSeen: friend.lastSeen || null
            }));
            return friends;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch top friends');
        }
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

// Slice
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
            update: false,
            password: false,
            delete: false
        },
        error: {
            profile: null,
            chats: null,
            friends: null,
            avatar: null,
            update: null,
            password: null,
            delete: null
        },
        avatarUrl: null,
        updateSuccess: false,
        onlineUsers: {} // Хранение статусов онлайн { userId: boolean }
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
        },
        setUserOnlineStatus: (state, action) => {
            const { userId, isOnline } = action.payload;
            state.onlineUsers[userId] = isOnline;

            // Обновляем статус в списке топ друзей
            const friend = state.topFriends.find(f => f.id === userId);
            if (friend) {
                friend.online = isOnline;
            }
        },
        updateChatLastMessage: (state, action) => {
            const { chatId, message, timestamp } = action.payload;
            const chat = state.recentChats.find(c => c.id === chatId);
            if (chat) {
                chat.lastMessage = message;
                chat.lastMessageDate = timestamp;
                // Пересортируем чаты
                state.recentChats.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
            }
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

            // Recent Chats
            .addCase(fetchRecentChats.pending, (state) => {
                state.loading.chats = true;
                state.error.chats = null;
            })
            .addCase(fetchRecentChats.fulfilled, (state, action) => {
                state.loading.chats = false;
                state.recentChats = action.payload;
            })
            .addCase(fetchRecentChats.rejected, (state, action) => {
                state.loading.chats = false;
                state.error.chats = action.payload;
            })

            // Top Friends
            .addCase(fetchTopFriends.pending, (state) => {
                state.loading.friends = true;
                state.error.friends = null;
            })
            .addCase(fetchTopFriends.fulfilled, (state, action) => {
                state.loading.friends = false;
                state.topFriends = action.payload;
            })
            .addCase(fetchTopFriends.rejected, (state, action) => {
                state.loading.friends = false;
                state.error.friends = action.payload;
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
    clearUpdateSuccess,
    setUserOnlineStatus,
    updateChatLastMessage
} = profileSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.profile.userProfile;
export const selectRecentChats = (state) => state.profile.recentChats;
export const selectTopFriends = (state) => state.profile.topFriends;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectUpdateSuccess = (state) => state.profile.updateSuccess;

export default profileSlice.reducer;