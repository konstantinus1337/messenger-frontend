// UserSearch.js
import React, { useState, useCallback } from 'react';
import {
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Search as SearchIcon } from '@mui/icons-material';
import { debounce } from 'lodash';
import UserAvatar from '../common/UserAvatar';
import { friendsApi } from '../../api/friends.api';
import { useFriendsWebSocket } from '../../hooks/useFriendsWebSocket';

const UserSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isConnected, addFriend } = useFriendsWebSocket();

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.length < 3) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await friendsApi.searchUsers(query);
                setSearchResults(response.data);
            } catch (err) {
                setError('Ошибка при поиске пользователей');
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleAddFriend = async (userId) => {
        try {
            await addFriend(userId);
            // Обновляем результаты поиска, убирая добавленного пользователя
            setSearchResults(prev => prev.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error adding friend:', error);
            // Здесь можно добавить отображение ошибки пользователю
        }
    };

    return (
        <Box>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                disabled={!isConnected}
            />

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}

            {searchResults.length > 0 ? (
                <List sx={{ mt: 2 }}>
                    {searchResults.map((user) => (
                        <ListItem key={user.id}>
                            <ListItemAvatar>
                                <UserAvatar
                                    userId={user.id}
                                    username={user.username}
                                    size={40}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.nickname || user.username}
                                secondary={user.nickname ? `@${user.username}` : null}
                            />
                            <ListItemSecondaryAction>
                                <Button
                                    variant="contained"
                                    startIcon={<PersonAddIcon />}
                                    onClick={() => handleAddFriend(user.id)}
                                    disabled={!isConnected}
                                >
                                    Добавить
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            ) : searchQuery.length >= 3 && !loading && (
                <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
                    Пользователи не найдены
                </Typography>
            )}
        </Box>
    );
};

export default UserSearch;