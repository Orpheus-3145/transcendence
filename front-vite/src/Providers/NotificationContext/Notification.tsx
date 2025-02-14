import React from 'react';
import { io } from 'socket.io-client';

export const socket = io(`${import.meta.env.URL_WEBSOCKET}${import.meta.env.WS_NS_NOTIFICATION}`, {
    withCredentials: true,
    transports: ['websocket'],
});

socket.on('connect', () => {});

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

const BACKEND_URL: string = import.meta.env.URL_BACKEND;

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