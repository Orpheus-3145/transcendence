import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserContextType, MatchData, MatchRatio, LeaderboardData } from '../../Types/User/Interfaces';
import { UserStatus } from '../../Types/User/Enum';


const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User>({ id: 0 });
	const navigate = useNavigate();
	
	useEffect(() => {
		const validate = async () => {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_VALIDATE, 
					{withCredentials: true}
				);
				if (response.data) {

					setUser(response.data.user);
				}
				if (response.data.user?.id === 0 && response.data.user?.twoFAEnabled) {
					navigate('/2fa');
				}


			} catch (error) {
				navigate('/login');
				setUser({ id: 0 });
			}
		};
		validate();
	}, [user.id]);
	
	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

const BACKEND_URL: string = import.meta.env.URL_BACKEND;

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

export async function getAll(): Promise<User[]> {
	const response = await axios.get(BACKEND_URL + '/users/profile/getAll', {withCredentials: true});
	if (response.status != 200)
		throw new Error("Error: User array in getAll() not found");
	return response.data;
}

export async function getUserFromDatabase(username: string, navigate: (path: string) => void): Promise<User|void>
{
	const response = await axios.get(BACKEND_URL + '/users/profile/' + username, {withCredentials: true});
	if (response.status != 200) {
		throw new Error("Error:  User not found");
		navigate('/404');
	}
	return response.data
}

export async function fetchUser(username: string): Promise<User | null>
{
	const response = await axios.get(BACKEND_URL + '/users/profile/fetchUser/' + username, {withCredentials: true});

	if (!response.data)
		throw new Error('No found');

	return response.data;
}

export async function setNewNickname(username:string, nickname:string): Promise<string> {
	const response = await axios.post(BACKEND_URL + '/users/profile/' + username + '/newnick', 
			JSON.stringify({ newname: nickname }),  {
			method: "POST",
			headers: {
			'Content-Type': 'application/json',
			},
			withCredentials: true,
	});

	var str: string = "";

	if (response.status != 201)
		str = "Error: " + response.statusText
	return (str);
}

export async function fetchFriend(friend:string): Promise<User|null> {
	const response = await axios.get(BACKEND_URL + '/users/profile/friend/' + friend, {withCredentials: true});

	return response.data;
}

export async function fetchOpponent(intraName:string): Promise<User> {
	const response = await axios.get(BACKEND_URL + '/users/profile/opponent/' + intraName, {withCredentials: true});

	if (!response.data)
		throw new Error('No opponent found');

	return response.data;
}

export async function fetchUserMessage(id:string): Promise<User> {
	const response = await axios.get(BACKEND_URL + '/users/profile/message/' + id, {withCredentials: true});

	if (!response.data)
		throw new Error('No user message found');

	return response.data;
}

export async function removeFriend(username:string, friend:string): Promise<void> {
	const response = await axios.get(BACKEND_URL + '/users/profile/' + username + '/friend/remove/' + friend, {withCredentials: true});

	if (!response.data)
		throw new Error('No friend found');

	return response.data;
}

export async function blockFriend(username:string, friend:string): Promise<void> {
	const response = await axios.get(BACKEND_URL + '/users/profile/' + username + '/friend/block/' + friend, {withCredentials: true});

	if (!response.data)
		throw new Error('Error: failed to block user');
}

export async function unBlockFriend(username:string, friend:string): Promise<void> {
	const response = await axios.get(BACKEND_URL + '/users/profile/' + username + '/friend/unBlock/' + friend, 
					{withCredentials: true});

	if (response.status === 404)
		throw new Error('Error: failed to unblock user');
}

export async function changePFP(username:string, image:FormData): Promise<string> {
	const response = await axios.post(BACKEND_URL + '/users/profile/' + username + '/changepfp', image, {withCredentials: true});

	if (!response.data)
		return 'Error setting profile picture'

	return response.data
}

export async function fetchRatios(userProfile: User): Promise<MatchRatio[]>
{
	const response = await axios.get<MatchRatio[]>(`${BACKEND_URL}/users/profile/fetchRatio/${userProfile.intraId.toString()}`, {
		withCredentials: true,
	});

	if (response.status != 200)
		throw new Error('Error: failed fetching ratios');	

	return response.data;
}

export async function fetchLeaderboard(): Promise<LeaderboardData[][]>
{
	const response = await axios.get(`${BACKEND_URL}/users/fetchLeaderboard`, {
		withCredentials: true,
	});
	if (response.status != 200)
		throw new Error("Error: fetch leaderboard failed")
	return response.data;
}

export async function fetchMatchData(user: User): Promise<MatchData[]> {
	const response = await axios.get<MatchData[]>(`${BACKEND_URL}/users/profile/${user.intraId.toString()}/matches`, {
		withCredentials: true,
	});
	if (response.status != 200)
		throw new Error('Error: failed fetching match data');	
	return response.data;
}

export async function setUserStatus(id: string): Promise<void> {
	const response = await axios.post(BACKEND_URL + '/users/profile/logout', 
		JSON.stringify({ id }),  
		{
			method: "POST",
			headers: {
			'Content-Type': 'application/json',
		},
		withCredentials: true,
	});
	if (response.status != 201) {
		throw new Error('Error: changing user status failed');
	}
}
