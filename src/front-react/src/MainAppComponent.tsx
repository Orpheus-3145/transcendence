import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Bar as Header } from './Layout/Header/Bar';
import { Bar as Footer } from './Layout/Footer/Bar';
import Chat from './Layout/Chat/index';
import Main from './Layout/Main/index';
import './mainAppComponent.css'
// BrowserRouter, Routes, Route

// Server-Sent Events (SSE) useful for notifications
//  WebSockets useful for chat and game services

// LEARN USEREF
// useReducer for complex useState

interface BarState {
  on: boolean;
  select: string | null;
}

const MainAppComponent: React.FC = () => {
  // Both can be createContext used with useContext
  const [menuState, setMenuState] = useState<BarState>({ on: false, select: null });
  const [chatState, setChatState] = useState<BarState>({ on: false, select: null });
  const [notifyState, setNotifyState] = useState<BarState>({ on: false, select: null });

  return (
    <React.Fragment>
      <BrowserRouter>
        {/* UserProvider */}
          <div className="mainAppComponent">
            <Header menuState={menuState} setMenuState={setMenuState} notifyState={notifyState} setNotifyState={setNotifyState} />
            <Main />
            <Footer />
            <Chat chatState={chatState} setChatState={setChatState} />
          </div>
        {/* UserProvider */}
      </BrowserRouter>
    </React.Fragment>
  );
}

export default MainAppComponent;
