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
            avatar: null, // Add if available from API
            lastMessage: null, // Add if available from API
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

        // Transform group chats to common format
        const transformedGroupChats = groupChats.data.map(chat => ({
            id: chat.id,
            type: 'group',
            name: chat.name,
            description: chat.description,
            avatar: null, // Add if available from API
            lastMessage: null, // Add if available from API
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

        // Transform messages to common format
        const transformedMessages = response.data.map(message => ({
            id: message.id,
            chatId: chatType === 'private' ? message.privateChatId : message.groupChatId,
            type: chatType,
            text: message.message,
            timestamp: message.sendTime,
            sender: {
                id: message.senderId,
                username: message.senderUsername,
                nickname: message.senderNickname
            },
            receiver: chatType === 'private' ? {
                username: message.receiverUsername,
                nickname: message.receiverNickname
            } : null
        }));

        return {
            chatId,
            messages: transformedMessages
        };
    }
);

export const sendMessage = createAsyncThunk(
    'chats/sendMessage',
    async ({ chatId, chatType, message }) => {
        const api = chatType === 'private' ? privateChatApi : groupChatApi;
        const response = await api.sendMessage(chatId, message);

        // Transform response to common format
        const transformedMessage = {
            id: response.data.id,
            chatId: chatType === 'private' ? response.data.privateChatId : response.data.groupChatId,
            type: chatType,
            text: response.data.message,
            timestamp: response.data.sendTime,
            sender: {
                id: response.data.senderId,
                username: response.data.senderUsername,
                nickname: response.data.senderNickname
            },
            receiver: chatType === 'private' ? {
                username: response.data.receiverUsername,
                nickname: response.data.receiverNickname
            } : null
        };

        return transformedMessage;
    }
);


const chatsSlice = createSlice({
    name: 'chats',
    initialState: {
        chats: {
            private: [],
            group: [],
            typing: {},
            wsConnected: false
        },
        activeChat: {
            id: null,
            type: null,
            messages: [],
        },
        loading: {
            chats: false,
            messages: false,
            sending: false
        },
        fileUpload: {
            loading: false,
            progress: 0
        },
        error: null,
        unreadMessages: {},
        rightPanelOpen: false,
        filter: 'all'
    },
    reducers: {
        setActiveChat: (state, action) => {
            const { id, type } = action.payload;
            state.activeChat.id = id;
            state.activeChat.type = type;
            state.activeChat.messages = [];
        },
        clearActiveChat: (state) => {
            state.activeChat = {
                id: null,
                type: null,
                messages: []
            };
        },
        toggleRightPanel: (state) => {
            state.rightPanelOpen = !state.rightPanelOpen;
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        // WebSocket actions
        messageReceived: (state, action) => {
            const message = action.payload;
            if (state.activeChat.id === message.chatId) {
                state.activeChat.messages.push({
                    id: message.id,
                    chatId: message.chatId,
                    type: message.type,
                    text: message.text,
                    timestamp: message.timestamp,
                    sender: message.sender,
                    receiver: message.receiver
                });
            }

            // Update last message in chat list
            const chatType = message.type === 'private' ? 'private' : 'group';
            const chat = state.chats[chatType].find(c => c.id === message.chatId);
            if (chat) {
                chat.lastMessage = message.text;
                chat.lastMessageDate = message.timestamp;
            }
        },
        messageRead: (state, action) => {
            const { messageId, chatId } = action.payload;
            if (state.activeChat.id === chatId) {
                const message = state.activeChat.messages.find(m => m.id === messageId);
                if (message) {
                    message.read = true;
                }
            }

            // Update unread counter
            if (state.unreadMessages[chatId]) {
                state.unreadMessages[chatId]--;
                if (state.unreadMessages[chatId] <= 0) {
                    delete state.unreadMessages[chatId];
                }
            }
        },
        messageDeleted: (state, action) => {
            const { messageId, chatId } = action.payload;
            if (state.activeChat.id === chatId) {
                state.activeChat.messages = state.activeChat.messages.filter(
                    m => m.id !== messageId
                );
            }
        },
        messageEdited: (state, action) => {
            const { messageId, chatId, text } = action.payload;
            if (state.activeChat.id === chatId) {
                const message = state.activeChat.messages.find(m => m.id === messageId);
                if (message) {
                    message.text = text;
                    message.edited = true;
                }
            }
        },
        typingStatusChanged: (state, action) => {
            const { chatId, userId, isTyping } = action.payload;
            if (!state.chats.typing[chatId]) {
                state.chats.typing[chatId] = {};
            }
            if (isTyping) {
                state.chats.typing[chatId][userId] = Date.now();
            } else {
                delete state.chats.typing[chatId][userId];
            }
        },
        userStatusChanged: (state, action) => {
            const { userId, status } = action.payload;
            // Update user status in private chats
            state.chats.private.forEach(chat => {
                if (chat.participants.receiver.id === userId ||
                    chat.participants.sender.id === userId) {
                    chat.online = status === 'ONLINE';
                    chat.lastSeen = Date.now();
                }
            });
            // Update user status in group chats
            state.chats.group.forEach(chat => {
                const member = chat.members.find(m => m.id === userId);
                if (member) {
                    member.online = status === 'ONLINE';
                    member.lastSeen = Date.now();
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder
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
            });
    }
});

export const {
    setActiveChat,
    clearActiveChat,
    toggleRightPanel,
    setFilter,
    messageReceived,
    messageRead,
    messageDeleted,
    messageEdited,
    typingStatusChanged,
    userStatusChanged
} = chatsSlice.actions;

export default chatsSlice.reducer;