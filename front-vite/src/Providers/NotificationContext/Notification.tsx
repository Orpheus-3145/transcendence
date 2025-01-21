import React, { createContext, useContext, useState, useEffect } from 'react';
import { error } from 'console';
import { useNavigate } from 'react-router-dom';
import {User} from '../UserContext/User'


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

export async function getUserNotifications(user:User): Promise<Notification[] | null> 
{
	const request = new Request(BACKEND_URL + '/notification/getFromUser/' + user.id.toString(), {
		method: "GET"
	});
	
	try
	{
		const response = await fetch(request)
			.then((raw) => raw.json())
			.then((json) => json as Notification[]);
		return response;
	}
	catch (error)
	{
		return (null);
	}	
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