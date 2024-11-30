import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import React, { useEffect } from 'react';
import { webSocketService } from './api/websocket';

// Импорт существующих компонентов
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Friends from './pages/Friends/Friends';
import Settings from './pages/Settings/Settings';
import PrivateRoute from './components/common/PrivateRoute';
import Chats from "./pages/Chats/Chats";
import UserProfile from './pages/UserProfile/UserProfile';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h3: {
            fontWeight: 700,
        },
    },
    shape: {
        borderRadius: 8,
    },
});

function App() {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            webSocketService.connect(token).then(() => {
                webSocketService.send('/app/user.connect', {});
            });
        }

        const handleUnload = () => {
            webSocketService.send('/app/user.disconnect', {});
        };

        window.addEventListener('unload', handleUnload);

        return () => {
            webSocketService.disconnect();
            window.removeEventListener('unload', handleUnload);
        };
    }, []);

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/chats"
                            element={
                                <PrivateRoute>
                                    <Chats />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/friends"
                            element={
                                <PrivateRoute>
                                    <Friends />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <PrivateRoute>
                                    <Settings />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/user/:userId"
                            element={
                                <PrivateRoute>
                                    <UserProfile />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </Provider>
    );
}

export default App;