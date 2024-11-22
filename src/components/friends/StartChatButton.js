import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import { privateChatApi } from '../../api/privateChat.api';
import { setActiveChat } from '../../redux/slices/chatsSlice';

const StartChatButton = ({ friendId }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleStartChat = async () => {
        try {
            setLoading(true);

            // Сначала пытаемся найти существующий чат
            let chatData;
            try {
                const response = await privateChatApi.getPrivateChatBySenderAndReceiver(friendId);
                chatData = response.data;
            } catch (error) {
                // Если чат не найден (404), создаем новый
                if (error.response?.status === 404) {
                    const createResponse = await privateChatApi.createPrivateChat(friendId);
                    chatData = createResponse.data;
                } else {
                    throw error;
                }
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
            // Здесь можно добавить обработку ошибок, например показ уведомления
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title="Написать сообщение">
            <span>
                <IconButton
                    onClick={handleStartChat}
                    disabled={loading}
                    color="primary"
                    size="small"
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : (
                        <MessageCircle size={20} />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default StartChatButton;