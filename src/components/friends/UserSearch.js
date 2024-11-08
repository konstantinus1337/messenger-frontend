// components/friends/UserSearch.js
import React, { useState } from 'react';
import {
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    Button,
    Typography
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Search as SearchIcon } from '@mui/icons-material';

const UserSearch = ({ onSearch, searchResults = [], onAddFriend, existingFriends = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length >= 3) {
            onSearch(value);
        }
    };

    return (
        <div>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                    startAdornment: <SearchIcon color="action" />
                }}
                sx={{ mb: 2 }}
            />

            {searchResults.length > 0 && (
                <List>
                    {searchResults.map((user) => {
                        const isAlreadyFriend = existingFriends.some(friend => friend.id === user.id);

                        return (
                            <ListItem key={user.id}>
                                <ListItemAvatar>
                                    <Avatar src={user.avatar} alt={user.username}>
                                        {user.username[0].toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.nickname || user.username}
                                    secondary={user.nickname ? `@${user.username}` : null}
                                />
                                <ListItemSecondaryAction>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => onAddFriend(user.id)}
                                        disabled={isAlreadyFriend}
                                    >
                                        {isAlreadyFriend ? 'В друзьях' : 'Добавить'}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </div>
    );
};

export default UserSearch;