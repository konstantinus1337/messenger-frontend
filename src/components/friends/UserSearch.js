import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    Box,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import UserAvatar from '../common/UserAvatar';
import { friendsApi } from '../../api/friends.api';
import { getUserIdFromToken } from '../../utils/jwtUtils';
import { addNewFriend } from '../../redux/slices/friendsSlice';

const UserSearch = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const friendsList = useSelector(state => state.friends.friendsList);
    const currentUserId = getUserIdFromToken();

    const isFriend = useCallback((userId) => {
        return friendsList.some(friend => friend.id === userId);
    }, [friendsList]);

    const filterSearchResults = useCallback((users) => {
        if (!currentUserId) {
            return users;
        }

        return users.filter(user => {
            const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            return userId !== currentUserId;
        });
    }, [currentUserId]);

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
                const filteredResults = filterSearchResults(response.data);
                setSearchResults(filteredResults);
            } catch (err) {
                console.error('Search error:', err);
                setError('Ошибка при поиске пользователей');
            } finally {
                setLoading(false);
            }
        }, 500),
        [filterSearchResults]
    );

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleAddFriend = async (user, event) => {
        event.stopPropagation(); // Предотвращаем всплытие события к ListItem
        try {
            await friendsApi.addFriend(user.id);
            dispatch(addNewFriend({
                id: user.id,
                username: user.username,
                nickname: user.nickname
            }));
        } catch (error) {
            console.error('Error adding friend:', error);
            setError('Не удалось добавить пользователя в друзья');
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
    };

    return (
        <Box>
            <Box sx={{ mb: 2, position: 'relative' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск пользователей..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                />
                {loading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            marginTop: '-12px'
                        }}
                    />
                )}
            </Box>

            {error && (
                <Typography color="error" sx={{ my: 2 }}>
                    {error}
                </Typography>
            )}

            {searchResults.length > 0 ? (
                <List>
                    {searchResults.map((user) => {
                        const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
                        if (userId === currentUserId) {
                            return null;
                        }

                        const isUserFriend = isFriend(user.id);

                        return (
                            <ListItem
                                key={user.id}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    borderRadius: 1,
                                    mb: 1
                                }}
                                onClick={() => handleUserClick(user.id)}
                            >
                                <ListItemAvatar>
                                    <UserAvatar
                                        userId={user.id}
                                        username={user.username}
                                        size={40}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.nickname || user.username}
                                    secondary={user.nickname && `@${user.username}`}
                                />
                                <ListItemSecondaryAction>
                                    {isUserFriend ? (
                                        <Tooltip title="Перейти в профиль">
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUserClick(user.id);
                                                }}
                                            >
                                                <PersonIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<PersonAddIcon />}
                                            onClick={(e) => handleAddFriend(user, e)}
                                            size="small"
                                        >
                                            Добавить
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        );
                    })}
                </List>
            ) : searchQuery.length >= 3 && !loading ? (
                <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
                    Пользователи не найдены
                </Typography>
            ) : searchQuery.length > 0 ? (
                <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
                    Введите не менее 3 символов для поиска
                </Typography>
            ) : null}
        </Box>
    );
};

export default UserSearch;