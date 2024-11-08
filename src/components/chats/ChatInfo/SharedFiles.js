// components/chats/ChatInfo/SharedFiles.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    Description as FileIcon,
    Download as DownloadIcon
} from '@mui/icons-material';

const SharedFiles = ({ chatId, chatType }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Загрузка файлов
        setLoading(false);
    }, [chatId, chatType]);

    const handleDownload = (file) => {
        // TODO: Реализовать скачивание файла
    };

    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (files.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Общие файлы
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Нет общих файлов
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Общие файлы
            </Typography>
            <List dense>
                {files.map((file) => (
                    <ListItem key={file.id}>
                        <ListItemIcon>
                            <FileIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={file.filename}
                            secondary={`${file.size} • ${file.uploadDate}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={() => handleDownload(file)}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
export default SharedFiles;