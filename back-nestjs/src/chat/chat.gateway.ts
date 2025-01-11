import { WebSocketGateway,
	WebSocketServer,
	OnGatewayDisconnect,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { UserDTO } from '../dto/user.dto';


@WebSocketGateway( {
	namespace: process.env.WS_NS_CHAT,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})

export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {

	@WebSocketServer()
	server: Server;

	constructor(private chatService: ChatService) {};

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
	}

	// Join a specific room/channel
	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@MessageBody('channel') channel: string,
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		console.log(`Client ${client.id} joined channel ${channel}`);

		// Add the user to the database if needed
		await this.chatService.addUserToChannel(+client.id, +channel);
	  
		// Join the channel
		client.join(channel);
		client.emit('joinedChannel', { channel });
	}

	// Leave a specific room/channel
	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@MessageBody('channel') channel: string,
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		client.leave(channel);
		console.log(`Client ${client.id} left channel ${channel}`);
		client.emit('leftChannel', { channel });
	}

	// Handle messages sent to a specific channel
	@SubscribeMessage('sendMessage')
	async handleMessage(
		@MessageBody('channel') channel: string,
		@MessageBody('message') message: string,
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		console.log(`Message to channel ${channel} from ${client.id}: ${message}`);

		// Save the message to the database
		await this.chatService.sendMessage(+client.id, +channel, message);

		// Broadcast to other clients in the channel
		this.server.to(channel).emit('newMessage', { message, channel, senderId: client.id });
	}
};