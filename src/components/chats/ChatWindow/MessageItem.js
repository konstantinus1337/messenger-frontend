import React from 'react';
import {
    Box,
    Typography,
    Paper
} from '@mui/material';
import { formatMessageDate } from '../../../utils/dateFormatter';
import { useSelector } from 'react-redux';
import UserAvatar from '../../common/UserAvatar';

const MessageItem = ({ message, showAvatar }) => {
    const currentUserId = useSelector(state => state.auth.user?.id);
    const isOwn = message.sender.id === currentUserId;

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 1,
                position: 'relative'
            }}
        >
            {!isOwn && showAvatar && (
                <UserAvatar
                    userId={message.sender.id}
                    username={message.sender.username}
                    size={32}
                    sx={{ mr: 1, alignSelf: 'flex-end' }}
                />
            )}
            {!isOwn && !showAvatar && <Box sx={{ width: 32, mr: 1 }} />}

            <Box sx={{ maxWidth: '70%' }}>
                {showAvatar && !isOwn && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1, mb: 0.5, display: 'block' }}
                    >
                        {message.sender.nickname || message.sender.username}
                    </Typography>
                )}

                <Paper
                    elevation={1}
                    sx={{
                        p: 1.5,
                        bgcolor: isOwn ? 'primary.main' : 'background.paper',
                        color: isOwn ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="body1">
                        {message.text}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            mt: 0.5,
                            gap: 0.5
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.7,
                                color: isOwn ? 'primary.contrastText' : 'text.secondary'
                            }}
                        >
                            {formatMessageDate(message.timestamp)}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default MessageItem;