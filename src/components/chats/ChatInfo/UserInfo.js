// components/chats/ChatInfo/UserInfo.js
import React from 'react';
import {
    Box,
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Divider
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    Block as BlockIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { formatLastActive } from '../../../utils/dateFormatter';

const UserInfo = ({ user }) => {
    const handleBlock = () => {
        // TODO: Реализовать блокировку пользователя
    };

    const handleDeleteChat = () => {
        // TODO: Реализовать удаление чата
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                    src={user?.avatar}
                    alt={user?.username}
                    sx={{ width: 100, height: 100, mb: 1 }}
                >
                    {user?.username[0].toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                    {user?.nickname || user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {user?.online ? 'В сети' : `Был(а) в сети ${formatLastActive(user?.lastSeen)}`}
                </Typography>
            </Box>

            <List dense>
                {user?.email && (
                    <ListItem>
                        <ListItemIcon>
                            <EmailIcon />
                        </ListItemIcon>
                        <ListItemText primary={user.email} />
                    </ListItem>
                )}
                {user?.phone && (
                    <ListItem>
                        <ListItemIcon>
                            <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText primary={user.phone} />
                    </ListItem>
                )}
            </List>

            <Box sx={{ mt: 2 }}>
                <Button
                    fullWidth
                    startIcon={<BlockIcon />}
                    onClick={handleBlock}
                    sx={{ mb: 1 }}
                >
                    Заблокировать пользователя
                </Button>
                <Button
                    fullWidth
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteChat}
                >
                    Удалить чат
                </Button>
            </Box>
        </Box>
    );
};
export default UserInfo;