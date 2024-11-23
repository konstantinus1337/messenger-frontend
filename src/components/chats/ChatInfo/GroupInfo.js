import React, { useState, useEffect } from 'react';
import {
    Box,
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Menu,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { friendsApi } from '../../../api/friends.api';
import { groupChatApi } from '../../../api/groupChat.api';
import { getUserIdFromToken } from '../../../utils/jwtUtils';

const GroupInfo = ({ group, onGroupDeleted }) => {
    const dispatch = useDispatch();
    const [groupData, setGroupData] = useState(group);
    const [editMode, setEditMode] = useState(false);
    const [groupName, setGroupName] = useState(group?.name || '');
    const [groupDesc, setGroupDesc] = useState(group?.description || '');
    const [addMemberDialog, setAddMemberDialog] = useState(false);
    const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentUserId = getUserIdFromToken();
    const currentUserRole = groupData?.members?.find(member =>
        Number(member.id) === Number(currentUserId)
    )?.role;
    const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'CREATOR';
    const isCreator = currentUserRole === 'CREATOR';

    useEffect(() => {
        setGroupData(group);
        setGroupName(group?.name || '');
        setGroupDesc(group?.description || '');
    }, [group]);

    useEffect(() => {
        const fetchFriends = async () => {
            setLoading(true);
            try {
                const response = await friendsApi.getFriendList();
                setFriends(response.data);
            } catch (error) {
                setError('Не удалось загрузить список друзей');
                console.error('Error fetching friends:', error);
            } finally {
                setLoading(false);
            }
        };

        if (addMemberDialog) {
            fetchFriends();
        }
    }, [addMemberDialog]);

    const handleSaveChanges = async () => {
        if (!isAdmin) {
            setError('У вас нет прав для изменения информации о группе');
            return;
        }

        try {
            if (groupName !== groupData.name) {
                await groupChatApi.editName(groupData.id, groupName);
            }
            if (groupDesc !== groupData.description) {
                await groupChatApi.editDescription(groupData.id, groupDesc);
            }

            setGroupData(prev => ({
                ...prev,
                name: groupName,
                description: groupDesc
            }));

            setEditMode(false);
            setError(null);
        } catch (error) {
            setError('Не удалось обновить информацию о группе');
            console.error('Error updating group:', error);
        }
    };

    const handleAddMember = () => {
        if (!isAdmin) {
            setError('У вас нет прав для добавления участников');
            return;
        }
        setAddMemberDialog(true);
    };

    const handleMemberMenuOpen = (event, member) => {
        if (!isAdmin) {
            setError('У вас нет прав для управления участниками');
            return;
        }
        if (currentUserRole === 'ADMIN' && member.role === 'CREATOR') {
            setError('У вас нет прав для управления создателем группы');
            return;
        }
        setMemberMenuAnchor(event.currentTarget);
        setSelectedMember(member);
    };

    const handleMemberMenuClose = () => {
        setMemberMenuAnchor(null);
        setSelectedMember(null);
    };

    const handleRemoveMember = async () => {
        if (!isAdmin) {
            setError('У вас нет прав для удаления участников');
            return;
        }

        try {
            await groupChatApi.deleteUser(groupData.id, selectedMember.id);

            setGroupData(prev => ({
                ...prev,
                members: prev.members.filter(member => member.id !== selectedMember.id)
            }));

            handleMemberMenuClose();
            setError(null);
        } catch (error) {
            console.error('Error removing member:', error);
            if (error.response?.status === 403) {
                setError('У вас нет прав для удаления участников');
            } else {
                setError('Не удалось удалить участника');
            }
        }
    };

    const handleChangeRole = async (role) => {
        if (!isAdmin) {
            setError('У вас нет прав для изменения ролей');
            return;
        }
        if (selectedMember.role === 'CREATOR') {
            setError('Нельзя изменить роль создателя группы');
            return;
        }
        console.log('role', role);
        try {
            await groupChatApi.changeRole(groupData.id, selectedMember.id, role);

            setGroupData(prev => ({
                ...prev,
                members: prev.members.map(member =>
                    member.id === selectedMember.id
                        ? { ...member, role }
                        : member
                )
            }));

            handleMemberMenuClose();
            setError(null);
        } catch (error) {
            console.error('Error changing role:', error);
            setError('Не удалось изменить роль участника');
        }
    };

    const handleAddFriendToGroup = async (friendId) => {
        if (!isAdmin) {
            setError('У вас нет прав для добавления участников');
            return;
        }

        try {
            await groupChatApi.addUser(groupData.id, friendId);

            const addedFriend = friends.find(friend => friend.id === friendId);
            const newMember = {
                id: addedFriend.id,
                username: addedFriend.username,
                nickname: addedFriend.nickname,
                avatar: addedFriend.avatar,
                role: 'MEMBER'
            };

            setGroupData(prev => ({
                ...prev,
                members: [...prev.members, newMember]
            }));

            setAddMemberDialog(false);
            setError(null);

        } catch (error) {
            console.error('Error adding friend to group:', error);
            setError('Не удалось добавить участника в группу');
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    const handleDeleteGroup = async () => {
        if (!isCreator) {
            setError('У вас нет прав для удаления группы');
            return;
        }

        try {
            await groupChatApi.deleteGroupChat(groupData.id);
            onGroupDeleted();
        } catch (error) {
            console.error('Error deleting group:', error);
            setError('Не удалось удалить группу');
        }
    };

    // Фильтрация друзей, исключая тех, кто уже в группе
    const filteredFriends = friends.filter(friend =>
        !groupData.members.some(member => Number(member.id) === Number(friend.id))
    );

    return (
        <Box sx={{ p: 2 }}>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                    src={groupData?.avatar}
                    alt={groupData?.name}
                    sx={{ width: 100, height: 100, mb: 1 }}
                >
                    {groupData?.name[0].toUpperCase()}
                </Avatar>
                {editMode ? (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Название группы"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            sx={{ mb: 1 }}
                        />
                        <TextField
                            fullWidth
                            label="Описание"
                            multiline
                            rows={2}
                            value={groupDesc}
                            onChange={(e) => setGroupDesc(e.target.value)}
                        />
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveChanges}
                            >
                                Сохранить
                            </Button>
                            <Button
                                onClick={() => setEditMode(false)}
                            >
                                Отмена
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {groupData?.name}
                            {isAdmin && (
                                <IconButton
                                    size="small"
                                    onClick={() => setEditMode(true)}
                                    sx={{ ml: 1 }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Typography>
                        {groupData?.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                            >
                                {groupData.description}
                            </Typography>
                        )}
                    </>
                )}
                {isCreator && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteGroup}
                        sx={{ mt: 2 }}
                    >
                        Удалить группу
                    </Button>
                )}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {`Участники (${groupData?.members?.length || 0})`}
                {isAdmin && (
                    <Button
                        startIcon={<PersonAddIcon />}
                        size="small"
                        onClick={handleAddMember}
                        sx={{ ml: 1 }}
                    >
                        Добавить
                    </Button>
                )}
            </Typography>

            <List>
                {groupData?.members?.map((member) => (
                    <ListItem key={member.id}>
                        <ListItemAvatar>
                            <Avatar src={member.avatar}>
                                {member.username[0].toUpperCase()}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={member.username}
                            secondary={member.role}
                        />
                        {isAdmin && Number(member.id) !== Number(currentUserId) && (
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    onClick={(e) => handleMemberMenuOpen(e, member)}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        )}
                    </ListItem>
                ))}
            </List>

            {/* Меню управления участником */}
            <Menu
                anchorEl={memberMenuAnchor}
                open={Boolean(memberMenuAnchor)}
                onClose={handleMemberMenuClose}
            >
                <MenuItem onClick={() => handleChangeRole('ADMIN')}>
                    Назначить администратором
                </MenuItem>
                <MenuItem onClick={() => handleChangeRole('MEMBER')}>
                    Снять администратора
                </MenuItem>
                <MenuItem
                    onClick={handleRemoveMember}
                    sx={{ color: 'error.main' }}
                >
                    Удалить из группы
                </MenuItem>
            </Menu>

            {/* Диалог добавления участника */}
            <Dialog
                open={addMemberDialog}
                onClose={() => setAddMemberDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Добавить участника</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredFriends.length > 0 ? (
                        <List>
                            {filteredFriends.map((friend) => (
                                <ListItem
                                    key={friend.id}
                                    button
                                >
                                    <ListItemAvatar>
                                        <Avatar src={friend.avatar}>
                                            {friend.username[0].toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={friend.username}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleAddFriendToGroup(friend.id)}
                                        >
                                            <PersonAddIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ p: 2, textAlign: 'center' }}
                        >
                            Нет доступных друзей для добавления
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddMemberDialog(false)}>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupInfo;