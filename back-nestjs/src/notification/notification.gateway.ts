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
import { v4 as uuidv4 } from 'uuid';

import { NotificationService } from './notification.service';
import { UsersService } from 'src/users/users.service';
import GameDataDTO from 'src/dto/gameData.dto';
import { UserStatus } from 'src/dto/user.dto';
import { GameDifficulty, GameMode, PowerUpSelected } from 'src/game/types/game.enum';
import AppLoggerService from 'src/log/log.service';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';
import NotificationDTO, { NotificationType } from 'src/dto/notification.dto';
import { GameInvitation } from 'src/entities/gameInvitation.entity';
import { FriendRequest } from 'src/entities/friendRequest.entity';
import RoomManagerService from 'src/game/session/roomManager.service';
import User from 'src/entities/user.entity';
import { MessageNotification } from 'src/entities/messageNotification.entity';


export interface Websock {
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
		private readonly notificationService: NotificationService,
		@Inject(forwardRef(() => UsersService)) private readonly userService: UsersService,
		// private readonly userService: UsersService,
		private readonly logger: AppLoggerService,
		private readonly roomManager: RoomManagerService,
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

	getUser(userId: string): Websock {
		return (this.sockets.find((socket) => socket.userId === userId));
	}

	sendMessageNoti(noti: MessageNotification, receiverId: string)
	{
		var websock: Websock = this.getUser(receiverId);
		websock.client.emit('sendNoti', new NotificationDTO(noti));
	}

	@SubscribeMessage('getFromUser')
	async getFromUser(@ConnectedSocket() client: Socket, @MessageBody() data: { id: string }): Promise<void> 
	{
		let user: Websock = this.getUser(data.id);
		if (!user) {

			user = { client: client, userId: data.id };
			this.sockets.push(user);
			this.userService.setStatusId(user.userId, UserStatus.Online);
			this.logger.log(`User id: ${user.userId} is now online`);
		}
		const allNotifications = await this.notificationService.findAllNotifications();
		const notificationsDto: NotificationDTO[] = [];

		for (const notificationType in allNotifications) {
			for (const notification of allNotifications[notificationType])
				notificationsDto.push(new NotificationDTO(notification));
		}

		client.emit('getAllNotifications', notificationsDto);
	}

	@SubscribeMessage('sendFriendReq')
	async sendFriendReq(@MessageBody() data: { senderId: string, receiverId: string }): Promise<void> 
	{
		const [user, other] = await Promise.all([
			this.userService.getUserId(data.senderId),
			this.userService.getUserId(data.receiverId)
		]);

		const friendRequestNoti: FriendRequest = await this.notificationService.createFriendRequest(user, other);

		const socket: Socket = this.getUser(data.receiverId).client;
		if (friendRequestNoti)
			socket.emit('sendNoti', new NotificationDTO(friendRequestNoti));
		else
			socket.emit('sendNoti', null);		// NB handle this on front-end
	}

	@SubscribeMessage('acceptNotiFr')
	async acceptNotiFr(@MessageBody() data: { notificationId: number }): Promise<void>
	{
		const acceptedFriendRequest: FriendRequest = await this.notificationService.getFriendRequest(data.notificationId);
		const senderId: string = acceptedFriendRequest.sender.id.toString();
		const receiverId: string = acceptedFriendRequest.receiver.id.toString();

		await Promise.all([
			this.userService.updateNewFriendship(senderId, receiverId),
			this.notificationService.acceptFriendRequest(acceptedFriendRequest),
		]);
		var websockSender = this.getUser(senderId);
		var WebsockReceiver = this.getUser(receiverId);
		var frienlistSender = await this.userService.getFriendslistFromUser(senderId);
		var frienlistReceiver = await this.userService.getFriendslistFromUser(receiverId);
		
		if (websockSender !== undefined)
		{
			websockSender.client.emit('friendAddedIndex', frienlistSender);
			websockSender.client.emit('friendAddedOther', frienlistReceiver);
		}
		if (WebsockReceiver !== undefined)
		{
			WebsockReceiver.client.emit('friendAddedIndex', frienlistReceiver);
			WebsockReceiver.client.emit('friendAddedOther', frienlistSender);
		}
	}

	@SubscribeMessage('declineNotiFr')
	async declineNotiFr(@MessageBody() data: { notificationId: number })
	{
		const refusedFriendRequest: FriendRequest = await this.notificationService.getFriendRequest(data.notificationId);
	
		this.notificationService.refuseFriendRequest(refusedFriendRequest);
	}

	async removeFriend(user: User, newlistUser: string[], other: User, newlistOther: string[]): Promise<void>
	{
		var websockUser = this.getUser(user.id.toString());
		var websockOther = this.getUser(other.id.toString());
		
		if (websockUser != undefined)
		{
			websockUser.client.emit('friendRemoved', newlistUser);
		}
		if (websockOther != undefined)
		{
			websockOther.client.emit('friendRemoved', newlistOther);
		}
	}

	@SubscribeMessage('sendGameInvite')
	async sendGameInvite(@MessageBody() data: { senderId: string, receiverId: string, powerUps: number }): Promise<void> 
	{
		const [user, other] = await Promise.all([
			this.userService.getUserId(data.senderId),
			this.userService.getUserId(data.receiverId)
		]);

		const gameInvitationNoti = await this.notificationService.createGameInvitation(user, other, data.powerUps);

		const socket: Socket = this.getUser(data.receiverId).client;
		if (gameInvitationNoti)
			socket.emit('sendNoti', new NotificationDTO(gameInvitationNoti));
		else
			socket.emit('sendNoti', null);		// NB handle this on front-end
	}

	@SubscribeMessage('acceptNotiGI')
	async acceptNotiGI(@MessageBody() data: { notificationId: number })
	{
		const acceptedGameInvitation: GameInvitation = await this.notificationService.getGameInvitation(data.notificationId);
		const senderId: string = acceptedGameInvitation.sender.id.toString();
		const receiverId: string = acceptedGameInvitation.receiver.id.toString();
		
		await this.notificationService.acceptGameInvitation(acceptedGameInvitation);

		const initData: GameDataDTO = {
			sessionToken: uuidv4(),
			mode: GameMode.multi,
			difficulty: GameDifficulty.unset,
			extras: acceptedGameInvitation.powerUpsSelected,
		};
		this.roomManager.createRoom(initData);
		this.getUser(senderId).client.emit('goToGame', initData);
		this.getUser(receiverId).client.emit('goToGame', initData);
	}

	@SubscribeMessage('declineNotiGI')
	async declineNotiGI(@MessageBody() data: { notificationId: number })
	{
		const refusedGameInvitation: GameInvitation = await this.notificationService.getGameInvitation(data.notificationId);
	
		this.notificationService.refuseGameInvitation(refusedGameInvitation);
	}

	@SubscribeMessage('removeNotification')
	async removeNotification(@MessageBody() data: { notificationId: number, type: NotificationType })
	{
		this.notificationService.removeNotification(data.notificationId, data.type);		
	}

	async removeExistingNoti(user: User, other: User): Promise<void>
	{
		var websockUser = this.getUser(other.id.toString());

		if (websockUser === undefined)
			return ;

		websockUser.client.emit('removeNotis', user.id.toString());
	}

	async sendBlocked(other: User)
	{
		var websockUser = this.getUser(other.id.toString());

		if (websockUser === undefined)
			return ;

		websockUser.client.emit('updateBlocked', other.id.toString());
	}

	async sendUnBlocked(other: User)
	{
		var websockUser = this.getUser(other.id.toString());

		if (websockUser === undefined)
			return ;

		websockUser.client.emit('updateUnBlocked', other.id.toString());
	}

	async sendStatus(user: User, status: UserStatus)
	{
		for (const tmp of this.sockets)
		{
			tmp.client.emit('statusChanged', user, status);
		}
	}

	async sendUpdatedImage(user: User, image: string)
	{
		var websockUser: Websock = this.getUser(user.id.toString());
		if (websockUser !== undefined)
		{
			websockUser.client.emit('updateHeaderImage', image);
		}
		for (const tmp of this.sockets)
		{
			if (user.id.toString() !== tmp.userId)
				tmp.client.emit('updateImage', image);
		}
	}

	async sendUpdatedNickname(user: User, name: string)
	{
		for (const tmp of this.sockets)
		{
			if (user.id.toString() !== tmp.userId)
				tmp.client.emit('updateNickname', name);
		}			
	}
};