import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    InputBase,
    IconButton,
    Typography,
    CircularProgress,
    Collapse,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import {
    toggleMessageSearch,
    setMessageSearchQuery,
    setMessageSearchResults,
    navigateMessageSearchResults
} from '../../../redux/slices/chatsSlice';

const MessageSearch = () => {
    const dispatch = useDispatch();
    const { activeChat, messageSearch } = useSelector(state => state.chats);
    const { isOpen, results, loading, currentIndex } = messageSearch;
    const [localQuery, setLocalQuery] = useState('');

    const searchInMessages = useCallback((searchQuery) => {
        if (!searchQuery.trim() || !activeChat.messages) {
            dispatch(setMessageSearchResults([]));
            return;
        }

        const normalizedQuery = searchQuery.toLowerCase();
        const foundMessages = activeChat.messages.filter(message =>
            message.text.toLowerCase().includes(normalizedQuery)
        ).sort((a, b) => b.id - a.id); // Сортируем результаты по убыванию ID

        if (foundMessages.length > 0) {
            dispatch(setMessageSearchResults(foundMessages));
            setTimeout(() => {
                const firstMessage = document.getElementById(`message-${foundMessages[0].id}`);
                if (firstMessage) {
                    firstMessage.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    firstMessage.classList.add('highlighted'); // Добавляем класс для подсветки
                }
            }, 100);
        } else {
            dispatch(setMessageSearchResults([]));
        }
    }, [activeChat.messages, dispatch]);

    const debouncedSearch = useCallback(
        debounce((value) => {
            dispatch(setMessageSearchQuery(value));
            searchInMessages(value);
        }, 300),
        [searchInMessages]
    );

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setLocalQuery(value);
        debouncedSearch(value);
    };

    const handleClose = () => {
        dispatch(toggleMessageSearch());
        setLocalQuery('');
        dispatch(setMessageSearchQuery(''));
        dispatch(setMessageSearchResults([]));
    };

    const scrollToMessage = (messageId) => {
        setTimeout(() => {
            const messageElement = document.getElementById(`message-${messageId}`);
            if (messageElement) {
                messageElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                messageElement.classList.add('highlighted'); // Добавляем класс для подсветки
            }
        }, 50);
    };

    const handlePrevious = () => {
        if (results.length > 0) {
            let newIndex;
            if (currentIndex >= results.length - 1) {
                newIndex = 0; // Переход к первому элементу
            } else {
                newIndex = currentIndex + 1;
            }
            dispatch(navigateMessageSearchResults({ index: newIndex }));
        }
    };

    const handleNext = () => {

        if (results.length > 0) {
            let newIndex;
            if (currentIndex <= 0) {
                newIndex = results.length - 1; // Переход к последнему элементу
            } else {
                newIndex = currentIndex - 1;
            }
            dispatch(navigateMessageSearchResults({ index: newIndex }));
        }
    };

    const handleSearchClick = () => {
        if (!isOpen) {
            dispatch(toggleMessageSearch());
        } else if (localQuery) {
            searchInMessages(localQuery);
        }
    };

    useEffect(() => {
        if (results.length > 0 && currentIndex >= 0) {
            scrollToMessage(results[currentIndex].id);
        }
    }, [currentIndex, results]);

    if (!isOpen) {
        return (
            <Tooltip title="Поиск">
                <IconButton onClick={handleSearchClick}>
                    <SearchIcon />
                </IconButton>
            </Tooltip>
        );
    }

    return (
        <Collapse in={isOpen}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    gap: 1,
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <IconButton size="small" onClick={handleSearchClick}>
                    <SearchIcon />
                </IconButton>

                <InputBase
                    autoFocus
                    fullWidth
                    placeholder="Поиск в чате..."
                    value={localQuery}
                    onChange={handleSearchChange}
                    sx={{ ml: 1 }}
                />

                {loading ? (
                    <CircularProgress size={24} />
                ) : results.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {`${currentIndex + 1}/${results.length}`}
                        </Typography>
                        <Tooltip title="К предыдущему (вверх)">
                            <IconButton
                                size="small"
                                onClick={handlePrevious}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText'
                                    }
                                }}
                            >
                                <ArrowUpIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="К следующему (вниз)">
                            <IconButton
                                size="small"
                                onClick={handleNext}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText'
                                    }
                                }}
                            >
                                <ArrowDownIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                <Tooltip title="Закрыть поиск">
                    <IconButton size="small" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Collapse>
    );
};

export default MessageSearch;