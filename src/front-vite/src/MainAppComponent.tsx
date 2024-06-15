import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Bar as Header } from './Layout/Header/Bar';
import { Bar as Footer } from './Layout/Footer/Bar';
// import Chat from './Layout/Chat/index';
import Main from './Layout/Main/index';
import './mainAppComponent.css'
// BrowserRouter, Routes, Route

// Server-Sent Events (SSE) useful for notifications
//  WebSockets useful for chat and game services

const MainAppComponent: React.FC = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        {/* UserProvider */}
          <Header />
          <Main />
          <Footer />
          {/* <Chat /> */}
        {/* UserProvider */}
      </BrowserRouter>
    </React.Fragment>
  );
}

export default MainAppComponent;
