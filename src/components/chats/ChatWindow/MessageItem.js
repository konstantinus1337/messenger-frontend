import React from 'react';
import {
    Box,
    Typography,
    Paper,
    styled
} from '@mui/material';
import { formatMessageDate } from '../../../utils/dateFormatter';
import { useSelector } from 'react-redux';
import UserAvatar from '../../common/UserAvatar';

const MessageBubble = styled(Paper)(({ theme, isown }) => ({
    padding: theme.spacing(1.5),
    minWidth: '100px',
    maxWidth: '60%',
    width: 'fit-content',
    borderRadius: 12,
    wordBreak: 'break-word',
    ...(isown === 'true' ? {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderBottomRightRadius: 4,
        marginLeft: 'auto', // Выравнивание справа
        '& .MuiTypography-timestamp': {
            color: `${theme.palette.primary.contrastText}80`
        }
    } : {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottomLeftRadius: 4,
        marginRight: 'auto', // Выравнивание слева
        '& .MuiTypography-timestamp': {
            color: theme.palette.text.secondary
        }
    })
}));

const MessageWrapper = styled(Box)(({ theme, isown }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing(1),
    width: '100%',
    ...(isown === 'true' ? {
        flexDirection: 'row-reverse',
    } : {
        flexDirection: 'row',
    })
}));

const MessageContainer = styled(Box)({
    width: '100%',
    marginBottom: '8px',
});

const MessageItem = ({ message, showAvatar }) => {
    const currentUserId = useSelector(state => state.auth.user?.id);
    const isOwn = message.sender.id === currentUserId;

    return (
        <MessageContainer>
            {showAvatar && !isOwn && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        ml: 5,
                        mb: 0.5,
                        display: 'block'
                    }}
                >
                    {message.sender.nickname || message.sender.username}
                </Typography>
            )}
            <MessageWrapper isown={isOwn.toString()}>
                {showAvatar ? (
                    <UserAvatar
                        userId={message.sender.id}
                        username={message.sender.username}
                        size={32}
                    />
                ) : (
                    <Box sx={{ width: 32, height: 32 }} /> // Placeholder для выравнивания
                )}

                <MessageBubble elevation={1} isown={isOwn.toString()}>
                    <Typography variant="body1">
                        {message.text}
                    </Typography>

                    <Typography
                        variant="caption"
                        className="MuiTypography-timestamp"
                        sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            fontSize: '0.75rem',
                        }}
                    >
                        {formatMessageDate(message.timestamp)}
                    </Typography>
                </MessageBubble>
            </MessageWrapper>
        </MessageContainer>
    );
};

export default MessageItem;