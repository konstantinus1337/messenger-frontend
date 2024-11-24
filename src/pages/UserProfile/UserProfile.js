import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    IconButton,
    Button,
    Divider,
    Skeleton,
    Alert
} from '@mui/material';
import { ArrowBack, PersonAdd, Message } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { StyledBadge } from '../../components/common/StyledBadge';
import UserAvatar from '../../components/common/UserAvatar';
import UserFriendsList from '../../components/userProfile/UserFriendsList';
import { fetchUserProfile, fetchUserFriends } from '../../redux/slices/userProfileSlice';
import { addNewFriend } from '../../redux/slices/friendsSlice';
import { setActiveChat } from '../../redux/slices/chatsSlice';
import { getUserIdFromToken } from '../../utils/jwtUtils';
import { friendsApi } from '../../api/friends.api';
import { privateChatApi } from '../../api/privateChat.api';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUserId = getUserIdFromToken();
    const { friendsList } = useSelector(state => state.friends);
    const { profile, friends, loading, error } = useSelector(state => state.userProfile);

    const [isFriend, setIsFriend] = useState(false);
    const [isMutualFriend, setIsMutualFriend] = useState(false);
    const [addingFriend, setAddingFriend] = useState(false);
    const [startingChat, setStartingChat] = useState(false);
    const [isInterfaceReady, setIsInterfaceReady] = useState(false);

    const handleAddFriend = useCallback(async () => {
        setAddingFriend(true);
        try {
            await friendsApi.addFriend(userId);
            dispatch(addNewFriend({
                id: parseInt(userId),
                username: profile.username,
                nickname: profile.nickname
            }));
            setIsFriend(true);
        } catch (error) {
            console.error('Error adding friend:', error);
            dispatch(fetchUserProfile.rejected({ payload: 'Не удалось добавить пользователя в друзья' }));
        } finally {
            setAddingFriend(false);
        }
    }, [userId, profile, dispatch]);

    const handleStartChat = useCallback(async () => {
        setStartingChat(true);
        try {
            // Пытаемся найти существующий чат
            let chatData;
            try {
                const response = await privateChatApi.getPrivateChatBySenderAndReceiver(userId);
                chatData = response.data;
            } catch (error) {
                // Если чат не найден (404), создаем новый
                if (error.response?.status === 404) {
                    const createResponse = await privateChatApi.createPrivateChat(userId);
                    chatData = createResponse.data;
                } else {
                    throw error;
                }
            }

            // Устанавливаем активный чат и переходим к нему
            dispatch(setActiveChat({
                id: chatData.id,
                type: 'private'
            }));
            navigate('/chats');
        } catch (error) {
            console.error('Error starting chat:', error);
            dispatch(fetchUserProfile.rejected({
                payload: 'Не удалось открыть чат с пользователем'
            }));
        } finally {
            setStartingChat(false);
        }
    }, [userId, dispatch, navigate]);

    useEffect(() => {
        const loadUserData = async () => {
            if (currentUserId === parseInt(userId)) {
                navigate('/profile');
                return;
            }

            try {
                setIsInterfaceReady(false);
                await Promise.all([
                    dispatch(fetchUserProfile(userId)),
                    dispatch(fetchUserFriends(userId))
                ]);

                // Проверяем, есть ли пользователь в списке друзей текущего пользователя
                setIsFriend(friendsList.some(friend => friend.id === parseInt(userId)));
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setIsInterfaceReady(true);
            }
        };

        if (userId) {
            loadUserData().catch(console.error);
        }

        return () => {
            dispatch(fetchUserProfile.fulfilled(null));
            dispatch(fetchUserFriends.fulfilled([]));
            setIsInterfaceReady(false);
        };
    }, [userId, currentUserId, navigate, dispatch, friendsList]);

    // Эффект для проверки взаимной дружбы
    useEffect(() => {
        if (friends && Array.isArray(friends)) {
            // Проверяем, есть ли текущий пользователь в списке друзей просматриваемого профиля
            setIsMutualFriend(friends.some(friend => friend.id === currentUserId));
        }
    }, [friends, currentUserId]);

    if (loading.profile) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Skeleton variant="circular" width={100} height={100} />
                        <Box sx={{ ml: 3, flexGrow: 1 }}>
                            <Skeleton variant="text" width="60%" height={40} />
                            <Skeleton variant="text" width="40%" height={24} />
                        </Box>
                    </Box>
                    <Skeleton variant="rectangular" height={200} />
                </Paper>
            </Container>
        );
    }

    if (error.profile) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error.profile}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                    Вернуться назад
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5">
                        Профиль пользователя
                    </Typography>
                </Box>

                {profile && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                            <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                invisible={!profile.online}
                            >
                                <UserAvatar
                                    userId={profile.id}
                                    username={profile.username}
                                    size={100}
                                />
                            </StyledBadge>
                            <Box sx={{ ml: 3, flexGrow: 1 }}>
                                <Typography variant="h4" gutterBottom>
                                    {profile.nickname || profile.username}
                                </Typography>
                                {profile.nickname && (
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        @{profile.username}
                                    </Typography>
                                )}
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    {isInterfaceReady && (
                                        <>
                                            <Button
                                                variant="contained"
                                                startIcon={<Message />}
                                                onClick={handleStartChat}
                                                disabled={startingChat}
                                            >
                                                {startingChat ? 'Открытие чата...' : 'Написать сообщение'}
                                            </Button>
                                            {!isFriend && !isMutualFriend && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<PersonAdd />}
                                                    onClick={handleAddFriend}
                                                    disabled={addingFriend}
                                                >
                                                    {addingFriend ? 'Добавление...' : 'Добавить в друзья'}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {loading.friends ? (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Друзья
                                </Typography>
                                {[1, 2, 3].map((i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                        <Box sx={{ width: '100%' }}>
                                            <Skeleton variant="text" width="60%" />
                                            <Skeleton variant="text" width="40%" />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : error.friends ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error.friends}
                            </Alert>
                        ) : (
                            <UserFriendsList friends={friends} />
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default UserProfile;