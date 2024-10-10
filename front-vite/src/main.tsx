import React from 'react';
import ReactDOM from 'react-dom/client';
import MainAppComponent from './MainAppComponent';
import { UserProvider } from './Providers/UserContext/User';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <MainAppComponent />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
);