// components/chats/ChatWindow/FileUploadButton.js
import React, { useState, useRef } from 'react';
import {
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Typography,
    Box
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    InsertDriveFile as FileIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { formatBytes } from '../../../utils/formatters';

const FileUploadButton = ({ onUpload, disabled }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);
        setDialogOpen(true);
        // Очищаем input для возможности повторного выбора тех же файлов
        event.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (!selectedFiles.length) return;

        setUploading(true);
        const totalFiles = selectedFiles.length;

        try {
            for (let i = 0; i < totalFiles; i++) {
                const file = selectedFiles[i];
                setUploadProgress(prev => ({
                    ...prev,
                    [i]: 0
                }));

                await onUpload(file, (progress) => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [i]: progress
                    }));
                });
            }

            // Закрываем диалог и очищаем состояние после успешной загрузки
            setDialogOpen(false);
            setSelectedFiles([]);
            setUploadProgress({});
        } catch (error) {
            console.error('Error uploading files:', error);
            // Здесь можно добавить обработку ошибки
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            <Tooltip title="Прикрепить файл">
                <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                >
                    <AttachFileIcon />
                </IconButton>
            </Tooltip>

            <Dialog
                open={dialogOpen}
                onClose={() => !uploading && setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Загрузка файлов</DialogTitle>
                <DialogContent>
                    <List>
                        {selectedFiles.map((file, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    !uploading && (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemIcon>
                                    <FileIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.name}
                                    secondary={formatBytes(file.size)}
                                />
                                {uploading && (
                                    <Box sx={{ width: '100%', ml: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={uploadProgress[index] || 0}
                                        />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {uploadProgress[index]}%
                                        </Typography>
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        disabled={uploading}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={uploading || !selectedFiles.length}
                    >
                        {uploading ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FileUploadButton;