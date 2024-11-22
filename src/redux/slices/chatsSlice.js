// redux/slices/chatsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { privateChatApi } from '../../api/privateChat.api';
import { groupChatApi } from '../../api/groupChat.api';

// Async actions
export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async () => {
        const [privateChats, groupChats] = await Promise.all([
            privateChatApi.getPrivateChats(),
            groupChatApi.getGroupChats()
        ]);

        // Transform private chats to common format
        const transformedPrivateChats = privateChats.data.map(chat => ({
            id: chat.id,
            type: 'private',
            name: chat.receiverNickname || chat.receiverUsername,
            username: chat.receiverUsername,
            nickname: chat.receiverNickname,
            avatar: null,
            lastMessage: null,
            lastMessageDate: chat.createdAt,
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
            }
        }));

        const transformedGroupChats = groupChats.data.map(chat => ({
            id: chat.id,
            type: 'group',
            name: chat.name,
            description: chat.description,
            avatar: null,
            lastMessage: null,
            lastMessageDate: chat.createdAt,
            members: chat.members.map(member => ({
                id: member.memberId,
                username: member.username,
                nickname: member.nickname,
                role: member.role
            }))
        }));

        return {
            privateChats: transformedPrivateChats,
            groupChats: transformedGroupChats
        };
    }
);

export const fetchChatMessages = createAsyncThunk(
    'chats/fetchChatMessages',
    async ({ chatId, chatType }) => {
        const api = chatType === 'private' ? privateChatApi : groupChatApi;
        const response = await api.getChatMessages(chatId);

        const transformedMessages = response.data.map(message => ({
            id: message.id,
            chatId: message.chatId,
            type: chatType,
            text: message.message,
            timestamp: message.sendTime,
            edited: message.edited || false,
            sender: {
                id: message.senderId,
                username: message.senderUsername,
                nickname: message.senderNickname
            },
            read: message.read || false,
            files: message.files || []
        }));

        return {
            chatId,
            messages: transformedMessages
        };
    }
);

const chatsSlice = createSlice({
    name: 'chats',
    initialState: {
        chats: {
            private: [],
            group: [],
        },
        activeChat: {
            id: null,
            type: null,
            messages: [],
            typing: {}, // { userId: timestamp }
            loadingMore: false,
            hasMore: true,
            page: 1
        },
        wsConnected: false,
        messageSearch: {
            isOpen: false,
            query: '',
            results: [],
            currentIndex: -1,
            loading: false
        },
        loading: {
            chats: false,
            messages: false,
            sending: false,
            files: false
        },
        chatSearch: {
            query: '',
            results: [],
            isSearching: false
        },
        unreadMessages: {}, // { chatId: count }
        error: null,
        filter: 'all', // 'all' | 'private' | 'group'
        rightPanelOpen: false,
        uploadProgress: {} // { fileId: progress }
    },
    reducers: {
        setWsConnected: (state, action) => {
            state.wsConnected = action.payload;
        },

        setActiveChat: (state, action) => {
            const { id, type } = action.payload;
            state.activeChat = {
                ...state.activeChat,
                id,
                type,
                messages: [],
                typing: {},
                page: 1,
                hasMore: true
            };
            // Clear unread messages for this chat
            if (state.unreadMessages[id]) {
                delete state.unreadMessages[id];
            }
        },

        clearActiveChat: (state) => {
            state.activeChat = {
                id: null,
                type: null,
                messages: [],
                typing: {},
                loadingMore: false,
                hasMore: true,
                page: 1
            };
        },

        messageReceived: (state, action) => {
            const { message } = action.payload;

            // Проверяем, относится ли сообщение к активному чату
            if (state.activeChat.id === message.chatId) {
                // Добавляем сообщение в список, если его там еще нет
                const messageExists = state.activeChat.messages.some(m => m.id === message.id);
                if (!messageExists) {
                    state.activeChat.messages.push(message);
                }
            }

            // Обновляем последнее сообщение в списке чатов
            const chatType = state.activeChat.type;
            const chatList = state.chats[chatType];
            const chat = chatList?.find(c => c.id === message.chatId);
            if (chat) {
                chat.lastMessage = message.text;
                chat.lastMessageDate = message.timestamp;
            }
        },

        messageRead: (state, action) => {
            const { messageId, chatId } = action.payload;

            // Update message status in active chat
            if (state.activeChat.id === chatId) {
                const message = state.activeChat.messages.find(m => m.id === messageId);
                if (message) {
                    message.read = true;
                }
            }
        },

        messageDeleted: (state, action) => {
            const { messageId, chatId } = action.payload;

            // Remove message from active chat
            if (state.activeChat.id === chatId) {
                state.activeChat.messages = state.activeChat.messages.filter(
                    m => m.id !== messageId
                );
            }

            // Update last message in chat list if needed
            const chatType = state.activeChat.type;
            if (chatType) {
                const chat = state.chats[chatType].find(c => c.id === chatId);
                if (chat && chat.lastMessage?.id === messageId) {
                    const lastMessage = state.activeChat.messages[state.activeChat.messages.length - 1];
                    chat.lastMessage = lastMessage ? lastMessage.text : null;
                    chat.lastMessageDate = lastMessage ? lastMessage.timestamp : chat.lastMessageDate;
                }
            }
        },

        messageEdited: (state, action) => {
            const { messageId, chatId, text } = action.payload;

            // Update message in active chat
            if (state.activeChat.id === chatId) {
                const message = state.activeChat.messages.find(m => m.id === messageId);
                if (message) {
                    message.text = text;
                    message.edited = true;
                }
            }

            // Update last message in chat list if needed
            const chatType = state.activeChat.type;
            if (chatType) {
                const chat = state.chats[chatType].find(c => c.id === chatId);
                if (chat && chat.lastMessage?.id === messageId) {
                    chat.lastMessage = text;
                }
            }
        },

        typingStatusChanged: (state, action) => {
            const { chatId, userId, isTyping } = action.payload;

            if (state.activeChat.id === chatId) {
                if (isTyping) {
                    state.activeChat.typing[userId] = Date.now();
                } else {
                    delete state.activeChat.typing[userId];
                }
            }
        },

        fileUploadProgressChanged: (state, action) => {
            const { fileId, progress } = action.payload;
            state.uploadProgress[fileId] = progress;

            // Clean up completed uploads
            if (progress === 100) {
                setTimeout(() => {
                    delete state.uploadProgress[fileId];
                }, 1000);
            }
        },

        toggleMessageSearch: (state) => {
            state.messageSearch.isOpen = !state.messageSearch.isOpen;
            if (!state.messageSearch.isOpen) {
                state.messageSearch.query = '';
                state.messageSearch.results = [];
                state.messageSearch.currentIndex = -1;
            }
        },
        setMessageSearchQuery: (state, action) => {
            state.messageSearch.query = action.payload;
        },
        setMessageSearchResults: (state, action) => {
            state.messageSearch.results = action.payload;
            state.messageSearch.currentIndex = action.payload.length > 0 ? 0 : -1;
        },

        navigateMessageSearchResults: (state, action) => {
            const direction = action.payload;
            const { results, currentIndex } = state.messageSearch;

            if (results.length === 0) return;

            if (direction === 'next') {
                state.messageSearch.currentIndex =
                    currentIndex + 1 >= results.length ? 0 : currentIndex + 1;
            } else {
                state.messageSearch.currentIndex =
                    currentIndex - 1 < 0 ? results.length - 1 : currentIndex - 1;
            }
        },

        toggleRightPanel: (state) => {
            state.rightPanelOpen = !state.rightPanelOpen;
        },

        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        setChatSearchQuery: (state, action) => {
            state.chatSearch.query = action.payload;
            if (!action.payload.trim()) {
                state.chatSearch.results = [];
            }
        },
        setChatSearchResults: (state, action) => {
            state.chatSearch.results = action.payload;
        },
        setChatSearching: (state, action) => {
            state.chatSearch.isSearching = action.payload;
        },
        clearChatSearch: (state) => {
            state.chatSearch.query = '';
            state.chatSearch.results = [];
            state.chatSearch.isSearching = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Chats
            .addCase(fetchChats.pending, (state) => {
                state.loading.chats = true;
                state.error = null;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.loading.chats = false;
                state.chats.private = action.payload.privateChats;
                state.chats.group = action.payload.groupChats;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading.chats = false;
                state.error = action.error.message;
            })

            // Fetch Messages
            .addCase(fetchChatMessages.pending, (state) => {
                state.loading.messages = true;
                state.error = null;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                state.loading.messages = false;
                if (state.activeChat.id === action.payload.chatId) {
                    state.activeChat.messages = action.payload.messages;
                }
            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.loading.messages = false;
                state.error = action.error.message;
            });
    }
});

export const {
    setWsConnected,
    setActiveChat,
    clearActiveChat,
    messageReceived,
    messageRead,
    messageDeleted,
    messageEdited,
    typingStatusChanged,
    fileUploadProgressChanged,
    toggleMessageSearch,
    setMessageSearchQuery,
    setMessageSearchResults,
    navigateMessageSearchResults,
    toggleRightPanel,
    setFilter,
    setChatSearchQuery,
    setChatSearchResults,
    setChatSearching,
    clearChatSearch
} = chatsSlice.actions;

export default chatsSlice.reducer;