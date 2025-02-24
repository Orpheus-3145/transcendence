import { Power } from '@mui/icons-material';
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

export enum PowerUpType {
	speedBall = 'speedBall',
	speedPaddle = 'speedPaddle',
	slowPaddle = 'slowPaddle',
	shrinkPaddle = 'shrinkPaddle',
	stretchPaddle = 'stretchPaddle'
}

export enum PowerUpSelected {
	noPowerUp = 0,        	// (00000)
	speedBall = 1 << 0, 		// (00001)
	speedPaddle = 1 << 1, 	// (00010)
	slowPaddle = 1 << 2, 		// (00100)
	shrinkPaddle = 1 << 3, 	// (01000)
	stretchPaddle = 1 << 4  // (10000)
}

export async function addFriend(username:string, friend:string): Promise<void> 
{
	socket.emit('sendFriendReq', {username: username, friend: friend});
}

export async function inviteToGame(username:string, friend:string, powerups: PowerUpSelected): Promise<void> 
{
	socket.emit('sendGameInvite', {username: username, friend: friend, powerUps: powerups});
}

export async function sendMessage(username:string, friend:string, message:string): Promise<void> 
{
	socket.emit('sendMessage', {username: username, friend: friend, message: message});
}

export async function removeNotificationDb(id:string): Promise<void>
{
	socket.emit('removeNotification', { id: id });
}

export async function acceptFriendRequest(senderid:string, receiverid: string) 
{
	socket.emit('acceptNotiFr', { sender: senderid, receiver: receiverid });
}

export async function declineFriendRequest(senderid:string, receiverid: string) 
{
	socket.emit('declineNotiFr', { sender: senderid, receiver: receiverid });
}

export async function acceptGameInvite(senderid:string, receiverid: string)
{
	socket.emit('acceptNotiGI', { sender: senderid, receiver: receiverid });
}

export async function declineGameInvite(senderid:string, receiverid: string) 
{
	socket.emit('declineNotiGI', { sender: senderid, receiver: receiverid });
}