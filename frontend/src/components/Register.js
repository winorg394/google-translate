import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [monthlyLimit, setMonthlyLimit] = useState(100);
    const [maxMachines, setMaxMachines] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username || !monthlyLimit || !maxMachines) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8810/auth', {
                username,
                monthly_limit: monthlyLimit,
                is_unlimited: false,
                max_machines: maxMachines
            });

            if (response.data && response.data.token && response.data.username) {
                localStorage.setItem('gtranstoken', response.data.token);
                localStorage.setItem('username', response.data.username);
                window.location.href = '/dashboard';
            } else {
                setError('Invalid response from server');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography component="h1" variant="h5" textAlign="center">
                    Register New Account
                </Typography>
                <Box component="form" sx={{ mt: 1 }} onSubmit={handleRegister}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={!!error}
                        disabled={isLoading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        type="number"
                        label="Monthly Translation Limit"
                        value={monthlyLimit}
                        onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 0)}
                        error={!!error}
                        disabled={isLoading}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        type="number"
                        label="Max Machines"
                        value={maxMachines}
                        onChange={(e) => setMaxMachines(parseInt(e.target.value) || 0)}
                        error={!!error}
                        disabled={isLoading}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                    <Box textAlign="center">
                        <Link href="/login" variant="body2">
                            Already have an account? Login
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Register;