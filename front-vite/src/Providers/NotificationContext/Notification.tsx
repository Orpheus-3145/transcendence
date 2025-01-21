import React, { createContext, useContext, useState, useEffect } from 'react';
import { error } from 'console';
import { useNavigate } from 'react-router-dom';
import {User} from '../UserContext/User'
import { io, Socket } from 'socket.io-client';

export interface SocketInterface {
	socket_obj: Socket | undefined,
	url: string,
}

interface SocketContextType {
  socket: SocketInterface;
  setSocket: React.Dispatch<React.SetStateAction<SocketInterface>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProviderNoti: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [socket, setSocket] = useState<SocketInterface>({socket_obj: undefined, url: import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_NOTIFICATION});
	useEffect(() => {
		setSocket({socket_obj: io(
			socket.url,
			{
				withCredentials: true,
				transports: ['websocket'],
			}
		), url: socket.url})
	}, [socket])
	return (
		<SocketContext.Provider value={{ socket, setSocket }}>
		  {children}
		</SocketContext.Provider>
	)
}

export const socket = io(`${import.meta.env.URL_WEBSOCKET}${import.meta.env.WS_NS_NOTIFICATION}`, {
    withCredentials: true,    // Send credentials (e.g., cookies) with the WebSocket request
    transports: ['websocket'], // Restrict to WebSocket transport
});

socket.on('connect', () => {
	console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
	console.error('Connection failed:', error);
});


export enum NotificationType {
	Message = 'Message',
	friendRequest = 'Friend Request',
	gameInvite = 'Game Invite',
}

export enum NotificationStatus {
	Accepted = 'Accepted',
	Declined = 'Declined',
	Pending = 'Pending',
}

export interface NotificationStruct {
	id: number;
	senderId: number;
	senderName: string;
	receiverId: number;
	receiverName: string;
	type: NotificationType;
	status: NotificationStatus;
	message: string | null;
}

const BACKEND_URL: string = 'https://localhost:4000';

export async function getUserNotifications(user:User): Promise<void> 
{
	socket.emit('getFromUser', { id: user.id.toString() });
}

export async function removeNotificationDb(id:string): Promise<void>
{
	const request = new Request(BACKEND_URL + '/notification/removeNotification/' + id, {
		method: "GET",
	});
	
	const response = await fetch(request);
	if (response.status == 404)
		console.log("ERROR: FAILED TO REMOVE NOTIFICATION FROM DATABASE");
}


export async function acceptFriendRequest(senderid:string, receiverid: string) {
	const request = new Request(BACKEND_URL + '/notification/acceptNotiFR/' + senderid + '/' + receiverid, {
		method: "GET",
	  });
		  
	try {
		await fetch(request);
	} 
	catch (error) {
		console.log("ERROR: FAILED TO ACCEPT FRIEND REQUEST!");
	}
}

export async function declineFriendRequest(senderid:string, receiverid: string) {
	const request = new Request(BACKEND_URL + '/notification/declineNotiFR/' + senderid + '/' + receiverid, {
		method: "GET",
	});

	try {
		await fetch(request);
	} 
	catch (error) {
		console.log("ERROR: FAILED TO DECLINE FRIEND REQUEST!");
	}
}

export async function acceptGameInvite(senderid:string, receiverid: string) {
	const request = new Request(BACKEND_URL + '/notification/acceptNotiGI/' + senderid + '/' + receiverid, {
		method: "GET",
	});

	try {
		await fetch(request);
	} 
	catch (error) {
		console.log("ERROR: FAILED TO ACCEPT GAME INVITE!");
	}
}

export async function declineGameInvite(senderid:string, receiverid: string) {
	const request = new Request(BACKEND_URL + '/notification/declineNotiGI/' + senderid + '/' + receiverid, {
		method: "GET",
	});

	try {
		await fetch(request);
	} 
	catch (error) {
		console.log("ERROR: FAILED TO DECLINE GAME INVITE!");
	}
}