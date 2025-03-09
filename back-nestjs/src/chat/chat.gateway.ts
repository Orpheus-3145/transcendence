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
import { ChatDTO } from '../dto/chat.dto';
import { Channel, ChannelMemberType, ChannelType } from '../entities/chat.entity';

// export interface ConnectedUser {
// 	clientSocket: Socket,
// 	intraId: number,
// 	nameIntra: string,
// }

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

	// private connectedUsers: Array<ConnectedUser> = new Array(); 
	private connectedClients = new Map<string, Socket>();
	
	constructor(private chatService: ChatService) {};
	
	handleConnection(client: Socket) {

		this.connectedClients.set(client.id, client);
		this.server.emit('clientsUpdated', Array.from(this.connectedClients.keys()));
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected to ChatGateway: ${client.id}`);
		this.connectedClients.delete(client.id);
		console.log("Connected clients after disconnect from ChatGateway:", Array.from(this.connectedClients.keys()));
		this.server.emit('clientsUpdated', Array.from(this.connectedClients.keys()));
	}

	// getAllConnectedClients(): string[] {
	// 	return Array.from(this.connectedClients.keys());
	// }

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
		@MessageBody() data: { channel_id: number, name: string, user_id: number, email: string },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const {channel_id, name, user_id, email} = data;
		// console.log(`User ${client.id} joined channel ${channel}`);
		try {
			await this.chatService.addUserToChannel(channel_id, user_id);
			client.join(channel_id.toString());
			// client.emit('joinedChannel', { user_id, channel_id, name, email });
			this.server.to(channel_id.toString()).emit('joinedChannel', { user_id, channel_id, name, email });
			console.log(`User ${user_id} successfully joined channel ${channel_id}`);
		} catch (error) {
			console.error(`Error joining channel: ${error.message}`);
			client.emit('joinChannelError', { message: 'Could not join channel' });
		}
	}

	@SubscribeMessage('joinAvailableChannel')
	async handleJoinAvailableChannel(
		@MessageBody() data: { channel_id: number, name: string, user_id: number, email: string },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const {channel_id, name, user_id, email} = data;
		try {
			await this.chatService.addUserToChannel(channel_id, user_id );
			client.join(channel_id.toString());
			client.emit('joinedAvailableChannel', { user_id, channel_id, name, email });
			console.log(`User ${user_id} successfully joined channel ${channel_id}`);
		} catch (error) {
			console.error(`Error joining channel: ${error.message}`);
			client.emit('joinChannelError', { message: 'Could not join channel' });
		}
	}

	// Leave a specific room/channel
	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@MessageBody() data: { user_id: number, channel_id: number },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		try {
			const { user_id, channel_id } = data;
			await this.chatService.removeUserFromChannel(user_id, channel_id);
			this.server.to(channel_id.toString()).emit('leftChannel', { user_id, channel_id });
			client.leave(channel_id.toString());
			console.log(`Client ${client.id} left channel ${ channel_id }`);
		} catch (error) {
			console.error(`Error leaving channel: ${error.message}`);
			client.emit('leavingChannelError', { message: 'Could not leave channel' });
		}
	}

	@SubscribeMessage('kickUserFromChannel')
	async kickUserFromChannel(@MessageBody() data: {userid: number, channelid: number}): Promise<void> 
	{
		this.chatService.removeUserFromChannel(data.userid, data.channelid);
		this.server.emit('userKicked', {id: data.channelid, userId: data.userid});
	}

	@SubscribeMessage('banUserFromChannel')
	async banUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		this.chatService.banUserFromChannel(data.userid, data.channelId);
		this.server.emit('userBanned', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('unbanUserFromChannel')
	async unbanUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		this.chatService.unbanUserFromChannel(data.userid, data.channelId);
		this.server.emit('userUnbanned', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('muteUserFromChannel')
	async muteUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		this.chatService.muteUserFromChannel(data.userid, data.channelId);
		this.server.emit('userMuted', {id: data.channelId, userId: data.userid});

	}

	@SubscribeMessage('unmuteUserFromChannel')
	async unmuteUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		this.chatService.unmuteUserFromChannel(data.userid, data.channelId);
		this.server.emit('userUnmuted', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
	  @MessageBody() messageData: { sender_id: number, receiver_id: number, content: string },
	  @ConnectedSocket() client: Socket,
	): Promise<void> {
	  try {
		const { sender_id, receiver_id, content } = messageData;
	
		const newMessage = await this.chatService.createMessage(receiver_id, sender_id, content);
		// Emit the message to the specific channel
		this.server.to(receiver_id.toString()).emit('newMessage', newMessage);
		console.log(`Message sent from user (id: ${sender_id}) (socket: ${client.id}) to channel (id: ${receiver_id}) : ${content}`);
	  } catch (error) {
		console.error('Error sending message:', error);
		client.emit('error', { message: 'Error sending message' });
	  }
	}

	// // Handle messages sent to a specific channel
	// @SubscribeMessage('sendMessage')
	// async handleMessage(
	// 	@MessageBody() data: {client_id: number, channel_id: number, message: string,}, 
	// 	@ConnectedSocket() client: Socket,
	// ): Promise<void> {
	// 	const {client_id, channel_id, message,} = data; 

	// 	console.log(`Message to channel_id ${channel_id} from user_id ${client_id} (socket id: ${client.id}): ${message}`);

	// 	// Save the message to the database
	// 	const savedMessage = await this.chatService.sendMessage(client_id, channel_id, message);
	// 	console.log('New message:', savedMessage);

	// 	// const updatedMessages = await this.chatService.getMessagesForChannel(channel_id);

	// 	// console.log('updatedMessages: ', updatedMessages);

	// 	// this.server.emit('newMessage', {
	// 	// 	channel_id,
	// 	// 	messages: updatedMessages, // Send the full list of messages for the channel
	// 	// });

	// 	// this.server.emit('newMessage', { channel_id, message: savedMessage });
		
	// 	this.server.to(channel_id.toString()).emit('newMessage', {
	// 		channel_id,
	// 		message: savedMessage, // Send only the new message
	// 	});

	// 	// // Broadcast the updated messages to clients in the channel
  	// 	// this.server.to(channel_id.toString()).emit('newMessage', {
  	// 	// 	channel_id,
  	// 	// 	messages: updatedMessages, // Send the full list of messages for the channel
  	// 	// });
	// }

	// // Handle messages sent to a specific channel
	// @SubscribeMessage('sendMessage')
	// // async handleMessage(
	// 	// @MessageBody('channel') channel: string,
		// // @MessageBody('message') message: string,
	// 	// @ConnectedSocket() client: Socket,
	// // ): Promise<void> {
	// 	// console.log(`Message to channel ${channel} from ${client.id}: ${message}`);

		// Save the message to the database
		// // await this.chatService.sendMessage(+client.id, +channel, message);

		// Broadcast to other clients in the channel
	// 	// this.server.to(channel).emit('newMessage', { message, channel, senderId: client.id });
	// // }

	// Get all channels
	@SubscribeMessage('getChannels')
	async handleGetChannels(@ConnectedSocket() client: Socket): Promise<void> {
		try {
			const channels: Channel[] = await this.chatService.getAllChannels();
			const chatDto: ChatDTO[] = [];
			for (const chat of channels)
				chatDto.push(new ChatDTO(chat));
			client.emit('channelsList', chatDto);  // Emit back the channels to the client
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
				this.server.emit('channelDeleted', {channel_id});
			} else {
				client.emit('error', { message: 'Channel not found or could not be deleted' });
			}
		} catch (error) {
			console.error(error);
			client.emit('error', { message: 'Error deleting channel' });
		}
	}

	// Change privacy
	@SubscribeMessage('changePrivacy')
	async handleChangePrivacy(
		@MessageBody() data: { channel_type: ChannelType, channel_id: number, password: string | null },
		@ConnectedSocket() client: Socket,
	): Promise<{ success: boolean, updatedChannel?: Channel, message?: string }> {
		const { channel_type, channel_id, password } = data;
		try {
			const updatedChannel: Channel = await this.chatService.changePrivacy(channel_id, channel_type, password);
			if (updatedChannel) {
				console.log(`Channel privacy changed (db) to: ${data.channel_type}`);
				// this.server.to(channel_id.toString()).emit('privacyChanged', updatedChannel);
				this.server.emit('privacyChanged', updatedChannel);
				return {success: true, updatedChannel};
			} else {
				client.emit('error', { message: 'Channel privacy could not be changed!' });
				return { success: false, message: 'Channel privacy could not be changed!' };
			}
		} catch (error) {
			console.error(error);
			client.emit('error', { message: 'Channel privacy could not be changed!' });
			return { success: false, message: 'Channel privacy could not be changed!' };
		}
	}

	// Change user role
	@SubscribeMessage('changeUserRole')
	async handleChangeUserRole(
		@MessageBody() data: { user_id: number; channel_id: number; new_role: ChannelMemberType; },
		@ConnectedSocket() client: Socket,
	): Promise<{ success: boolean; message?: string }> {
		const { user_id, channel_id, new_role } = data;
		try {
			const updated = await this.chatService.changeUserRole(user_id, channel_id, new_role);
			if (updated) {
				console.log(`User with id ${user_id} role changed (db) to ${new_role}`);
				this.server.to(channel_id.toString()).emit('userRoleChanged', { user_id, new_role });
				// this.server.emit('userRoleChanged', { user_id, new_role });
				return { success: true, message: 'User role updated successfully' };
			} else {
				client.emit('error', { message: 'User role could not be changed' });
				return { success: false, message: 'User role could not be changed' };
			}
		} catch (error) {
			console.error(error);
			client.emit('error', { message: 'Error changing user role' });
			return { success: false, message: 'Error changing user role' };
		}
	}
	

	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() roomId: number,
		@ConnectedSocket() client: Socket) {

		client.join(roomId.toString());
		console.log(`Socket ${client.id} joined room ${roomId}`);
	}

	@SubscribeMessage('joinRooms')
	handleJoinRooms(
		@MessageBody() roomIds: number[],
		@ConnectedSocket() client: Socket) {

		roomIds.forEach(roomId => {
			client.join(roomId.toString());
			console.log(`Socket ${client.id} joined room ${roomId}`);
		})
	}

	// @SubscribeMessage('changeUserRole')
	// async handleChangeUserRole(
	// 	@MessageBody() data: {channel_id: number, user_id: number, role: string},
	// 	@ConnectedSocket() client: Socket,
	// ): Promise<void> {
	// 	const [channel_id, intraId, ]
	// 	try {

	// 	} catch (error) {}
	// }

};