// components/chats/ChatsSidebar/ChatSearch.js
import React, { useState } from 'react';
import {
    TextField,
    InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ChatsSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        // TODO: Добавить логику поиска
    };

    return (
        <TextField
            fullWidth
            size="small"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color="action" />
                    </InputAdornment>
                )
            }}
        />
    );
};
export default ChatsSearch;