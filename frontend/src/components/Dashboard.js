import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button, Grid,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import axios from 'axios';

function Dashboard() {
    const [usage, setUsage] = useState(null);
    const [text, setText] = useState('');
    const [targetLang, setTargetLang] = useState('es');
    const [translation, setTranslation] = useState('');
    const [newMachine, setNewMachine] = useState({ name: '', ip: '' });

    const token = localStorage.getItem('gtranstoken');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchUsage = async () => {
        try {
            const response = await axios.get('http://192.168.78.5:8810/usage');
            setUsage(response.data);
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        }
    };

    useEffect(() => {
        fetchUsage();
    }, []);

    const handleTranslate = async () => {
        try {
            const response = await axios.post('http://192.168.78.5:8810/translate', {
                text,
                to: targetLang
            });
            setTranslation(response.data.translatedText);
        } catch (error) {
            alert(error.response?.data?.message || 'Translation failed');
        }
    };

    const handleRegisterMachine = async () => {
        try {
            if (!newMachine.name || !newMachine.ip) {
                alert('Please fill in both machine name and IP address');
                return;
            }

            const token = localStorage.getItem('gtranstoken');
            if (!token) {
                alert('Authentication token not found. Please login again.');
                window.location.href = '/login';
                return;
            }

            const response = await axios.post('http://192.168.78.5:8810/register-machine', newMachine, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                fetchUsage();
                setNewMachine({ name: '', ip: '' });
                alert('Machine registered successfully');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to register machine';
            alert(errorMessage);
            if (error.response?.status === 403) {
                alert('Session expired or unauthorized. Please login again.');
                localStorage.removeItem('gtranstoken');
                window.location.href = '/login';
            }
        }
    };

    const handleDeleteMachine = async (ip) => {
        try {
            await axios.delete('http://192.168.78.5:8810/delete-machine', { data: { ip } });
            fetchUsage();
        } catch (error) {
            alert('Failed to delete machine');
        }
    };

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Translation Dashboard
                </Typography>

                {/* Usage Statistics */}
                {usage && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Usage Statistics</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Typography>Monthly Limit: {usage.monthly_limit}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography>Current Usage: {usage.current_usage}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography>Remaining: {usage.remaining_uses}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography>Machines: {usage.current_machines}/{usage.max_machines}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* Translation Section */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Translate</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Text to translate"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Target Language"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        sx={{ mb: 2, mr: 2 }}
                    />
                    <Button variant="contained" onClick={handleTranslate}>
                        Translate
                    </Button>
                    {translation && (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Translation"
                            value={translation}
                            sx={{ mt: 2 }}
                            InputProps={{ readOnly: true }}
                        />
                    )}
                </Paper>

                {/* Machine Management */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Machine Management</Typography>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            label="Machine Name"
                            value={newMachine.name}
                            onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                            sx={{ mr: 2 }}
                        />
                        <TextField
                            label="IP Address"
                            value={newMachine.ip}
                            onChange={(e) => setNewMachine({ ...newMachine, ip: e.target.value })}
                            sx={{ mr: 2 }}
                        />
                        <Button variant="contained" onClick={handleRegisterMachine}>
                            Register Machine
                        </Button>
                    </Box>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell>Registered At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usage?.machines?.map((machine) => (
                                <TableRow key={machine.ip}>
                                    <TableCell>{machine.name}</TableCell>
                                    <TableCell>{machine.ip}</TableCell>
                                    <TableCell>{new Date(machine.registered_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteMachine(machine.ip)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </Container>
    );
}

export default Dashboard;