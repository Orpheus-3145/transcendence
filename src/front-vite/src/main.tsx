import React from 'react';
import ReactDOM from 'react-dom/client';
import MainAppComponent from './MainAppComponent';
import './main.css';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { themeOptions } from './Styles/themeOptions';
import { CssBaseline } from '@mui/material';

const theme = createTheme(themeOptions);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainAppComponent />
    </ThemeProvider>
  </React.StrictMode>,
);