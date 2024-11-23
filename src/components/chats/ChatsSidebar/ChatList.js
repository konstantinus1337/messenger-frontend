import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    List,
    ListItemText,
    ListItemButton,
    Badge,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { formatMessageDate } from '../../../utils/dateFormatter';
import { setActiveChat, addGroupChat } from '../../../redux/slices/chatsSlice';
import UserAvatar from '../../common/UserAvatar';
import { getUserIdFromToken } from '../../../utils/jwtUtils';
import { groupChatApi } from '../../../api/groupChat.api';

const ChatList = () => {
    const dispatch = useDispatch();
    const currentUserId = getUserIdFromToken();
    const {
        chats,
        filter,
        activeChat,
        unreadMessages,
        chatSearch: { query, results }
    } = useSelector(state => state.chats);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    // Определяем filteredChats с учетом поиска
    const filteredChats = React.useMemo(() => {
        // Если есть поисковой запрос, используем результаты поиска
        if (query.trim()) {
            return results;
        }

        // Если поиска нет, используем стандартную фильтрацию
        let result = [];
        if (filter === 'all' || filter === 'private') {
            result = [...result, ...chats.private];
        }
        if (filter === 'all' || filter === 'group') {
            result = [...result, ...chats.group];
        }
        return result.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    }, [chats, filter, query, results]);

    const handleChatSelect = (chatId, chatType) => {
        dispatch(setActiveChat({ id: chatId, type: chatType }));
    };

    const getChatInfo = (chat) => {
        const chatType = chat.type || chat.searchType;
        if (chatType === 'private') {
            let otherUser;

            const sender = chat.participants?.sender;
            const receiver = chat.participants?.receiver;

            if (Number(currentUserId) === Number(sender?.id)) {
                otherUser = {
                    id: receiver?.id,
                    username: receiver?.username,
                    nickname: receiver?.nickname
                };
            } else if (Number(currentUserId) === Number(receiver?.id)) {
                otherUser = {
                    id: sender?.id,
                    username: sender?.username,
                    nickname: sender?.nickname
                };
            }

            return {
                name: otherUser?.nickname || otherUser?.username || 'Неизвестный пользователь',
                secondaryName: null,
                username: otherUser?.username,
                userId: otherUser?.id,
                online: chat.online,
                isGroup: false
            };
        }

        return {
            name: chat.name,
            displayName: chat.name,
            description: chat.description,
            userId: null,
            membersCount: chat.members?.length || 0,
            isGroup: true
        };
    };

    const handleCreateGroupChat = async () => {
        setLoading(true);
        setError(null);

        try {
            const newGroupChat = await groupChatApi.createGroupChat({
                name: groupName,
                description: groupDescription
            });

            // Добавляем новый групповой чат в список чатов
            const newChat = {
                id: newGroupChat.data.id,
                type: 'group',
                name: newGroupChat.data.name,
                description: newGroupChat.data.description,
                avatar: null,
                lastMessage: null,
                lastMessageDate: new Date().toISOString(),
                members: []
            };

            dispatch(addGroupChat(newChat));
            dispatch(setActiveChat({ id: newChat.id, type: newChat.type }));

            // Закрываем диалог
            setOpenDialog(false);
            setGroupName('');
            setGroupDescription('');
        } catch (error) {
            console.error('Error creating group chat:', error);
            setError('Не удалось создать группу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {filteredChats.map((chat) => {
                    const info = getChatInfo(chat);
                    const chatType = chat.type || chat.searchType;
                    const isActive = activeChat.id === chat.id && activeChat.type === chatType;

                    return (
                        <ListItemButton
                            key={`${chatType}-${chat.id}`}
                            selected={isActive}
                            onClick={() => handleChatSelect(chat.id, chatType)}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                                backgroundColor: isActive ? 'action.selected' : 'inherit'
                            }}
                        >
                            <Badge
                                badgeContent={unreadMessages[chat.id] || 0}
                                color="primary"
                                sx={{ mr: 2 }}
                            >
                                <UserAvatar
                                    userId={info.userId}
                                    username={info.username}
                                    size={40}
                                />
                            </Badge>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="subtitle2"
                                        component="span"
                                        sx={{
                                            fontWeight: unreadMessages[chat.id] ? 600 : 400,
                                            color: 'text.primary'
                                        }}
                                    >
                                        {info.name}
                                    </Typography>
                                }
                                secondary={
                                    <Box component="span">
                                        {info.secondaryName && (
                                            <Typography
                                                variant="caption"
                                                component="span"
                                                color="text.secondary"
                                                sx={{ display: 'block' }}
                                            >
                                                {info.secondaryName}
                                            </Typography>
                                        )}
                                        {chat.lastMessage && (
                                            <Typography
                                                variant="body2"
                                                component="span"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: '200px',
                                                    display: 'inline-block',
                                                    verticalAlign: 'bottom'
                                                }}
                                            >
                                                {chat.lastMessage}
                                            </Typography>
                                        )}
                                        <Typography
                                            variant="caption"
                                            component="span"
                                            color="text.secondary"
                                            sx={{
                                                display: 'block',
                                                mt: 0.5
                                            }}
                                        >
                                            {info.isGroup ? `${info.membersCount} участников` :
                                                (info.online ? 'В сети' : 'Не в сети')}
                                            {chat.lastMessageDate && ` • ${formatMessageDate(chat.lastMessageDate)}`}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItemButton>
                    );
                })}
            </List>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={() => setOpenDialog(true)}
                    disabled={loading}
                >
                    Создать групповой чат
                </Button>
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Создать групповой чат</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название группы"
                        fullWidth
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Описание группы"
                        fullWidth
                        multiline
                        rows={4}
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button onClick={handleCreateGroupChat}>Создать</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatList;