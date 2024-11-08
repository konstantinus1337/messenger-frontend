// components/chats/ChatsSidebar/ChatFilter.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import { setFilter } from '../../../redux/slices/chatsSlice';

const ChatFilter = () => {
    const dispatch = useDispatch();
    const { filter } = useSelector(state => state.chats);

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            dispatch(setFilter(newFilter));
        }
    };

    return (
        <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            fullWidth
        >
            <ToggleButton value="all">
                Все
            </ToggleButton>
            <ToggleButton value="private">
                Личные
            </ToggleButton>
            <ToggleButton value="group">
                Группы
            </ToggleButton>
        </ToggleButtonGroup>
    );
};
export default ChatFilter;