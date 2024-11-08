// components/chats/ChatInfo/GroupInfo.js
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
    DialogActions
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

const GroupInfo = ({ group }) => {
    const dispatch = useDispatch();
    const [editMode, setEditMode] = useState(false);
    const [groupName, setGroupName] = useState(group?.name || '');
    const [groupDesc, setGroupDesc] = useState(group?.description || '');
    const [addMemberDialog, setAddMemberDialog] = useState(false);
    const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        setGroupName(group?.name || '');
        setGroupDesc(group?.description || '');
    }, [group]);

    const handleSaveChanges = () => {
        // TODO: Реализовать сохранение изменений группы
        setEditMode(false);
    };

    const handleAddMember = () => {
        setAddMemberDialog(true);
    };

    const handleMemberMenuOpen = (event, member) => {
        setMemberMenuAnchor(event.currentTarget);
        setSelectedMember(member);
    };

    const handleMemberMenuClose = () => {
        setMemberMenuAnchor(null);
        setSelectedMember(null);
    };

    const handleRemoveMember = () => {
        // TODO: Реализовать удаление участника
        handleMemberMenuClose();
    };

    const handleChangeRole = (role) => {
        // TODO: Реализовать изменение роли
        handleMemberMenuClose();
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                    src={group?.avatar}
                    alt={group?.name}
                    sx={{ width: 100, height: 100, mb: 1 }}
                >
                    {group?.name[0].toUpperCase()}
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
                            {group?.name}
                            <IconButton
                                size="small"
                                onClick={() => setEditMode(true)}
                                sx={{ ml: 1 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Typography>
                        {group?.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                            >
                                {group.description}
                            </Typography>
                        )}
                    </>
                )}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {`Участники (${group?.members?.length || 0})`}
                <Button
                    startIcon={<PersonAddIcon />}
                    size="small"
                    onClick={handleAddMember}
                    sx={{ ml: 1 }}
                >
                    Добавить
                </Button>
            </Typography>

            <List>
                {group?.members?.map((member) => (
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
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={(e) => handleMemberMenuOpen(e, member)}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
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
                    {/* TODO: Добавить поиск пользователей */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddMemberDialog(false)}>
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default GroupInfo;