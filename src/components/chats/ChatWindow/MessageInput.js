import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    InputBase,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Send as SendIcon
} from '@mui/icons-material';
import FileUploadButton from './FileUploadButton';
import { sendMessage } from '../../../redux/slices/chatsSlice';

const MessageInput = () => {
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const { activeChat, loading } = useSelector(state => state.chats);
    const isSending = loading?.sending || false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending || !activeChat.id) return;

        try {
            await dispatch(sendMessage({
                chatId: activeChat.id,
                chatType: activeChat.type,
                message: message.trim()
            })).unwrap();

            setMessage(''); // Очищаем поле ввода только после успешной отправки
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Если нет активного чата, не показываем поле ввода
    if (!activeChat?.id) return null;

    return (
        <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderTop: 1,
                borderColor: 'divider'
            }}
        >
            <FileUploadButton />

            <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Введите сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                sx={{
                    flex: 1,
                    fontSize: '1rem',
                    '& .MuiInputBase-input': {
                        maxHeight: '120px',
                        overflowY: 'auto'
                    }
                }}
            />

            <IconButton
                color="primary"
                disabled={!message.trim() || isSending}
                type="submit"
                sx={{
                    width: 40,
                    height: 40,
                    '&.Mui-disabled': {
                        backgroundColor: 'action.disabledBackground'
                    }
                }}
            >
                {isSending ? (
                    <CircularProgress size={24} />
                ) : (
                    <SendIcon />
                )}
            </IconButton>
        </Paper>
    );
};

export default MessageInput;