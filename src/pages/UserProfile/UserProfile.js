// pages/UserProfile/UserProfile.js
import React, { useEffect } from 'react';
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

    const [isFriend, setIsFriend] = React.useState(false);
    const [addingFriend, setAddingFriend] = React.useState(false);
    const [startingChat, setStartingChat] = React.useState(false);

    const handleAddFriend = async () => {
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
    };

    const handleStartChat = async () => {
        setStartingChat(true);
        try {
            let chatData;
            try {
                const response = await privateChatApi.getPrivateChatBySenderAndReceiver(userId);
                chatData = response.data;
            } catch (error) {
                if (error.response?.status === 404) {
                    const createResponse = await privateChatApi.createPrivateChat(userId);
                    chatData = createResponse.data;
                } else {
                    throw error;
                }
            }

            dispatch(setActiveChat({
                id: chatData.id,
                type: 'private'
            }));
            navigate('/chats');
        } catch (error) {
            console.error('Error starting chat:', error);
            dispatch(fetchUserProfile.rejected({ payload: 'Не удалось начать чат' }));
        } finally {
            setStartingChat(false);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            if (currentUserId === parseInt(userId)) {
                navigate('/profile');
                return;
            }

            try {
                await Promise.all([
                    dispatch(fetchUserProfile(userId)),
                    dispatch(fetchUserFriends(userId))
                ]);

                setIsFriend(friendsList.some(friend => friend.id === parseInt(userId)));
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };

        if (userId) {
            loadUserData().catch(console.error);
        }

        return () => {
            // Очистка состояния при размонтировании компонента
            dispatch(fetchUserProfile.fulfilled(null));
            dispatch(fetchUserFriends.fulfilled([]));
        };
    }, [userId, currentUserId, navigate, dispatch, friendsList]);

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
                                    {!isFriend ? (
                                        <Button
                                            variant="contained"
                                            startIcon={<PersonAdd />}
                                            onClick={handleAddFriend}
                                            disabled={addingFriend}
                                        >
                                            {addingFriend ? 'Добавление...' : 'Добавить в друзья'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<Message />}
                                            onClick={handleStartChat}
                                            disabled={startingChat}
                                        >
                                            {startingChat ? 'Открытие чата...' : 'Написать сообщение'}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <UserFriendsList friends={friends} />
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default UserProfile;