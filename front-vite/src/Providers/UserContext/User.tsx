import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../NotificationContext/Notification'

export enum UserStatus {
	Online = 'online',
	Offline = 'offline',
	InGame = 'ingame',
	Idle = 'idle',
}


export interface matchRatio {
	title: string;
	value: number;
	rate: number;
}

export interface leaderboardData {
	user: User;
	ratio: matchRatio[];
}

export interface matchData {
	player1: string;
	player2: string;
	player1Score: string;
	player2Score: string;
	whoWon: string;
	type: string;
}

export interface User {
	id: number;
	intraId: number;
	nameNick: string;
	nameIntra: string;
	nameFirst: string;
	nameLast: string;
	email: string;
	image: string;
	greeting: string;
	status: UserStatus;
	friends: string[];
	blocked: string[];
	matchHistory: matchData[];
}

interface UserContextType {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User>>;
}

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

export async function fetchRatios(userProfile: User): Promise<matchRatio[]>
{
	const request = new Request(BACKEND_URL + '/users/profile/fetchRatio/' + userProfile.intraId.toString(), {
		method: "GET",
	});

	try
	{
		const response = await fetch(request)
		.then((raw) => raw.json())
		.then((json) => json as matchRatio[]);
		return response;
	}
	catch (error)
	{
		console.error("ERROR: matchRatio[] not found!" + error);
	}
}

export async function fetchLeaderboard(): Promise<leaderboardData[][]>
{
	const request = new Request(BACKEND_URL + '/users/fetchLeaderboard/', {
		method: "GET",
	});

	try
	{
		const response = await fetch(request)
		.then((raw) => raw.json())
		.then((json) => json as leaderboardData[][]);
		return response;
	}
	catch (error)
	{
		console.error("ERROR: Leaderboard[] not found!" + error);
	}	
}
