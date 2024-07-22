import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../Pages/Home/index';
import Game from '../../Pages/Game/index';
import ErrorPage from '../../Pages/Error/index';
import UserSettings from '../../Pages/UserSettings/index';
import ProfilePage from '../../Pages/Profile';
import LoginPage from '../../Pages/Login/index';
import ChannelsPage from '../../Pages/Channels/index';
import LogoutPage from '../../Pages/Logout';
import { useUser } from '../../Providers/UserContext/User';

export const Main: React.FC = () => {
  const { user } = useUser();

  const authenticatedRoutes = (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/game" element={<Game />} />
      <Route path="/channels" element={<ChannelsPage />} />
      <Route path="/profile/settings" element={<UserSettings />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
    </>
  );

  const unauthenticatedRoutes = (
    <Route path="/login" element={<LoginPage />} />
  );

  return (
    <Routes>
      {user.id === 0 ? unauthenticatedRoutes : authenticatedRoutes}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Main;
