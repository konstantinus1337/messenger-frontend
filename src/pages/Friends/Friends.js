// Friends.js (страница)
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    IconButton,
    Box,
    Alert
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FriendsList from '../../components/friends/FriendsList';
import UserSearch from '../../components/friends/UserSearch';
import { useFriendsWebSocket } from '../../hooks/useFriendsWebSocket';
import { fetchFriends } from '../../redux/slices/friendsSlice';

const Friends = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error, loading } = useSelector(state => state.friends);

    // Подключаем WebSocket
    useFriendsWebSocket();

    useEffect(() => {
        // Просто вызываем fetchFriends без параметров
        dispatch(fetchFriends());
    }, [dispatch]);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            {/* Header с кнопкой назад */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3
            }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                    aria-label="go back"
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4">
                    Друзья
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Поиск друзей
                </Typography>
                <UserSearch />
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Ваши друзья
                </Typography>
                <FriendsList />
            </Paper>
        </Container>
    );
};

export default Friends;