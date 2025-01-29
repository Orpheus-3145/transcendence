import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useUser } from '../../Providers/UserContext/User';

const TwoFactorAuth: React.FC = () => {
    const { user } = useUser();
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    const verify2FA = async () => {
        try {
            const response = await axios.post(`/auth/verify-2fa`, {
                userId: user.id,
                token,
            });

            if (response.data.success) {
                setMessage('2FA verification successful!');
            } else {
                setMessage('Invalid 2FA token. Please try again.');
            }
        } catch (error) {
            setMessage('Failed to verify 2FA.');
        }
    };

    return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h5">Verify Two-Factor Authentication</Typography>
            <TextField label="2FA Token" value={token} onChange={(e) => setToken(e.target.value)} fullWidth />
            <Button variant="contained" color="secondary" onClick={verify2FA}>
                Verify 2FA
            </Button>
            {message && <Alert severity="info">{message}</Alert>}
        </Box>
    );
};

export default TwoFactorAuth;
