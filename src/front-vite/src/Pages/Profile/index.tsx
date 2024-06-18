import React from 'react';
import { Avatar, Box, Container, CssBaseline, Typography, List, ListItem, ListItemAvatar, ListItemText, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const ProfileContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3],
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
  marginBottom: theme.spacing(2),
}));

const FriendsList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ProfilePage: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <ProfileContainer>
        <Typography variant="h4" gutterBottom style={{ color: theme.palette.text.primary }}>
          User Profile
        </Typography>

        <ProfileSection>
          <ProfileAvatar src="/static/images/avatar/1.jpg" />
          <Typography variant="h6" style={{ color: theme.palette.text.primary }}>
            John Doe
          </Typography>
          <Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
            Online
          </Typography>
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            Status
          </Typography>
          <Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
            Enjoying a game of Pong!
          </Typography>
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            Friends
          </Typography>
          <FriendsList>
            <ListItem>
              <ListItemAvatar>
                <Avatar src="/static/images/avatar/2.jpg" />
              </ListItemAvatar>
              <ListItemText primary="Alice" secondary="Online" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar src="/static/images/avatar/3.jpg" />
              </ListItemAvatar>
              <ListItemText primary="Bob" secondary="Offline" />
            </ListItem>
          </FriendsList>
        </ProfileSection>

        <ProfileSection>
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
        </ProfileSection>
      </ProfileContainer>
    </>
  );
};

export default ProfilePage;
