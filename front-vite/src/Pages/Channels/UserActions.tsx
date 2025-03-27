import { useState } from "react";
import { Stack, Button, TextField, Modal, Box, Typography, Alert } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { MutingInterface } from "../../Layout/Chat/InterfaceChat";

const DurationModal = ({
	open,
	onClose,
	onConfirm,
	duration,
	setDuration,
	error,
	setError
}) => {
	const theme = useTheme()

	const handleInputChange = (key, value) => {
		if (/^\d*$/.test(value)) {
			setDuration(prev => ({ ...prev, [key]: value }));
			setError("");
		}
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Box sx={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				bgcolor: theme.palette.primary.dark,
				boxShadow: 24,
				p: 4,
				borderRadius: 2 ,
				minWidth: "70%"
			}}>
				<Typography variant="h6" gutterBottom>
					Mute Duration
				</Typography>

				{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

				<Stack spacing={1}>
					{Object.keys(duration).map((key) => (
						<TextField
							key={key}
							size="small"
							variant="outlined"
							placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
							value={duration[key]}
							onChange={(e) => handleInputChange(key, e.target.value)}
							inputProps={{
								inputMode: 'numeric',
								pattern: '[0-9]*',
							}}
						/>
					))}
				</Stack>
				<Stack direction="row" spacing={2} mt={2}>
					<Button variant="contained" color="primary" onClick={onConfirm}>
						Confirm
					</Button>
					<Button variant="outlined" color="error" onClick={onClose}>
						Cancel
					</Button>
				</Stack>
			</Box>
		</Modal>
	);
};

const ActionButton = ({ onClick, label, color = "error", variant = "outlined" }) => {
	return (
		<Button
			variant={variant}
			color={color}
			size="small"
			onClick={onClick}
		>
			{label}
		</Button>
	);
};

const UserActions = ({
	user,
	selectedChannel,
	handleRoleChange,
	handleKickFriend,
	handleBanFriend,
	handleMuteFriend,
}) => {
	const [openModal, setOpenModal] = useState(false);
	const [duration, setDuration] = useState({
		days: "" ,
		hours: "",
		minutes: "",
		seconds: "",
	});
	const [error, setError] = useState("");

	const handleClose = () => {
		setOpenModal(false);
		setDuration({ minutes: "", hours: "", seconds: "", days: "" });
		setError("")
	};

	const handleConfirm = () => {
		const hasValidDuration = Object.values(duration).some(value => {
		  const num = parseInt(value, 10);
		  return !isNaN(num) && num > 0;
		});

		if (!hasValidDuration) {
		  setError("Please enter at least one duration greater than zero");
		  return;
		}

		const ret: MutingInterface = {
			userId: user.id,
			channelId: selectedChannel.id,
			time: duration
		}
		handleMuteFriend(ret);
		handleClose();
	};

	return (
		<>
			<Stack direction="row" spacing={0.3}>
				<ActionButton
					onClick={() => handleRoleChange(user.id, user.role)}
					label={user.role === "admin" ? "Make Member" : "Make Admin"}
					color="secondary"
				/>
				<ActionButton
					onClick={() => handleKickFriend(user)}
					label="Kick"
				/>
				<ActionButton
					onClick={() => handleBanFriend(user)}
					label="Ban"
				/>
				<ActionButton
					onClick={() => setOpenModal(true)}
					label="Mute"
				/>
			</Stack>

			<DurationModal
				open={openModal}
				onClose={handleClose}
				onConfirm={handleConfirm}
				duration={duration}
				setDuration={setDuration}
				error={error}
				setError={setError}
			/>
		</>
	);
};

export default UserActions;