// components/chats/ChatWindow/MessageItem.js
import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatMessageDate } from '../../../utils/dateFormatter';
import UserAvatar from '../../common/UserAvatar';

const MessageItem = ({
                         message,
                         onEdit,
                         onDelete,
                         isLastInGroup
                     }) => {
    const currentUser = useSelector(state => state.auth.user);
    const { results, currentIndex } = useSelector(state => state.chats.messageSearch);
    const isOwnMessage = message.sender.id === currentUser?.id;
    const isHighlighted = results[currentIndex]?.id === message.id;

    const [anchorEl, setAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedText, setEditedText] = useState(message.text);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        handleMenuClose();
        setEditDialogOpen(true);
    };

    const handleEditSubmit = () => {
        onEdit(message.id, editedText);
        setEditDialogOpen(false);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        onDelete(message.id);
    };

    return (
        <Box
            id={`message-${message.id}`}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                mb: isLastInGroup ? 2 : 0.5,
                scrollMarginTop: '100px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '70%'
                }}
            >
                {!isOwnMessage && isLastInGroup && (
                    <UserAvatar
                        userId={message.sender.id}
                        username={message.sender.username}
                        size={32}
                        sx={{ mr: 1, mt: 1 }}
                    />
                )}
                <Box
                    sx={{
                        backgroundColor: isHighlighted
                            ? 'action.selected'
                            : (isOwnMessage ? 'primary.main' : 'background.paper'),
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        p: 1,
                        boxShadow: 1,
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    {isLastInGroup && !isOwnMessage && (
                        <Typography
                            variant="subtitle2"
                            color={isOwnMessage ? 'inherit' : 'primary'}
                            sx={{ mb: 0.5 }}
                        >
                            {message.sender.nickname || message.sender.username}
                        </Typography>
                    )}
                    <Typography variant="body1">
                        {message.text}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            mt: 0.5
                        }}
                    >
                        <Typography
                            variant="caption"
                            color={isOwnMessage ? 'inherit' : 'text.secondary'}
                            sx={{ mr: 0.5 }}
                        >
                            {formatMessageDate(message.timestamp)}
                        </Typography>
                        {isOwnMessage && (
                            message.read ? <DoneAllIcon fontSize="small" /> : <DoneIcon fontSize="small" />
                        )}
                    </Box>
                </Box>
                {isOwnMessage && (
                    <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>Редактировать</MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    Удалить
                </MenuItem>
            </Menu>

            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Редактировать сообщение</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={!editedText.trim() || editedText === message.text}
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MessageItem;