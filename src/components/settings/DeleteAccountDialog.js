import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';

export const DeleteAccountDialog = ({ open, onClose, onConfirm, isDeleting }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ color: 'error.main' }}>
                Удаление аккаунта
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Вы уверены, что хотите удалить свой аккаунт? Это действие невозможно отменить.
                    Все ваши данные, включая историю переписок и файлы, будут удалены безвозвратно.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={isDeleting}
                    fullWidth
                >
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    fullWidth
                >
                    {isDeleting ? 'Удаление...' : 'Удалить аккаунт'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAccountDialog;