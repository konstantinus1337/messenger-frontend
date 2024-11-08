// components/chats/ChatInfo/SharedMedia.js
import React, { useState, useEffect } from 'react';

import {
    Box,
    ImageList,
    ImageListItem,
    Typography,
    CircularProgress
} from '@mui/material';

const SharedMedia = ({ chatId, chatType }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Загрузка медиафайлов
        setLoading(false);
    }, [chatId, chatType]);

    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (media.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Общие медиафайлы
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Нет общих медиафайлов
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Общие медиафайлы
            </Typography>
            <ImageList cols={3} gap={8}>
                {media.map((item) => (
                    <ImageListItem key={item.id}>
                        <img
                            src={item.url}
                            alt={item.filename}
                            loading="lazy"
                            style={{ borderRadius: 4 }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </Box>
    );
};
export default SharedMedia;