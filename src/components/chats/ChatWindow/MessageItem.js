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
    TextField,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useChatWebSocket } from '../../../hooks/useChatWebSocket';
import { formatMessageDate } from '../../../utils/dateFormatter';

const MessageItem = ({
                         message,
                         isFirstInGroup,
                         isMine,
                         chatType
                     }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedText, setEditedText] = useState(message.text);
    const { sendMessage } = useChatWebSocket();
    const { editMessage, deleteMessage } = useChatWebSocket();

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        handleMenuClose();
        setEditDialogOpen(true);
        setEditedText(message.text);
    };

    const handleEditSubmit = async () => {
        if (editedText.trim() === message.text) {
            setEditDialogOpen(false);
            return;
        }

        try {
            await editMessage(message.chatId, message.id, editedText.trim());
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };

    const handleDeleteClick = async () => {
        try {
            await deleteMessage(message.chatId, message.id);
            handleMenuClose();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };


    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start',
                mb: isFirstInGroup ? 2 : 0.5
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
                <Box
                    sx={{
                        backgroundColor: isMine ? 'primary.main' : 'background.paper',
                        color: isMine ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        p: 1,
                        boxShadow: 1,
                        ml: isMine ? 0 : '40px',
                        mr: isMine ? '40px' : 0
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
                        {message.edited && (
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{ ml: 1, opacity: 0.7 }}
                            >
                                (изменено)
                            </Typography>
                        )}
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
                            color={isMine ? 'inherit' : 'text.secondary'}
                            sx={{ mr: 0.5 }}
                        >
                            {formatMessageDate(message.timestamp)}
                        </Typography>
                        {isMine && (
                            <>
                                {message.read ? <DoneAllIcon fontSize="small" /> : <DoneIcon fontSize="small" />}
                                <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 0.5 }}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </>
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