import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserContextType, MatchData, MatchRatio, LeaderboardData } from '../../Types/User/Interfaces';


const UserContext = createContext<UserContextType | undefined>(undefined);
const BACKEND_URL: string = import.meta.env.URL_BACKEND;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User>({ id: 0 });
	const navigate = useNavigate();

	useEffect(() => {
		const validate = async () => {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_VALIDATE, {
					withCredentials: true,
				});
				const userDTO = response.data.user;
				setUser(userDTO);
			} catch (error) {
				navigate('/login');
				setUser({ id: 0 });
			}
		};
		validate();
	}, [user.id]);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

export async function getAll(): Promise<User[]> {
	const request = new Request(BACKEND_URL + '/users/profile/getAll', {
		method: "GET",
	});

	try
	{
		const response = await fetch(request)
		.then((raw) => raw.json())
		.then((json) => json as User[]);
		return response;
	}
	catch (error)
	{
		console.error("ERROR: User array in getAll() not found!");
	}
}

export async function getUserFromDatabase(username: string, navigate: (path: string) => void): Promise<User>
{
	const request = new Request(BACKEND_URL + '/users/profile/' + username, {
		method: "GET",
	});

	try
	{
		const response = await fetch(request)
		.then((raw) => raw.json())
		.then((json) => json as User);
		return response;
	}
	catch (error)
	{
		console.error("ERROR: User not found!", error);
		navigate('/404');
	}
}

export async function setNewNickname(username:string, nickname:string): Promise<string> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/newnick', {
		method: "POST",
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({ newname: nickname }),
	});

	const response = await fetch(request)
		.then((x) => x.text())

	var str: string = "";

	if (response != "")
		str = "Error: " + response;
	return (str);
}

export async function fetchFriend(friend:string): Promise<User> {
	const request = new Request(BACKEND_URL + '/users/profile/username/friend/' + friend, {
		method: "GET",
	});

	const response = await fetch(request)
		.then((raw) => raw.json())
		.then((json) => json as User)
	return response;
}

export async function removeFriend(username:string, friend:string): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/remove/' + friend, {
		method: "GET",
	});

	const response = await fetch(request)
	if (response.status == 404)
		console.log("ERROR: FAILED TO REMOVE FRIEND!");
}

export async function blockFriend(username:string, friend:string): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/block/' + friend, {
		method: "GET",
	});

	const response = await fetch(request)
	if (response.status == 404)
		console.log("ERROR: FAILED TO BLOCK USER!");
}

export async function unBlockFriend(username:string, friend:string): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/unBlock/' + friend, {
		method: "GET",
	});

	const response = await fetch(request)
	if (response.status == 404)
		console.log("ERROR: FAILED TO BLOCK USER!");
}

export async function changePFP(username:string, image:FormData): Promise<string> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/changepfp', {
		method: "POST",
		body: image,
	});

	try
	{
		const response = await fetch(request)
			.then((x) => x.text())
		return (response);
	}
	catch (error)
	{
		console.error("ERROR: matchRatio[] not found!" + error);
	}
}

export async function fetchRatios(userProfile: User): Promise<MatchRatio[]>
{
	try {
		const response = await axios.get<MatchRatio[]>(`${BACKEND_URL}/users/profile/fetchRatio/${userProfile.intraId.toString()}`, {
			withCredentials: true,
		});
		const matches: MatchRatio[] = response.data;
		return matches;
	} catch (error)
		{
			console.error("ERROR: fetchRatios failed!");
		// NB no matches found, this shouldn't happen!
	}
}

export async function fetchLeaderboard(): Promise<LeaderboardData[][]>
{
	try {
		const response = await axios.get<LeaderboardData[][]>(`${BACKEND_URL}/users/fetchLeaderboard`, {
			withCredentials: true,
		});
		const leaderBoard: LeaderboardData[][] = response.data;
		console.log(response.data);
		return leaderBoard;
	} catch (error) {
		console.error("ERROR: Leaderboard[] not found!" + error);
	}	
}

export async function fetchMatchData(user: User): Promise<MatchData[]> {

	try {
		const response = await axios.get<MatchData[]>(`${BACKEND_URL}/users/profile/${user.intraId.toString()}/matches`, {
			withCredentials: true,
		});
		const matches: MatchData[] = response.data;
		return matches;
	} catch (error) {
		console.error("ERROR: fetchMatchData failed!");
	}
}
