import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../Pages/Home/index';
import Game from '../../Pages/Game/index';
import ErrorPage from '../../Pages/Error/index';
import ProfilePage from '../../Pages/Profile';
import LoginPage from '../../Pages/Login/index';
import ChannelsPage from '../../Pages/Channels/index';
import LogoutPage from '../../Pages/Logout';
import AllUsersPage from '../../Pages/AllUsers';
import { useUser } from '../../Providers/UserContext/User';
import TwoFactorAuth from '../../Pages/2FA';
import Leaderboard from '../../Pages/Leaderboard';

export const Main: React.FC = () => {
	const { user } = useUser();

  const authenticatedRoutes = (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/game" element={<Game />} />
      <Route path="/channels" element={<ChannelsPage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/404" element={<ErrorPage />} />
      <Route path="/viewusers" element={<AllUsersPage />} />
      <Route path="/leaderboard" element={<Leaderboard/>} />
    </>
  );

	const unauthenticatedRoutes = (
		<>
			<Route path='/login' element={<LoginPage />} />
			<Route path='/2fa' element={<TwoFactorAuth />} />
		</>
	);

	return (
		<Routes>
			{user.id === 0 ? unauthenticatedRoutes : authenticatedRoutes}
			<Route path='*' element={<ErrorPage />} />
		</Routes>
	);
};

export default Main;
