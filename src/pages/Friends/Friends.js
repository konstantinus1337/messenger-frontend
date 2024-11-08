// pages/Friends/Friends.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    IconButton,
    Box
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FriendsList from '../../components/friends/FriendsList';
import UserSearch from '../../components/friends/UserSearch';
import { useFriendsWebSocket } from '../../hooks/useFriendsWebSocket';
import {
    fetchFriends,
    searchUsers,
    addFriend,
    deleteFriend
} from '../../redux/slices/friendsSlice';

const Friends = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Подключаем WebSocket
    useFriendsWebSocket();

    useEffect(() => {
        dispatch(fetchFriends());
    }, [dispatch]);

    const handleDeleteFriend = (friendId) => {
        dispatch(deleteFriend(friendId));
    };

    const handleSearch = (query) => {
        if (query.length >= 3) {
            dispatch(searchUsers(query));
        }
    };

    const handleAddFriend = (friendId) => {
        dispatch(addFriend(friendId));
    };

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
                    Friends
                </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Find New Friends
                </Typography>
                <UserSearch
                    onSearch={handleSearch}
                    onAddFriend={handleAddFriend}
                />
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Your Friends
                </Typography>
                <FriendsList onDelete={handleDeleteFriend} />
            </Paper>
        </Container>
    );
};

export default Friends;