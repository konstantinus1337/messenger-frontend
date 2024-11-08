import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
// import { Chat as ChatIcon } from 'lucide-react';
import ChatIcon from '@mui/icons-material/Chat'
import { setActiveChat } from '../../redux/slices/chatsSlice';

const StartChatButton = ({ friendId }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleStartChat = async () => {
        try {
            setLoading(true);

            // Сначала пытаемся найти существующий чат
            const response = await fetch(`/private-chat/find?receiverId=${friendId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            let chatData;

            if (response.status === 404) {
                // Если чат не найден, создаем новый
                const createResponse = await fetch(`/private-chat/create?receiverId=${friendId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                chatData = await createResponse.json();
            } else {
                chatData = await response.json();
            }

            // Устанавливаем активный чат в Redux
            dispatch(setActiveChat({
                id: chatData.id,
                type: 'private'
            }));

            // Перенаправляем на страницу чатов
            navigate('/chats');

        } catch (error) {
            console.error('Error starting chat:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title="Написать сообщение">
            <IconButton
                onClick={handleStartChat}
                disabled={loading}
                color="primary"
                size="small"
            >
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <ChatIcon size={24} />
                )}
            </IconButton>
        </Tooltip>
    );
};

export default StartChatButton;