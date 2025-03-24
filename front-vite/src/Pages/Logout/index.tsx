import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserStatus, useUser } from '../../Providers/UserContext/User';
import axios from 'axios';
import { UserStatus } from '../../Types/User/Enum';

const LogoutPage: React.FC = () => {
	const { setUser } = useUser();
	const { user } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		async function logout() {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND + '/auth/logout', {
					withCredentials: true,
				});
				setUserStatus(user.id.toString());
				setUser({ id: 0 });
				navigate(response.data.redirectTo);
			} catch (error) {
				console.error('Error logging out:', error);
			}
		}
		logout();
	}, []);

	return <div></div>;
};

export default LogoutPage;
