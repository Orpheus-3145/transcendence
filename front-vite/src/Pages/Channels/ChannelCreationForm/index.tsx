import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export function ChannelCreationForm() {
const [name, setUsername] = useState('');
const [privacy, setEmail] = useState('');
const [errors, setErrors] = useState({});
const [submitMessage, setSubmitMessage] = useState('');

const handleSubmit = (e) => {
	e.preventDefault();

	// Basic validation
	const newErrors = {};
	if (!name.trim()) newErrors.name = 'Username is required';
	if (!privacy.trim()) newErrors.privacy = 'Email is required';
	else if (!/\S+@\S+\.\S+/.test(privacy)) newErrors.privacy = 'Email is not valid';

	if (Object.keys(newErrors).length > 0) {
	setErrors(newErrors);
	return;
	}

	setErrors({});
	setSubmitMessage('Form submitted successfully!');

	// Reset form fields
	setUsername('');
	setEmail('');
};

return (
	<Box
		component="form"
		onSubmit={handleSubmit}
		sx={{
			display: 'flex',
			flexDirection: 'column',
			gap: 2,
			width: '300px',
			margin: 'auto',
			mt: 4,
			p: 3,
			boxShadow: 3,
			borderRadius: 2,
			backgroundColor: 'background.paper'
		}}
	>
	<TextField
		label="Username"
		variant="outlined"
		value={name}
		onChange={(e) => setUsername(e.target.value)}
		error={!!errors.name}
		helperText={errors.name}
		fullWidth
	/>
	<TextField
		label="Email"
		variant="outlined"
		value={privacy}
		onChange={(e) => setEmail(e.target.value)}
		error={!!errors.privacy}
		helperText={errors.privacy}
		fullWidth
	/>
	<Button type="submit" variant="contained" color="primary" fullWidth>
		Submit
	</Button>
	{submitMessage && (
		<Typography color="success.main" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
		{submitMessage}
		</Typography>
	)}
	</Box>
);
}

export default ChannelCreationForm;