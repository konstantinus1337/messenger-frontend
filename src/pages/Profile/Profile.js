// pages/Profile/Profile.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Grid,
    Paper,
    Box
} from '@mui/material';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { RecentChats } from '../../components/profile/RecentChats';
import { TopFriends } from '../../components/profile/TopFriends';
import { NavigationButtons } from '../../components/profile/NavigationButtons';
import {
    fetchUserProfile,
    fetchRecentChats,
    fetchTopFriends
} from '../../redux/slices/profileSlice';

const Profile = () => {
    const dispatch = useDispatch();
    const {
        userProfile,
        recentChats,
        topFriends,
        loading
    } = useSelector(state => state.profile);

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(fetchRecentChats());
        dispatch(fetchTopFriends());
    }, [dispatch]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Информация о профиле */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <ProfileInfo
                            profile={userProfile}
                            loading={loading.profile}
                        />
                        <NavigationButtons />
                    </Paper>
                </Grid>

                {/* Недавние чаты */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <RecentChats
                            chats={recentChats}
                            loading={loading.chats}
                        />
                    </Paper>
                </Grid>

                {/* Топ друзей */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <TopFriends
                            friends={topFriends}
                            loading={loading.friends}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;