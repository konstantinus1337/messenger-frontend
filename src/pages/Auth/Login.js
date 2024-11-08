// src/pages/Auth/Login.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import LoginForm from '../../components/auth/LoginForm';

function Login() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5'
            }}
        >
            <Container maxWidth="sm">
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                    aria-label="вернуться на главную"
                >
                    <ArrowBack />
                </IconButton>

                <Box
                    sx={{
                        mt: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            width: '100%',
                            borderRadius: 2
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h5"
                            sx={{
                                mb: 3,
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            Вход в систему
                        </Typography>

                        <LoginForm />
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
}

export default Login;