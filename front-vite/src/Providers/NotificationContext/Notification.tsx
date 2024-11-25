import React, { createContext, useContext, useState, useEffect } from 'react';
import { error } from 'console';
import { useNavigate } from 'react-router-dom';
import {User} from '../UserContext/User'


	export enum NotificationType {
		Message = 'Message',
		FriendReq = 'Friend Request',
	}

	export enum NotificationStatus {
		Accepted = 'Accepted',
		Declined = 'Declined',
		Pending = 'Pending',
	}

	export interface Notification {
		senderId: number;
		senderName: string;
		receiverId: number;
		receiverName: string;
		type: NotificationType;
		status: NotificationStatus;
		message: string | null;
	}

	const BACKEND_URL: string = import.meta.env.ORIGIN_URL_BACK || 'http://localhost.codam.nl:4000';

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
			console.error("NO NOTIFICATIONS FOUND!");
			return (null);
		  }	
	}

	export async function removeNotificationDb(noti:Notification): Promise<void> 
	{
		const request = new Request(BACKEND_URL + '/notification/removeNotification', {
			method: "POST",
			body: JSON.stringify({noti}),
		  });
		
		try
		{
			await fetch(request);
		}
		catch (error)
		{
			console.error("FAILED TO REMOVE NOTI");
		}	
	}

	export async function handleNotification(noti:Notification): Promise<void> 
	{
		const request = new Request(BACKEND_URL + '/notification/handleNotification', {
			method: "POST",
			body: JSON.stringify({noti}),
		  });
		
		try
		{
			await fetch(request);
		}
		catch (error)
		{
			console.error("FAILED TO HANDLE NOTIFICATION!");
		}	
	}