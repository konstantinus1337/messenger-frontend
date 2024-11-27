import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    CircularProgress,
    IconButton,
    Alert,
    Tooltip
} from '@mui/material';
import {
    Description as DocIcon,
    Article as ArticleIcon,
    Code as CodeIcon,
    TextSnippet as TextIcon,
    Download as DownloadIcon,
    Archive as ArchiveIcon,
    InsertDriveFile as DefaultFileIcon
} from '@mui/icons-material';
import { groupChatApi } from '../../../api/groupChat.api';
import { privateChatApi } from '../../../api/privateChat.api';

// Типы файлов, которые должны отображаться в SharedMedia
const MEDIA_TYPES = [
    'JPEG', 'JPG', 'PNG', 'GIF', 'WEBP',  // Изображения
    'MP4', 'WEBM', 'OGG'                  // Видео
];

// Иконки для разных типов документов
const FILE_ICONS = {
    // Текстовые документы
    'DOC': DocIcon,
    'DOCX': DocIcon,
    'PDF': ArticleIcon,
    'TXT': TextIcon,
    'RTF': TextIcon,
    // Код
    'JSON': CodeIcon,
    'XML': CodeIcon,
    'HTML': CodeIcon,
    'CSS': CodeIcon,
    'JS': CodeIcon,
    // Архивы
    'ZIP': ArchiveIcon,
    'RAR': ArchiveIcon,
    '7Z': ArchiveIcon,
    // По умолчанию
    'DEFAULT': DefaultFileIcon
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const SharedFiles = ({ chatId, chatType }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            if (!chatId) return;

            setLoading(true);
            try {
                const api = chatType === 'private' ? privateChatApi : groupChatApi;
                const response = await api.getFiles(chatId);
                console.log('Received files:', response.data);

                // Фильтруем только документы (исключаем медиафайлы)
                const documentFiles = response.data
                    .filter(file => !MEDIA_TYPES.includes(file.type.toUpperCase()))
                    .map(file => ({
                        id: file.id,
                        name: file.fileName, // Используем fileName для отображения имени файла
                        fullPath: file.filePath, // Используем filePath для получения файла
                        type: file.type.toUpperCase(),
                        size: file.size,
                        url: `https://messenger-app.s3.eu-north-1.amazonaws.com/${file.filePath}`, // Создаем URL для скачивания файла
                        sentAt: file.sentAt,
                        senderId: file.senderId
                    }));

                console.log('Processed document files:', documentFiles);

                // Сортируем по дате (новые сверху)
                documentFiles.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
                setFiles(documentFiles);
                setError(null);
            } catch (err) {
                console.error('Error fetching files:', err);
                setError('Не удалось загрузить файлы');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [chatId, chatType]);

    const getFileIcon = (fileType) => {
        const IconComponent = FILE_ICONS[fileType] || FILE_ICONS.DEFAULT;
        return <IconComponent color="primary" />;
    };

    const handleDownload = (file) => {
        try {
            window.open(file.url, '_blank');
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Общие файлы {files.length > 0 && `(${files.length})`}
            </Typography>

            {files.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Нет общих файлов
                </Typography>
            ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {files.map((file) => (
                        <ListItem
                            key={file.id}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <ListItemIcon>
                                {getFileIcon(file.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {file.name}
                                    </Typography>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {formatFileSize(file.size)} • {formatDate(file.sentAt)}
                                    </Typography>
                                }
                            />
                            <Tooltip title="Скачать файл">
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDownload(file)}
                                    color="primary"
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            color: 'common.white'
                                        }
                                    }}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default SharedFiles;