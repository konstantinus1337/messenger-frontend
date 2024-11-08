// pages/Chats/Chats.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import ChatsSidebar from '../../components/chats/ChatsSidebar/ChatsSidebar';
import ChatWindow from '../../components/chats/ChatWindow/ChatWindow';
import ChatInfo from '../../components/chats/ChatInfo/ChatInfo';
import { fetchChats } from '../../redux/slices/chatsSlice';

const Chats = () => {
    const dispatch = useDispatch();
    const { rightPanelOpen } = useSelector(state => state.chats);

    useEffect(() => {
        dispatch(fetchChats());
    }, [dispatch]);

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'background.default'
            }}
        >
            {/* Левая панель со списком чатов */}
            <Box
                sx={{
                    width: 320,
                    flexShrink: 0,
                    borderRight: 1,
                    borderColor: 'divider'
                }}
            >
                <ChatsSidebar />
            </Box>

            {/* Основное окно чата */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <ChatWindow />
            </Box>

            {/* Правая информационная панель */}
            {rightPanelOpen && (
                <Box
                    sx={{
                        width: 300,
                        flexShrink: 0,
                        borderLeft: 1,
                        borderColor: 'divider',
                        display: { xs: 'none', md: 'block' }
                    }}
                >
                    <ChatInfo />
                </Box>
            )}
        </Box>
    );
};

export default Chats;