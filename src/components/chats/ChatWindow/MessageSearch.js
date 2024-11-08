// components/chats/ChatWindow/MessageSearch.js
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    InputBase,
    IconButton,
    Typography,
    CircularProgress,
    Collapse,
    Fade
} from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import {
    toggleMessageSearch,
    setSearchQuery,
    searchMessages,
    navigateSearchResults
} from '../../../redux/slices/chatsSlice';
import debounce from 'lodash/debounce';

const MessageSearch = () => {
    const dispatch = useDispatch();
    const { activeChat } = useSelector(state => state.chats);
    const {
        isOpen,
        query,
        results,
        loading,
        currentIndex
    } = useSelector(state => state.chats.messageSearch);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchQuery) => {
            if (searchQuery.trim() && activeChat.id) {
                dispatch(searchMessages({
                    chatId: activeChat.id,
                    chatType: activeChat.type,
                    query: searchQuery
                }));
            }
        }, 500),
        [dispatch, activeChat]
    );

    const handleSearchChange = (event) => {
        const newQuery = event.target.value;
        dispatch(setSearchQuery(newQuery));
        debouncedSearch(newQuery);
    };

    const handleClose = () => {
        dispatch(toggleMessageSearch());
    };

    const handleNavigate = (direction) => {
        dispatch(navigateSearchResults(direction));

        // Прокрутка к выбранному сообщению
        if (results[currentIndex]) {
            const messageElement = document.getElementById(
                `message-${results[currentIndex].id}`
            );
            messageElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            dispatch(toggleMessageSearch());
        };
    }, [dispatch]);

    if (!isOpen) return null;

    return (
        <Collapse in={isOpen}>
            <Paper
                elevation={3}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    gap: 1,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    backgroundColor: 'background.paper'
                }}
            >
                <IconButton size="small">
                    <SearchIcon />
                </IconButton>

                <InputBase
                    autoFocus
                    fullWidth
                    placeholder="Поиск в чате..."
                    value={query}
                    onChange={handleSearchChange}
                />

                {loading ? (
                    <CircularProgress size={24} />
                ) : results.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {`${currentIndex + 1}/${results.length}`}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => handleNavigate('prev')}
                        >
                            <ArrowUpIcon />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => handleNavigate('next')}
                        >
                            <ArrowDownIcon />
                        </IconButton>
                    </Box>
                )}

                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </Paper>
        </Collapse>
    );
};

export default MessageSearch;