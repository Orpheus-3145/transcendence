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

	constructor(private notificationService: NotificationService, private userService: UsersService) {};

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
	async handleNotificationEvent(@ConnectedSocket() client: Socket, @MessageBody() data: { id: string }): Promise<void> 
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
		var websock: Websock = this.sockets.find((socket) => socket.userId === Noti.receiverId.toString());
		if (websock === undefined)
		{
			return ;
		}
		websock.client.emit('sendNoti', Noti);
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { username: string, friend: string, message: string }): Promise<void> 
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
	async sendFriendReq(@ConnectedSocket() client: Socket, @MessageBody() data: { username: string, friend: string, message: string }): Promise<void> 
	{
		var user = await this.userService.getUserId(data.username);
		var other = await this.userService.getUserId(data.friend);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in sendGameInvite!");
			throw new HttpException('Not Found', 404);
		}
		var Noti = await this.notificationService.initRequest(user, other, NotificationType.friendRequest);
		this.sendNotiToFrontend(Noti);
	}

	@SubscribeMessage('sendGameInvite')
	async sendGameInvite(@ConnectedSocket() client: Socket, @MessageBody() data: { username: string, friend: string}): Promise<void> 
	{
		var user = await this.userService.getUserId(data.username);
		var other = await this.userService.getUserId(data.friend);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in sendGameInvite!");
			throw new HttpException('Not Found', 404);
		}
		var Noti = await this.notificationService.initRequest(user, other, NotificationType.gameInvite);
		this.sendNotiToFrontend(Noti);
	}
};