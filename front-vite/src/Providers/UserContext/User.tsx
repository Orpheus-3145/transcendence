import axios from 'axios';
import { error } from 'console';
import { stat } from 'fs';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export enum UserStatus {
	Online = 'online',
	Offline = 'offline',
	InGame = 'ingame',
	Idle = 'idle',
}

export interface User {
	id: number;
	intraId: number;
	nameNick: string | null;
	nameIntra: string;
	nameFirst: string;
	nameLast: string;
	email: string;
	image: string | null;
	greeting: string;
	status: UserStatus;
	friends: string[];
	blocked: string[];
}

interface UserContextType {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User>({ id: 0 });
	const navigate = useNavigate();

	const BACKEND_URL: string = 'https://localhost:4000';
	useEffect(() => {
		const validate = async () => {
		try {
			const response = await axios.get(BACKEND_URL + '/auth/validate', { withCredentials: true });
			const userDTO = response.data.user;
			setUser(userDTO);
		} catch (error) {
			navigate('/login');
			setUser({ id: 0 });
		}
		};
		validate();
	}, [user.id]);

	return (
		<UserContext.Provider value={{ user, setUser }}>
		{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

const BACKEND_URL: string = 'https://localhost:4000';

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
		console.error("ERROR: User not found!");
		navigate('/404');
	}
}

export async function setUserStatus(username:string, status:UserStatus): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/setStatus', {
		method: "POST",
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({ status: status }),
	});

	const response = await fetch(request)
	if (response.status == 404)
		console.log("ERROR: FAILED TO SET STATUS!");
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

export async function addFriend(username:string, friend:string): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/friend/add/' + friend, {
		method: "GET",
	});

	const response = await fetch(request)
	if (response.status == 404)
		console.log("ERROR: FAILED TO ADD FRIEND!");
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

export async function sendMessage(username:string, friend:string, message:string): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/sendMessage/' + friend, {
		method: "POST",
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({ message: message }),
	});

	const response = await fetch(request);
	if (response.status == 404)
		console.log("ERROR: FAILED TO FIND USER IN SENDMESSAGE!");
	if (response.status == 400)
		console.log("ERROR: INVALID MESSAGE!");
}

export async function inviteToGame(username:string, friend:string): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/invitegame/' + friend, {
		method: "GET",
	});

	const response = await fetch(request)
	if (response.status == 404)
		console.log("ERROR: FAILED TO FIND USER IN INVITETOGAME!");
}

export async function changePFP(username:string, image:FormData): Promise<void> {
	const request = new Request(BACKEND_URL + '/users/profile/' + username + '/changepfp', {
		method: "POST",
		body: image,
	});

	const response = await fetch(request)
	if (response.status == 400)
		console.log("ERROR: INVALID IMAGE IN CHANGEPFP!");
	if (response.status == 404)
		console.log("ERROR: FAILED TO FIND USER IN CHANGEPFP!");
}
