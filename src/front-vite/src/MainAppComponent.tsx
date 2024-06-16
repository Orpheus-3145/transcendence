import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Bar as Header } from './Layout/Header/Bar';
import { Bar as Footer } from './Layout/Footer/Bar';
// import Chat from './Layout/Chat/index';
import Main from './Layout/Main/index';
import './mainAppComponent.css'
import { Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// BrowserRouter, Routes, Route

// Server-Sent Events (SSE) useful for notifications
//  WebSockets useful for chat and game services

const MainAppComponent: React.FC = () => {
  const theme = useTheme();
  return (
    <React.Fragment>
      <BrowserRouter>
        {/* UserProvider */}
          <Box marginY={'48px'}>
            <Header />
            <Main />
          </Box>
          <Divider orientation="horizontal" sx={{backgroundColor: theme.palette.common.white, width: '0.01em', minWidth: '100%'}}/>
          <Footer />
          {/* <Chat /> */}
        {/* UserProvider */}
      </BrowserRouter>
    </React.Fragment>
  );
}

export default MainAppComponent;
