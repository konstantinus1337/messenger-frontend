import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    TextField,
    InputAdornment,
    Box,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import {
    setChatSearchQuery,
    setChatSearchResults,
    setChatSearching,
    clearChatSearch
} from '../../../redux/slices/chatsSlice';

const ChatsSearch = () => {
    const dispatch = useDispatch();
    const {
        chatSearch: { query, isSearching },
        chats,
        filter
    } = useSelector(state => state.chats);

    const filterChats = useCallback((searchQuery) => {
        dispatch(setChatSearching(true));
        const normalizedQuery = searchQuery.toLowerCase().trim();
        let results = [];

        // Применяем поиск в соответствии с текущим фильтром
        if (filter === 'all' || filter === 'private') {
            const privateChats = chats.private.filter(chat => {
                const senderName = (chat.participants?.sender?.nickname ||
                    chat.participants?.sender?.username || '').toLowerCase();
                const receiverName = (chat.participants?.receiver?.nickname ||
                    chat.participants?.receiver?.username || '').toLowerCase();
                return senderName.includes(normalizedQuery) ||
                    receiverName.includes(normalizedQuery);
            }).map(chat => ({
                ...chat,
                type: 'private'  // Используем type вместо searchType
            }));

            if (filter === 'private') {
                results = privateChats;
            } else {
                results = [...results, ...privateChats];
            }
        }

        if (filter === 'all' || filter === 'group') {
            const groupChats = chats.group.filter(chat => {
                const chatName = (chat.name || '').toLowerCase();
                const chatDescription = (chat.description || '').toLowerCase();
                return chatName.includes(normalizedQuery) ||
                    chatDescription.includes(normalizedQuery);
            }).map(chat => ({
                ...chat,
                type: 'group'  // Используем type вместо searchType
            }));

            if (filter === 'group') {
                results = groupChats;
            } else {
                results = [...results, ...groupChats];
            }
        }

        dispatch(setChatSearchResults(results));
        dispatch(setChatSearching(false));
    }, [chats, filter, dispatch]);

    // Перезапускаем поиск при изменении фильтра
    React.useEffect(() => {
        if (query.trim()) {
            filterChats(query);
        }
    }, [filter, query, filterChats]);

    const debouncedSearch = useCallback(
        debounce((query) => {
            if (query.trim()) {
                filterChats(query);
            } else {
                dispatch(clearChatSearch());
            }
        }, 300),
        [filterChats, dispatch]
    );

    const handleSearch = (event) => {
        const newQuery = event.target.value;
        dispatch(setChatSearchQuery(newQuery));
        debouncedSearch(newQuery);
    };

    const handleClear = () => {
        dispatch(clearChatSearch());
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <TextField
                fullWidth
                size="small"
                placeholder="Поиск чатов..."
                value={query}
                onChange={handleSearch}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {isSearching ? (
                                <CircularProgress size={20} />
                            ) : (
                                <SearchIcon color="action" />
                            )}
                        </InputAdornment>
                    ),
                    endAdornment: query && (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={handleClear}
                                edge="end"
                            >
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '&:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }
                }}
            />
        </Box>
    );
};

export default ChatsSearch;