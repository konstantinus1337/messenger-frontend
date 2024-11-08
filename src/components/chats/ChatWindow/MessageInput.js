// MessageInput.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    InputBase,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Send as SendIcon
} from '@mui/icons-material';
import FileUploadButton from './FileUploadButton';

const MessageInput = ({ onSendMessage }) => {
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const activeChat = useSelector(state => state.chats.activeChat);
    const loading = useSelector(state => state.chats.loading?.sending) || false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading || !activeChat?.id) return;

        try {
            await onSendMessage(activeChat.id, activeChat.type, message.trim());
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
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
                gap: 1
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
                disabled={loading}
            />
            <IconButton
                color="primary"
                disabled={!message.trim() || loading}
                type="submit"
            >
                <SendIcon />
            </IconButton>
        </Paper>
    );
};

export default MessageInput;