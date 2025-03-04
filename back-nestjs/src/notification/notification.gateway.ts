import { WebSocketGateway,
	WebSocketServer,
	OnGatewayDisconnect,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { NotificationService } from './notification.service';
import { UsersService } from 'src/users/users.service';
import { Notification, NotificationType } from 'src/entities/notification.entity';
import { UserStatus } from 'src/dto/user.dto';
import { HttpException } from '@nestjs/common';
import {  PowerUpSelected } from 'src/game/types/game.enum';
import User from 'src/entities/user.entity';

import { Inject, forwardRef } from '@nestjs/common';

interface Websock {
	client: Socket;
	userId: string;
}

@WebSocketGateway( {
	namespace: process.env.WS_NS_NOTIFICATION,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})

export class NotificationGateway implements OnGatewayDisconnect, OnGatewayConnection {

	@WebSocketServer()
	server: Server;
	private sockets: Websock[] = [];

	constructor(
		@Inject(forwardRef(() => NotificationService))
		private notificationService: NotificationService, 
		@Inject(forwardRef(() => UsersService))
		private userService: UsersService
	) {};

	handleConnection(client: Socket) {
		console.log(`Noti Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		var websock: Websock = this.sockets.find((socket) => socket.client.id === client.id);
		if (websock != undefined && websock != null)
		{
			this.userService.setStatus(websock.userId, UserStatus.Offline);
			console.log("Noti webSocket for user: " + websock.userId + " has been removed!");
		}
		this.sockets = this.sockets.filter((s) => s.client.id !== client.id);
	}

	@SubscribeMessage('getFromUser')
	async getFromUser(@ConnectedSocket() client: Socket, @MessageBody() data: { id: string }): Promise<void> 
	{
		var newwebsock: Websock = { client: client, userId: data.id };
		
		if (!this.sockets.find(sock => sock.userId === newwebsock.userId)) 
		{
			console.log("Adding new Noti webSocket for user:", data.id);
			this.sockets.push(newwebsock);
			this.userService.setStatus(data.id, UserStatus.Online);
		} 
		var Noti = await this.notificationService.findNotificationReceiver(data.id);
		client.emit('getAllNotifications', Noti);
	}

	async sendNotiToFrontend(Noti: Notification | null): Promise<void>
	{
		if (Noti == null)
			return ;
		var websock: Websock = this.sockets.find((socket) => socket.userId === Noti.receiverId.toString());
		if (websock === undefined)
		{
			return ;
		}
		websock.client.emit('sendNoti', Noti);
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(@MessageBody() data: { username: string, friend: string, message: string }): Promise<void> 
	{
		if (data.message.length == 0)
		{
			console.log("ERROR: message in sendMessage is invalid!");
			throw new HttpException('Bad Request', 400);
		}
		var user = await this.userService.getUserId(data.username);
		var other = await this.userService.getUserId(data.friend);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in sendMessage!");
			throw new HttpException('Not Found', 404);
		}
		var Noti = await this.notificationService.initMessage(user, other, data.message);
		this.sendNotiToFrontend(Noti);
	}

	@SubscribeMessage('sendFriendReq')
	async sendFriendReq(@MessageBody() data: { username: string, friend: string, message: string }): Promise<void> 
	{
		var user = await this.userService.getUserId(data.username);
		var other = await this.userService.getUserId(data.friend);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in sendGameInvite!");
			throw new HttpException('Not Found', 404);
		}
		var Noti = await this.notificationService.initRequest(user, other, NotificationType.friendRequest, null);
		this.sendNotiToFrontend(Noti);
	}

	@SubscribeMessage('sendGameInvite')
	async sendGameInvite(@MessageBody() data: { username: string, friend: string, powerUps: PowerUpSelected }): Promise<void> 
	{
		var user = await this.userService.getUserId(data.username);
		var other = await this.userService.getUserId(data.friend);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in sendGameInvite!");
			throw new HttpException('Not Found', 404);
		}
		var Noti = await this.notificationService.initRequest(user, other, NotificationType.gameInvite, data.powerUps);
		this.sendNotiToFrontend(Noti);
	}

	@SubscribeMessage('acceptNotiFr')
	async acceptNotiFr(@MessageBody() data: { sender: string, receiver: string})
	{
		await this.userService.friendRequestAccepted(data.sender, data.receiver);
		await this.notificationService.removeReq(data.sender, data.receiver, NotificationType.friendRequest);
		
		var se: User = await this.userService.findOneId(Number(data.sender));
		var re: User = await this.userService.findOneId(Number(data.receiver));
		var senderSock: Websock =  this.sockets.find((socket) => socket.userId === data.sender);
		var receiverSock: Websock =  this.sockets.find((socket) => socket.userId === data.receiver);
		senderSock.client.emit('friendAdded',re.intraId.toString());
		receiverSock.client.emit('friendAdded', se.intraId.toString());
	}

	@SubscribeMessage('declineNotiFr')
	async declineNotiFr(@MessageBody() data: { sender: string, receiver: string})
	{
		this.notificationService.removeReq(data.sender, data.receiver, NotificationType.friendRequest);
	}

	@SubscribeMessage('acceptNotiGI')
	async acceptNotiGI(@MessageBody() data: { sender: string, receiver: string})
	{
		var senderSock: Websock = this.sockets.find((socket) => socket.userId === data.sender);
		var receiverSock: Websock = this.sockets.find((socket) => socket.userId === data.receiver);
		
		await this.notificationService.startGameFromInvitation(senderSock.client, receiverSock.client, data.sender, data.receiver);
		await this.notificationService.removeReq(data.sender, data.receiver, NotificationType.gameInvite);
	}

	@SubscribeMessage('declineNotiGI')
	async declineNotiGI(@MessageBody() data: { sender: string, receiver: string})
	{
		this.notificationService.removeReq(data.sender, data.receiver, NotificationType.gameInvite);
	}

	@SubscribeMessage('removeNotification')
	async removeNotification(@MessageBody() data: { id: string})
	{
		var numb = Number(data.id);
		const noti = await this.notificationService.findNotificationId(numb);
		if (noti == null)
		{
			console.log("ERROR: notification not found in rmvNotification!");
			throw new HttpException('Not Found', 404);
		}
		this.notificationService.removeNotification(noti);		
	}
};