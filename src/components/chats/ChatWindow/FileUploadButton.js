// FileUploadButton.js
import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';

const FileUploadButton = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const activeChat = useSelector(state => state.chats.activeChat);

    // Безопасное получение состояния загрузки
    const uploadState = useSelector(state => state.chats.fileUpload || { loading: false, progress: 0 });
    const { loading, progress } = uploadState;

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !activeChat?.id) return;

        // Проверяем тип файла
        const isImage = file.type.startsWith('image/');
        const isDocument = file.type === 'application/pdf' ||
            file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'text/plain';

        if (!isImage && !isDocument) {
            alert('Можно отправлять только изображения или документы (PDF, DOC, DOCX, TXT)');
            return;
        }

        // Проверяем размер файла (максимум 10 МБ)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Размер файла не должен превышать 10 МБ');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Здесь должен быть ваш action для отправки файла
            // await dispatch(uploadFile({ chatId: activeChat.id, file: formData }));

            // Очищаем input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <Tooltip title="Прикрепить файл">
                <IconButton
                    color="primary"
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {loading ? (
                        <CircularProgress
                            size={24}
                            variant="determinate"
                            value={progress}
                        />
                    ) : (
                        <AttachFileIcon />
                    )}
                </IconButton>
            </Tooltip>
        </>
    );
};

export default FileUploadButton;