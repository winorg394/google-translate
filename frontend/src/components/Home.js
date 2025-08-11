import React from 'react';
import { Container, Typography, Button, Box, Paper, Grid, Card, CardContent, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import DevicesIcon from '@mui/icons-material/Devices';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

function Home() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <TranslateIcon fontSize="large" color="primary" />,
            title: "Professional Translation",
            description: "High-quality translation service powered by Google Translate API"
        },
        {
            icon: <DevicesIcon fontSize="large" color="primary" />,
            title: "Multi-Device Support",
            description: "Register multiple machines and manage them easily"
        },
        {
            icon: <SpeedIcon fontSize="large" color="primary" />,
            title: "Usage Monitoring",
            description: "Track your translation usage and limits in real-time"
        },
        {
            icon: <SecurityIcon fontSize="large" color="primary" />,
            title: "Secure Access",
            description: "Token-based authentication for secure API access"
        }
    ];

    return (
        <Container maxWidth="lg">
            {/* Hero Section */}
            <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: 2,
                color: 'white',
                mb: 6
            }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Translation API Service
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                    Professional Translation Solution for Your Applications
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{ 
                            mr: 2, 
                            bgcolor: 'white', 
                            color: '#2196F3',
                            '&:hover': {
                                bgcolor: '#e3f2fd'
                            }
                        }}
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        sx={{ 
                            borderColor: 'white', 
                            color: 'white',
                            '&:hover': {
                                borderColor: '#e3f2fd',
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </Button>
                </Box>
            </Box>

            {/* Features Section */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Box sx={{ mb: 2 }}>
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Documentation Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
                <Typography variant="h4" gutterBottom>
                    How It Works
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            1. Register Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create an account with your desired monthly translation limit and maximum number of machines.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            2. Register Machines
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add your machines using their IP addresses and custom names for easy management.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            3. Start Translating
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Use our API endpoints to translate text with your registered machines.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* API Documentation */}
            <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
                <Typography variant="h4" gutterBottom>
                    API Documentation
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" paragraph>
                    Base URL: http://localhost:8008
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {/* Authentication */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                1. Authentication
                            </Typography>
                            <Typography variant="subtitle1" color="primary">POST /auth</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Request Body:</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        username: "user123",
                                        monthly_limit: 100,
                                        is_unlimited: false,
                                        max_machines: 2
                                    }, null, 2)}
                                </pre>
                            </Paper>
                            <Typography variant="body2" sx={{ mt: 2 }}>Success Response (200):</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        token: "eyJhbGciOiJIUzI1NiIs...",
                                        username: "user123"
                                    }, null, 2)}
                                </pre>
                            </Paper>
                        </Box>

                        {/* Translation */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                2. Translation
                            </Typography>
                            <Typography variant="subtitle1" color="primary">POST /translate</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Headers:</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
                                    }, null, 2)}
                                </pre>
                            </Paper>
                            <Typography variant="body2" sx={{ mt: 1 }}>Request Body:</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        text: "Hello world",
                                        to: "es"
                                    }, null, 2)}
                                </pre>
                            </Paper>
                            <Typography variant="body2" sx={{ mt: 2 }}>Success Response (200):</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        translatedText: "Hola mundo",
                                        status: true,
                                        message: ""
                                    }, null, 2)}
                                </pre>
                            </Paper>
                        </Box>

                        {/* Usage Statistics */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                3. Usage Statistics
                            </Typography>
                            <Typography variant="subtitle1" color="primary">GET /usage</Typography>
                            <Typography variant="body2" sx={{ mt: 2 }}>Success Response (200):</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        username: "user123",
                                        monthly_limit: 100,
                                        is_unlimited: false,
                                        current_usage: 45,
                                        remaining_uses: 55,
                                        max_machines: 2,
                                        current_machines: 1,
                                        machines: [
                                            {
                                                name: "My PC",
                                                ip: "192.168.1.100",
                                                registered_at: "2024-01-20T10:30:00Z"
                                            }
                                        ]
                                    }, null, 2)}
                                </pre>
                            </Paper>
                        </Box>

                        {/* Machine Management */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                4. Machine Management
                            </Typography>
                            <Typography variant="subtitle1" color="primary">POST /register-machine</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Request Body:</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        name: "My PC",
                                        ip: "192.168.1.100"
                                    }, null, 2)}
                                </pre>
                            </Paper>

                            <Typography variant="subtitle1" color="primary" sx={{ mt: 3 }}>DELETE /delete-machine</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Request Body:</Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', my: 1 }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify({
                                        ip: "192.168.1.100"
                                    }, null, 2)}
                                </pre>
                            </Paper>
                        </Box>

                        {/* Error Responses */}
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Error Responses
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" sx={{ mt: 1 }}>Unauthorized (401):</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#fff3f3', my: 1 }}>
                                        <pre style={{ margin: 0 }}>
                                            {JSON.stringify({
                                                status: false,
                                                message: "Invalid token"
                                            }, null, 2)}
                                        </pre>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" sx={{ mt: 1 }}>Limit Exceeded (403):</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#fff3f3', my: 1 }}>
                                        <pre style={{ margin: 0 }}>
                                            {JSON.stringify({
                                                status: false,
                                                message: "Monthly translation limit exceeded"
                                            }, null, 2)}
                                        </pre>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default Home;