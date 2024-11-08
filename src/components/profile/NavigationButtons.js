import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Stack
} from '@mui/material';
import {
    Chat as ChatIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

export const NavigationButtons = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/chats')}
            >
                Чаты
            </Button>
            <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/friends')}
            >
                Друзья
            </Button>
            <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
            >
                Настройки
            </Button>
            <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
            >
                Выйти
            </Button>
        </Stack>
    );
};