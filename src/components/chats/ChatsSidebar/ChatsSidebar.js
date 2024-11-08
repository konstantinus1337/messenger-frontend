// components/chats/ChatsSidebar/ChatsSidebar.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Divider
} from '@mui/material';
import ChatsSearch from './ChatsSearch';
import ChatFilter from './ChatFilter';
import ChatList from './ChatList';

const ChatsSidebar = () => {
    const { filter } = useSelector(state => state.chats);

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Чаты
                </Typography>
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