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
import { Notification } from 'src/entities/notification.entity';
import { User } from 'src/entities/user.entity';
import { UserStatus } from 'src/dto/user.dto';


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

	constructor(private notificationService: NotificationService, private userService: UsersService) {};

	handleConnection(client: Socket) {
		console.log(`Noti Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Noti Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('getFromUser')
	async handleNotificationEvent(@ConnectedSocket() client: Socket, @MessageBody() data: { id: string }): Promise<void> 
	{
		var Noti = await this.notificationService.findNotificationReceiver(data.id);
	  	client.emit('getNotifications', Noti);
	}

};