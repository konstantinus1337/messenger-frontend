import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    Stack,
    Paper
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

function Landing() {
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
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: 2
                        }}
                    >
                        {/* Логотип */}
                        <ChatIcon
                            sx={{
                                fontSize: 60,
                                color: 'primary.main',
                                mb: 2
                            }}
                        />

                        {/* Название проекта */}
                        <Typography
                            component="h1"
                            variant="h3"
                            sx={{
                                mb: 4,
                                fontWeight: 'bold',
                                color: 'primary.main'
                            }}
                        >
                            Messenger-Test
                        </Typography>

                        {/* Подзаголовок */}
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 4 }}
                        >
                            Простой и удобный способ общения
                        </Typography>

                        {/* Кнопки */}
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mt: 2 }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem'
                                }}
                            >
                                Войти
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/register')}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem'
                                }}
                            >
                                Регистрация
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
}

export default Landing;