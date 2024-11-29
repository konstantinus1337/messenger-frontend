// useSettingsHook.js
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
    fetchUserProfile,
    updateUserProfile,
    updateUserPassword,
    uploadAvatar,
    deleteAvatar,
    deleteProfile,
    clearError,
    clearUpdateSuccess,
    selectUserProfile,
    selectAvatarUrl,
    selectLoading,
    selectError,
    selectUpdateSuccess
} from '../redux/slices/settingsSlice';

const useSettings = () => {
    const dispatch = useDispatch();
    const userProfile = useSelector(selectUserProfile);
    const avatarUrl = useSelector(selectAvatarUrl);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const updateSuccess = useSelector(selectUpdateSuccess);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    const handleAvatarUpload = (file) => {
        dispatch(uploadAvatar(file));
    };

    const handleAvatarDelete = () => {
        dispatch(deleteAvatar());
    };

    const handleUpdateProfile = (profileData) => {
        dispatch(updateUserProfile(profileData));
    };

    const handleUpdatePassword = (passwordData) => {
        dispatch(updateUserPassword(passwordData));
    };

    const handleDeleteAccount = async () => {
        try {
            await dispatch(deleteProfile()).unwrap();
            return true;
        } catch (error) {
            console.error('Error deleting account:', error);
            return false;
        }
    };

    const handleClearUpdateSuccess = () => {
        dispatch(clearUpdateSuccess());
    };

    return {
        userProfile,
        avatarUrl,
        loading,
        error,
        updateSuccess,
        handleAvatarUpload,
        handleAvatarDelete,
        handleUpdateProfile,
        handleUpdatePassword,
        handleDeleteAccount,
        handleClearUpdateSuccess
    };
};

export default useSettings;