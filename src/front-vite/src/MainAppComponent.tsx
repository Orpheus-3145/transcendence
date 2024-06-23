import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Bar as Header } from './Layout/Header/HeaderBar';
import { Bar as Footer } from './Layout/Footer/FooterBar';
import Chat from './Layout/Chat/index';
import Main from './Layout/Main/index';
import './mainAppComponent.css'
import { Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// BrowserRouter, Routes, Route

// Server-Sent Events (SSE) useful for notifications
//  WebSockets useful for chat and game services

import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
};

const MainAppComponent: React.FC = () => {
  const theme = useTheme();
  return (
    <React.Fragment>
      <BrowserRouter>
        {/* UserProvider */}
        <Box bgcolor={theme.palette.background.default} >
            <Box marginY={'48px'}>
              <Header />
              <Main />
            </Box>
            <Divider orientation="horizontal" sx={{backgroundColor: theme.palette.background.default, width: '0.01em', minWidth: '100%'}}/>
            <Footer />
            <Chat />
        </Box>
        {/* UserProvider */}
      </BrowserRouter>
    </React.Fragment>
  );
}

export default MainAppComponent;
