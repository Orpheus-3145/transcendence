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
import { ChatDTO } from '../dto/chat.dto';


@WebSocketGateway( {
	namespace: process.env.WS_NS_CHAT, 		// Defines WebSocket namespace (e.g., "/chat")
	cors: {
		origin: process.env.URL_FRONTEND, 	// Allows frontend to connect
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],				// Uses only WebSocket (no polling)
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

  	// Handle channel creation
  	@SubscribeMessage('createChannel')
  	async handleCreateChannel(
  	  @MessageBody() chatDTO: ChatDTO, 
  	  @ConnectedSocket() client: Socket
  	): Promise<void> {
  	  try {
  	    // Assuming chatDTO contains channel information like title, type, users, etc.
  	    const newChannel = await this.chatService.createChannel(chatDTO);
		// Join the channel
		client.join(newChannel.channel_id.toString());
  	    // Emit back the created channel to the client
  	    this.server.emit('channelCreated', newChannel);
		// Send success message to the user who created the channel
		client.emit('createChannelSuccess', { message: 'Channel created successfully', channel: newChannel });
  	    console.log(`New channel created: ${newChannel.title}`);
  	  } catch (error) {
  	    console.error('Error creating channel:', error);
  	    client.emit('error', { message: 'Error creating channel' });
  	  }
  	}

	// Join a specific room/channel (ORIGINAL VERSION)
	// @SubscribeMessage('joinChannel')
	// async handleJoinChannel(
	// 	@MessageBody('channel') channel: string,
	// 	@ConnectedSocket() client: Socket,
	// ): Promise<void> {
	// 	console.log(`Client ${client.id} joined channel ${channel}`);
	// 	// Add the user to the database if needed
	// 	await this.chatService.addUserToChannel(+client.id, +channel);
	// 	// Join the channel
	// 	client.join(channel);
	// 	client.emit('joinedChannel', { channel });
	// }

	// Join a specific room/channel
	
	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@MessageBody() data: { channel_id: number, user_id: number},
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const {channel_id, user_id} = data;
		// console.log(`User ${client.id} joined channel ${channel}`);
		try {
			// Add the user to the database
			await this.chatService.addUserToChannel(user_id, channel_id);
			// Join the channel
			client.join(channel_id.toString());
			// Notify the user that they successfully joined
			client.emit('joinedChannel', { channel_id });
			// Notify all channel members
			this.server.to(channel_id.toString()).emit('userJoinedChannel', { user_id, channel_id });
			console.log(`User ${user_id} successfully joined channel ${channel_id}`);

		} catch (error) {
			console.error(`Error joining channel: ${error.message}`);
			client.emit('error', { message: 'Could not join channel' });
		}
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

	// Get all channels
	@SubscribeMessage('getChannels')
  	async handleGetChannels(@ConnectedSocket() client: Socket): Promise<void> {
    	try {
    	  const channels = await this.chatService.getAllChannels();
    	  client.emit('channelsList', channels);  // Emit back the channels to the client
    	} catch (error) {
    	  console.error('Error fetching channels:', error);
    	  client.emit('error', { message: 'Failed to fetch channels' });
    	}
  	}

	// Delete a channel
	@SubscribeMessage('deleteChannel')
	async handleDeleteChannel(
		@MessageBody() channel_id: number,
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		try {
			const deletedChannel = await this.chatService.deleteChannel(channel_id);
			if (deletedChannel) {
				console.log(`Channel deleted: ${deletedChannel.title}`);
				this.server.emit('channelDeleted', deletedChannel);
				// client.emit('channelDeleted', deletedChannel);
			} else {
				client.emit('error', { message: 'Channel not found or could not be deleted' });
			}
		} catch (error) {
			console.error(error);
			client.emit('error', { message: 'Error deleting channel' });
		}
	}

};