import React, { useState, useEffect } from 'react';
import {
    Box,
    ImageList,
    ImageListItem,
    Typography,
    CircularProgress,
    Dialog,
    IconButton,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
} from '@mui/icons-material';
import { groupChatApi } from '../../../api/groupChat.api';
import { privateChatApi } from '../../../api/privateChat.api';

// Маппинг типов файлов из бэкенда в медиа категории
const FILE_TYPE_MAPPING = {
    // Изображения
    JPEG: 'image',
    JPG: 'image',
    PNG: 'image',
    GIF: 'image',
    WEBP: 'image',
    SVG: 'image',

    // Видео
    MP4: 'video',
    WEBM: 'video',
    OGG: 'video'
};

const SharedMedia = ({ chatId, chatType }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchMedia = async () => {
            if (!chatId) return;

            setLoading(true);
            try {
                const api = chatType === 'private' ? privateChatApi : groupChatApi;
                const response = await api.getFiles(chatId);

                console.log('Received files:', response.data);

                const mediaFiles = response.data
                    .filter(file => {
                        const fileType = file.type?.toUpperCase();
                        return FILE_TYPE_MAPPING[fileType] !== undefined;
                    })
                    .map(file => ({
                        id: file.id,
                        url: file.fileUrl || `https://messenger-app.s3.eu-north-1.amazonaws.com/${file.filePath}`, // Используем готовый URL или формируем
                        fileName: file.fileName,
                        type: FILE_TYPE_MAPPING[file.type?.toUpperCase()],
                        sentAt: file.sentAt,
                        senderId: file.senderId
                    }));

                console.log('Processed media files:', mediaFiles);

                // Сортируем по дате отправки (новые сверху)
                mediaFiles.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

                setMedia(mediaFiles);
                setError(null);
            } catch (err) {
                console.error('Error fetching media:', err);
                setError('Не удалось загрузить медиафайлы');
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, [chatId, chatType]);

    const handleMediaClick = (mediaItem, index) => {
        setSelectedMedia(mediaItem);
        setCurrentIndex(index);
    };

    const handleClose = () => {
        setSelectedMedia(null);
    };

    const handlePrevMedia = (e) => {
        e.stopPropagation();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : media.length - 1;
        setCurrentIndex(newIndex);
        setSelectedMedia(media[newIndex]);
    };

    const handleNextMedia = (e) => {
        e.stopPropagation();
        const newIndex = currentIndex < media.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        setSelectedMedia(media[newIndex]);
    };

    const renderMediaPreview = (item) => {
        if (item.type === 'video') {
            return (
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: 100
                    }}
                >
                    <video
                        src={item.url}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        preload="metadata"
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        Видео
                    </Box>
                </Box>
            );
        }

        return (
            <img
                src={item.url}
                alt={item.fileName}
                loading="lazy"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
                onError={(e) => {
                    console.error('Error loading image:', item.url);
                    e.target.src = '/placeholder-image.jpg';
                }}
            />
        );
    };

    const renderMediaDialog = () => {
        if (!selectedMedia) return null;

        return (
            <Dialog
                open={!!selectedMedia}
                onClose={handleClose}
                maxWidth="xl" // Увеличиваем максимальную ширину диалога
                fullWidth
                PaperProps={{
                    sx: {
                        height: '90vh', // Устанавливаем высоту диалога
                        bgcolor: 'black',
                        m: 0 // Убираем отступы
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {/* Кнопка закрытия */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: 'white',
                            zIndex: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.3)',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Кнопки навигации */}
                    {media.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrevMedia}
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    zIndex: 1,
                                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }}
                            >
                                <PrevIcon />
                            </IconButton>

                            <IconButton
                                onClick={handleNextMedia}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    zIndex: 1,
                                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }}
                            >
                                <NextIcon />
                            </IconButton>
                        </>
                    )}

                    {/* Контейнер для медиа */}
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2
                        }}
                    >
                        {selectedMedia.type === 'video' ? (
                            <video
                                src={selectedMedia.url}
                                controls
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                autoPlay
                            />
                        ) : (
                            <img
                                src={selectedMedia.url}
                                alt={selectedMedia.fileName}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    width: 'auto',
                                    height: 'auto'
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Dialog>
        );
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
                Общие медиафайлы {media.length > 0 && `(${media.length})`}
            </Typography>

            {media.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Нет общих медиафайлов
                </Typography>
            ) : (
                <ImageList cols={3} gap={8}>
                    {media.map((item, index) => (
                        <ImageListItem
                            key={item.id}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 1,
                                overflow: 'hidden',
                                '&:hover': {
                                    opacity: 0.8,
                                    transition: 'opacity 0.2s'
                                }
                            }}
                            onClick={() => handleMediaClick(item, index)}
                        >
                            {renderMediaPreview(item)}
                        </ImageListItem>
                    ))}
                </ImageList>
            )}

            <Dialog
                open={!!selectedMedia}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
            >
                {renderMediaDialog()}
            </Dialog>
        </Box>
    );
};

export default SharedMedia;