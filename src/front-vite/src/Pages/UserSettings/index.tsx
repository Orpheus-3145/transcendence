import React from 'react';
import { Container, CssBaseline, Typography, TextField, Button, Box, Avatar, Switch, FormControlLabel } from '@mui/material';
import { styled, useTheme } from '@mui/system';

const SettingsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3],
}));

const SettingsSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
  marginBottom: theme.spacing(2),
}));

const UserSettings: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <SettingsContainer>
        <Typography variant="h4" gutterBottom style={{ color: theme.palette.text.primary }}>
          User Settings
        </Typography>

        <SettingsSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            User Account
          </Typography>
          <TextField
            fullWidth
            label="Unique Name"
            variant="outlined"
            margin="normal"
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
            }}
          />
          <ProfileAvatar src="/static/images/avatar/1.jpg" />
          <Button variant="contained" component="label">
            Upload Avatar
            <input type="file" hidden />
          </Button>
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            Security
          </Typography>
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
            }}
          />
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Two-Factor Authentication"
            labelPlacement="start"
            style={{ marginLeft: 0 }}
          />
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            Friends
          </Typography>
          <TextField
            fullWidth
            label="Add Friend"
            variant="outlined"
            margin="normal"
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
            }}
          />
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            Status
          </Typography>
          <TextField
            fullWidth
            label="Status Message"
            variant="outlined"
            margin="normal"
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
            }}
          />
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            Statistics
          </Typography>
          <Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
            Matches Played: 10
          </Typography>
          <Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
            Matches Won: 7
          </Typography>
          <Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
            Matches Lost: 3
          </Typography>
        </SettingsSection>

        <Button variant="contained" color="primary">
          Save Changes
        </Button>
      </SettingsContainer>
    </>
  );
};

export default UserSettings;
