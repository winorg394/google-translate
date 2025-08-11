import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:8810/auth', {
                username
            });

            if (response.data && response.data.token && response.data.username) {
                localStorage.setItem('gtranstoken', response.data.token);
                localStorage.setItem('username', response.data.username);
                window.location.href = '/dashboard';
            } else {
                alert('Invalid response from server');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            alert(errorMessage);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography component="h1" variant="h5" textAlign="center">
                    Login
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleLogin}
                    >
                        Login
                    </Button>
                    <Box textAlign="center">
                        <Link href="/register" variant="body2">
                            {"Don't have an account? Register"}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;