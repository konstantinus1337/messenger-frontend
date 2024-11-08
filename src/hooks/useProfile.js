import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserProfile,
    updateUserProfile,
    uploadAvatar,
    deleteAvatar,
    clearUpdateSuccess,
    clearError,
    updateUserPassword
} from '../redux/slices/profileSlice';

export const useProfile = () => {
    const dispatch = useDispatch();
    const {
        userProfile,
        loading,
        error,
        avatarUrl,
        updateSuccess
    } = useSelector(state => state.profile);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    const updateProfile = async (userData) => {
        try {
            await dispatch(updateUserProfile(userData)).unwrap();
            return true;
        } catch (error) {
            return false;
        }
    };

    const updatePassword = async (passwordData) => {
        try {
            await dispatch(updateUserPassword(passwordData)).unwrap();
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleAvatarUpload = async (file) => {
        try {
            await dispatch(uploadAvatar(file)).unwrap();
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleAvatarDelete = async () => {
        try {
            await dispatch(deleteAvatar()).unwrap();
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleClearUpdateSuccess = () => {
        dispatch(clearUpdateSuccess());
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    return {
        userProfile,
        loading,
        error,
        avatarUrl,
        updateSuccess,
        updateProfile,
        updatePassword,
        handleAvatarUpload,
        handleAvatarDelete,
        handleClearUpdateSuccess,
        handleClearError
    };
};

export default useProfile;