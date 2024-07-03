import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../Pages/Home/index';
import Game from '../../Pages/Game/index';
import ErrorPage from '../../Pages/Error/index';
import UserSettings from '../../Pages/UserSettings/index';
import ProfilePage from '../../Pages/Profile';
import LoginPage from '../../Pages/Login/index';
import ChannelsPage from '../../Pages/Channels/index';

export const Main: React.FC = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/game" element={<Game />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/profile/settings" element={<UserSettings />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="*" element={<ErrorPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </main>
  );
};

export default Main;
