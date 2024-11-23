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
import { getUserIdFromToken } from '../../../utils/jwtUtils';

const MessageItem = ({
                         message,
                         onEdit,
                         onDelete,
                         isFirstInGroup,
                         isMine
                     }) => {
    const currentUserId = getUserIdFromToken();
    const { results, currentIndex } = useSelector(state => state.chats.messageSearch);
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
                alignItems: isMine ? 'flex-end' : 'flex-start',
                mb: isFirstInGroup ? 2 : 0.5,
                scrollMarginTop: '100px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '70%',
                    flexDirection: isMine ? 'row-reverse' : 'row'
                }}
            >
                {/* Удаляем аватарку собеседника */}
                {/* {!isMine && isFirstInGroup && (
                    <UserAvatar
                        userId={message.sender.id}
                        username={message.sender.username}
                        size={32}
                        sx={{ mr: 1, mt: 1 }}
                    />
                )} */}
                <Box
                    sx={{
                        backgroundColor: isHighlighted
                            ? 'action.selected'
                            : (isMine ? 'primary.main' : 'background.paper'),
                        color: isMine ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        p: 1,
                        boxShadow: 1,
                        transition: 'background-color 0.3s ease',
                        ml: isMine ? 0 : isFirstInGroup ? '40px' : 0, // Уменьшаем отступ для выравнивания
                        mr: isMine ? '40px' : 0 // Уменьшаем отступ для выравнивания
                    }}
                >
                    {isFirstInGroup && !isMine && (
                        <Typography
                            variant="subtitle2"
                            color={isMine ? 'inherit' : 'primary'}
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
                            justifyContent: 'space-between',
                            mt: 0.5
                        }}
                    >
                        <Typography
                            variant="caption"
                            color={isMine ? 'inherit' : 'text.secondary'}
                            sx={{ mr: 0.5 }}
                        >
                            {formatMessageDate(message.timestamp)}
                        </Typography>
                        {isMine && (
                            message.read ? <DoneAllIcon fontSize="small" /> : <DoneIcon fontSize="small" />
                        )}
                        {isMine && (
                            <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 0.5 }}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Box>
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