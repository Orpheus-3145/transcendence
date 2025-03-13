import { Inject, forwardRef, UseFilters, HttpStatus } from '@nestjs/common';
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
import {  fromMaskToArray, PowerUpSelected } from 'src/game/types/game.enum';
// import User from 'src/entities/user.entity';
import AppLoggerService from 'src/log/log.service';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';
import ExceptionFactory from 'src/errors/exceptionFactory.service';

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
@UseFilters(SessionExceptionFilter)
export class NotificationGateway implements OnGatewayDisconnect, OnGatewayConnection {

	@WebSocketServer()
	server: Server;
	private sockets: Websock[] = [];

	constructor(
		@Inject(forwardRef(() => NotificationService))
		private readonly notificationService: NotificationService, 
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(NotificationGateway.name);	
	};

	handleConnection(client: Socket) {
		this.logger.log(`New client connected : ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		var websock: Websock = this.sockets.find((socket) => socket.client.id === client.id);

		if (websock) {
			this.userService.setStatusId(websock.userId, UserStatus.Offline);
			this.logger.log(`User id: ${websock.userId} is now offline`);
		}

		this.sockets = this.sockets.filter((s) => s.client.id !== client.id);
	}

	@SubscribeMessage('getFromUser')
	async getFromUser(@ConnectedSocket() client: Socket, @MessageBody() data: { id: string }): Promise<void> 
	{
		if (!this.sockets.find(sock => sock.userId === data.id))
			{
			const newwebsock: Websock = { client: client, userId: data.id };
			this.sockets.push(newwebsock);
			this.userService.setStatusId(data.id, UserStatus.Online);
			this.logger.log(`User id: ${data.id} is now online`);
		}
		var Noti = await this.notificationService.findNotificationReceiver(data.id);
		client.emit('getAllNotifications', Noti);
	}

	sendNotiToFrontend(Noti: Notification | null): void
	{
		if (Noti == null)
			return ;
		var websock: Websock = this.sockets.find((socket) => socket.userId === Noti.receiverId.toString());
		if (websock === undefined)
			return ;

		websock.client.emit('sendNoti', Noti);
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(@MessageBody() data: { username: string, friend: string, message: string }): Promise<void> 
	{
		if (data.message.length == 0) {
			this.logger.warn(`Received an empty message`);
			return ;
		}
		const [user, other] = await Promise.all([
			this.userService.getUserId(data.username),
			this.userService.getUserId(data.friend)
		]);

		if (!user || !other)
			this.thrower.throwSessionExcp(`User with id: ${data.username} or ${data.friend} not found`,
				`${NotificationGateway.name}.${this.constructor.prototype.sendMessage.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR);

		const noti = await this.notificationService.initMessage(user, other, data.message);
		if (noti === null)
			this.logger.debug(`User ${user.nameNick} has blocked ${other.nameNick}, message not sent`)
		else {
			this.sendNotiToFrontend(noti);
			this.logger.log(`Sending message from ${user.nameNick} to ${other.nameNick}, content: '${data.message}'`)
		}
	}

	@SubscribeMessage('sendFriendReq')
	async sendFriendReq(@MessageBody() data: { username: string, friend: string, message: string }): Promise<void> 
	{
		const [user, other] = await Promise.all([
			this.userService.getUserId(data.username),
			this.userService.getUserId(data.friend)
		]);

		if (!user || !other)
			this.thrower.throwSessionExcp(`User with id: ${data.username} or ${data.friend} not found`,
				`${NotificationGateway.name}.${this.constructor.prototype.sendFriendReq.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR);

		const noti = await this.notificationService.initRequest(user, other, NotificationType.friendRequest, null);
		if (noti === null)
			this.logger.debug(`User ${user.nameNick} has blocked ${other.nameNick}, friend invite not sent`)
		else {
			this.sendNotiToFrontend(noti);
			this.logger.log(`Sending friend request from ${user.nameNick} to ${other.nameNick}`)
		}
	}

	@SubscribeMessage('sendGameInvite')
	async sendGameInvite(@MessageBody() data: { username: string, friend: string, powerUps: PowerUpSelected }): Promise<void> 
	{
		const [user, other] = await Promise.all([
			this.userService.getUserId(data.username),
			this.userService.getUserId(data.friend)
		]);
		if (!user || !other)
			this.thrower.throwSessionExcp(`User with id: ${data.username} or ${data.friend} not found`,
				`${NotificationGateway.name}.${this.constructor.prototype.sendGameInvite.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR);

		const noti = await this.notificationService.initRequest(user, other, NotificationType.gameInvite, data.powerUps);
		if (noti === null)
			this.logger.debug(`User ${user.nameNick} has blocked ${other.nameNick}, game invite not sent`)
		else {
			this.sendNotiToFrontend(noti);
			this.logger.log(`Sending game invite from ${user.nameNick} to ${other.nameNick}, powerups: ${fromMaskToArray(data.powerUps)}`)
		}
	}

	@SubscribeMessage('acceptNotiFr')
	async acceptNotiFr(@MessageBody() data: { sender: string, receiver: string})
	{
		await Promise.all([
			this.userService.friendRequestAccepted(data.sender, data.receiver),
			this.notificationService.removeReq(data.sender, data.receiver, NotificationType.friendRequest)
		]);
		const [se, re] = await Promise.all([
			this.userService.findOneId(Number(data.sender)),
			this.userService.findOneId(Number(data.receiver))
		]);
		const senderSock: Websock =  this.sockets.find((socket) => socket.userId === data.sender);
		const receiverSock: Websock =  this.sockets.find((socket) => socket.userId === data.receiver);
		senderSock.client.emit('friendAdded',re.intraId.toString());
		receiverSock.client.emit('friendAdded', se.intraId.toString());
	}

	@SubscribeMessage('declineNotiFr')
	async declineNotiFr(@MessageBody() data: { sender: string, receiver: string})
	{
		this.logger.log(`User ${data.sender} refused friend invite from ${data.receiver}`)
		this.notificationService.removeReq(data.sender, data.receiver, NotificationType.friendRequest);
	}

	@SubscribeMessage('acceptNotiGI')
	async acceptNotiGI(@MessageBody() data: { sender: string, receiver: string})
	{
		var senderSock: Websock = this.sockets.find((socket) => socket.userId === data.sender);
		var receiverSock: Websock = this.sockets.find((socket) => socket.userId === data.receiver);

		this.logger.log(`User ${data.sender} accepted game invite from ${data.receiver}`)
		await this.notificationService.removeReq(data.sender, data.receiver, NotificationType.gameInvite);
		await this.notificationService.startGameFromInvitation(senderSock.client, receiverSock.client, data.sender, data.receiver);
	}

	@SubscribeMessage('declineNotiGI')
	async declineNotiGI(@MessageBody() data: { sender: string, receiver: string})
	{
		this.logger.log(`User ${data.sender} refused game invite from ${data.receiver}`)
		this.notificationService.removeReq(data.sender, data.receiver, NotificationType.gameInvite);
	}

	@SubscribeMessage('removeNotification')
	async removeNotification(@MessageBody() data: { id: string})
	{
		var numb = Number(data.id);
		const noti = await this.notificationService.findNotificationId(numb);
		
		if (noti === null)
			this.thrower.throwSessionExcp(`Notification with id: ${data.id} not found`,
				`${NotificationGateway.name}.${this.constructor.prototype.removeNotification.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR);

		this.notificationService.removeNotification(noti);		
	}
};