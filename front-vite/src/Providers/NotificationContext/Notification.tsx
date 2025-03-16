import { Power } from '@mui/icons-material';
import React from 'react';
import { io } from 'socket.io-client';
import { PowerUpSelected } from '../../Types/Game/Enum';

export const socket = io(`${import.meta.env.URL_WEBSOCKET}${import.meta.env.WS_NS_NOTIFICATION}`, {
    withCredentials: true,
    transports: ['websocket'],
});

socket.on('connect', () => {});

socket.on('connect_error', (error) => {
	console.error('Connection failed:', error);
});

export enum NotificationType {
  gameInvite = 'Game Invite',
	friendRequest = 'Friend Request',
	message = 'message',
	groupChat = 'groupChat',
}

export enum NotificationStatus {
	Accepted = 'Accepted',
	Declined = 'Declined',
	Pending = 'Pending',
}

export interface NotificationStruct {
	id: number;
	senderId: number;
	receiverId: number;
	senderName: string;
	receiverName: string;
	type: NotificationType;
	status: NotificationStatus;
	message: string | null;
	powerUpsSelected: PowerUpSelected
}

export async function addFriend(senderId:string, receiverId:string): Promise<void> 
{
	socket.emit('sendFriendReq', {senderId: senderId, receiverId: receiverId});
}

// NB change string into number
export async function inviteToGame(senderId:string, receiverId:string, powerups: number): Promise<void> 
{
	socket.emit('sendGameInvite', {senderId: senderId, receiverId: receiverId, powerUps: powerups});
}

export async function sendMessage(senderId:string, receiverId:string, message:string): Promise<void> 
{
	socket.emit('sendMessage', {senderId: senderId, receiverId: receiverId, message: message});
}

export async function removeNotificationDb(notificationId: number): Promise<void>
{
	socket.emit('removeNotification', { notificationId: notificationId, type: NotificationType });
}

export async function acceptFriendRequest(notificationId: number) 
{
	socket.emit('acceptNotiFr', { notificationId: notificationId });
}

export async function declineFriendRequest(notificationId: number) 
{
	socket.emit('declineNotiFr', { notificationId: notificationId });
}

export async function acceptGameInvite(notificationId: number)
{
	socket.emit('acceptNotiGI', { notificationId: notificationId });
}

export async function declineGameInvite(notificationId: number) 
{
	socket.emit('declineNotiGI', { notificationId: notificationId });
}