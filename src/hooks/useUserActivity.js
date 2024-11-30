import { useState, useEffect, useRef } from 'react';
import { webSocketService } from '../api/websocket';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const useUserActivity = () => {
    const [isActive, setIsActive] = useState(false);
    const lastActivity = useRef(Date.now());
    const checkInactivityTimer = useRef(null);

    const setOnlineStatus = () => {
        if (!isActive) {
            setIsActive(true);
            webSocketService.send('/app/user.connect', {});
        }
    };

    const setOfflineStatus = () => {
        if (isActive) {
            setIsActive(false);
            webSocketService.send('/app/user.disconnect', {});
        }
    };

    useEffect(() => {
        const checkInactivity = () => {
            if (Date.now() - lastActivity.current > INACTIVITY_TIMEOUT) {
                setOfflineStatus();
            }
        };

        const updateActivity = () => {
            lastActivity.current = Date.now();
        };

        const events = ['mousedown', 'keydown', 'mousemove', 'touchstart'];
        events.forEach(event => document.addEventListener(event, updateActivity));

        const token = localStorage.getItem('token');
        if (token) {
            webSocketService.connect(token).then(setOnlineStatus);
        }

        checkInactivityTimer.current = setInterval(checkInactivity, 60000);

        window.addEventListener('beforeunload', setOfflineStatus);

        return () => {
            events.forEach(event => document.removeEventListener(event, updateActivity));
            window.removeEventListener('beforeunload', setOfflineStatus);
            clearInterval(checkInactivityTimer.current);
            setOfflineStatus();
        };
    }, [isActive]);

    return isActive;
};