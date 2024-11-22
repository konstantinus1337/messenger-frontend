// components/chats/ChatsSidebar/ChatsSidebar.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Divider,
    IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatsSearch from './ChatsSearch';
import ChatFilter from './ChatFilter';
import ChatList from './ChatList';

const ChatsSidebar = () => {
    const { filter } = useSelector(state => state.chats);
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/profile');
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Чаты
                </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
                <ChatsSearch />
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
                <ChatFilter />
            </Box>
            <Divider />
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <ChatList />
            </Box>
        </Box>
    );
};

export default ChatsSidebar;