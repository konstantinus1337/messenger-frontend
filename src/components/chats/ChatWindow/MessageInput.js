// components/chats/ChatWindow/MessageInput.js
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    TextField,
    IconButton,
    Tooltip,
    CircularProgress,
    Badge,
    Typography
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { privateChatApi } from '../../../api/privateChat.api';
import { groupChatApi } from '../../../api/groupChat.api';
import { useChatWebSocket } from '../../../hooks/useChatWebSocket';

const MessageInput = () => {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [sending, setSending] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const fileInputRef = useRef(null);

    const activeChat = useSelector(state => state.chats.activeChat);
    const { sendMessage, isConnected } = useChatWebSocket();

    // Устанавливаем состояние готовности после короткой задержки
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!message.trim() && !files.length) || !activeChat.id) {
            return;
        }

        setSending(true);
        try {
            const api = activeChat.type === 'private' ? privateChatApi : groupChatApi;

            // Отправка файлов, если есть
            if (files.length) {
                for (const file of files) {
                    await api.sendFile(activeChat.id, file);
                }
                setFiles([]);
            }

            // Отправка текстового сообщения
            if (message.trim()) {
                await sendMessage(activeChat.id, message.trim());
                setMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getInputStatus = () => {
        if (!isReady) return "Инициализация...";
        if (!isConnected) return "Подключение...";
        if (!activeChat.id) return "Выберите чат";
        return "Введите сообщение...";
    };

    const isInputDisabled = !isReady || !activeChat.id || sending;

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider'
            }}
        >
            {files.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        mb: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    {files.map((file, index) => (
                        <Box
                            key={index}
                            sx={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                bgcolor: 'action.selected',
                                borderRadius: 1,
                                p: 0.5,
                                pr: 2
                            }}
                        >
                            <Typography variant="caption" noWrap>
                                {file.name}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(index)}
                                sx={{
                                    position: 'absolute',
                                    right: -8,
                                    top: -8
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder={getInputStatus()}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyPress={handleKeyPress}
                    disabled={isInputDisabled}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    multiple
                />

                <Tooltip title="Прикрепить файл">
                    <span>
                        <IconButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isInputDisabled}
                        >
                            <Badge
                                badgeContent={files.length}
                                color="primary"
                                invisible={!files.length}
                            >
                                <AttachFileIcon />
                            </Badge>
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Отправить">
                    <span>
                        <IconButton
                            onClick={handleSend}
                            disabled={(!message.trim() && !files.length) || isInputDisabled}
                            color="primary"
                        >
                            {sending ? (
                                <CircularProgress size={24} />
                            ) : (
                                <SendIcon />
                            )}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default MessageInput;