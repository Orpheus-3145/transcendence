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
import { ChatMessageDTO, ChatRoomDTO } from '../dto/chatRoom.dto'
import { Channel, ChannelMemberType, ChannelType } from '../entities/channel.entity';
import AppLoggerService from 'src/log/log.service';
import { UseFilters } from '@nestjs/common';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';
import { ChannelDTO } from 'src/dto/channel.dto';
import { MessageDTO } from 'src/dto/message.dto';


@WebSocketGateway( {
	namespace: process.env.WS_NS_CHAT, 		// Defines WebSocket namespace (e.g., "/chat")
	cors: {
		origin: process.env.URL_FRONTEND, 	// Allows frontend to connect
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],				// Uses only WebSocket (no polling)
})
@UseFilters(SessionExceptionFilter)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	private connectedClients = new Map<string, Socket>();
	
	constructor(
		private readonly chatService: ChatService,
		private readonly logger: AppLoggerService
	) {
		this.logger.setContext(ChatGateway.name);	
	};
	
	handleConnection(client: Socket) {

		this.connectedClients.set(client.id, client);
		this.server.emit('clientsUpdated', Array.from(this.connectedClients.keys()));
	}

	handleDisconnect(client: Socket) {
		this.logger.debug(`Client disconnected to ChatGateway: ${client.id}`);
		this.connectedClients.delete(client.id);

		this.logger.debug("Connected clients after disconnect from ChatGateway:", Array.from(this.connectedClients.keys()));
		this.server.emit('clientsUpdated', Array.from(this.connectedClients.keys()));
	}

	@SubscribeMessage('createChannel')
	async handleCreateChannel(@MessageBody() channelDTO: ChannelDTO, @ConnectedSocket() client: Socket): Promise<void> {
		
		console.log('calling handleCreateChannel');
		// Assuming channelDTO contains channel information like title, type, users, etc.
		let newChannel = await this.chatService.createChannel(channelDTO);
		// Join the channel
		client.join(newChannel.channel_id.toString());
		// re-doing the query because the relations are needed
		newChannel = await this.chatService.getChannel(newChannel.channel_id);
		// Emit back the created channel to the client
		this.server.emit('channelCreated', new ChatRoomDTO(newChannel));
		// Send success message to the user who created the channel
		client.emit('createChannelSuccess', { message: 'Channel created successfully', channel: newChannel });
	}

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@MessageBody() data: { channel_id: number, name: string, user_id: number, email: string },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		
		console.log('calling joinChannel');
		const {channel_id, name, user_id, email} = data;
		await this.chatService.addUserToChannel(channel_id, user_id);
		client.join(channel_id.toString());
		this.server.to(channel_id.toString()).emit('joinedChannel', { user_id, channel_id, name, email });
	}

	@SubscribeMessage('joinAvailableChannel')
	async handleJoinAvailableChannel(
		@MessageBody() data: { channel_id: number, name: string, user_id: number, email: string },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		
		console.log('calling joinAvailableChannel');
		const {channel_id, name, user_id, email} = data;
		await this.chatService.addUserToChannel(channel_id, user_id );
		client.join(channel_id.toString());
		client.emit('joinedAvailableChannel', { user_id, channel_id, name, email });
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@MessageBody() data: { user_id: number, channel_id: number },
		@ConnectedSocket() client: Socket,
	): Promise<void> {

		console.log('calling leaveChannel');
		const { user_id, channel_id } = data;
		await this.chatService.removeUserFromChannel(user_id, channel_id);
		this.server.to(channel_id.toString()).emit('leftChannel', { user_id, channel_id });
		client.leave(channel_id.toString());
	}

	@SubscribeMessage('kickUserFromChannel')
	async kickUserFromChannel(@MessageBody() data: {userid: number, channelid: number}): Promise<void> 
	{
		console.log('calling kickUserFromChannel');
		await this.chatService.removeUserFromChannel(data.userid, data.channelid);
		this.server.emit('userKicked', {id: data.channelid, userId: data.userid});
	}

	@SubscribeMessage('banUserFromChannel')
	async banUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		console.log('calling banUserFromChannel');
		await this.chatService.banUserFromChannel(data.userid, data.channelId);
		this.server.emit('userBanned', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('unbanUserFromChannel')
	async unbanUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		console.log('calling unbanUserFromChannel');
		await this.chatService.unbanUserFromChannel(data.userid, data.channelId);
		this.server.emit('userUnbanned', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('muteUserFromChannel')
	async muteUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		console.log('calling muteUserFromChannel');
		await this.chatService.muteUserFromChannel(data.userid, data.channelId);
		this.server.emit('userMuted', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('unmuteUserFromChannel')
	async unmuteUserFromChannel(@MessageBody() data: {userid: number, channelId: number}): Promise<void> 
	{
		console.log('calling unmuteUserFromChannel');
		await this.chatService.unmuteUserFromChannel(data.userid, data.channelId);
		this.server.emit('userUnmuted', {id: data.channelId, userId: data.userid});
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
	  @MessageBody() messageData: { sender_id: number, receiver_id: number, content: string }
	): Promise<void> {
		
		console.log('calling sendMessage');
		const { sender_id, receiver_id, content } = messageData;
		const newMessage = await this.chatService.createMessage(receiver_id, sender_id, content);
		// Emit the message to the specific channel
		this.server.to(receiver_id.toString()).emit('newMessage', new MessageDTO(newMessage));
	}

	@SubscribeMessage('getChannels')
	async handleGetChannels(@ConnectedSocket() client: Socket): Promise<void> {

		console.log('calling getChannels');
		const channels: Channel[] = await this.chatService.getAllChannels();

		const chatDto: ChatRoomDTO[] = [];
		for (const chat of channels)
			chatDto.push(new ChatRoomDTO(chat));
	
		client.emit('channelsList', chatDto);  // Emit back the channels to the client
	}

	@SubscribeMessage('deleteChannel')
	async handleDeleteChannel(
		@MessageBody() channel_id: number,
		@ConnectedSocket() client: Socket,
	): Promise<void> {

		console.log('calling deleteChannel');
		await this.chatService.deleteChannel(channel_id);
		this.server.emit('channelDeleted', {channel_id});
	}

	@SubscribeMessage('changePrivacy')
	async handleChangePrivacy(
		@MessageBody() data: { channel_type: ChannelType, channel_id: number, password: string | null },
	): Promise<void> {

		console.log('calling changePrivacy');
		const { channel_type, channel_id, password } = data;
		const channelToUpdate: Channel = await this.chatService.getChannel(channel_id);
		await this.chatService.changePrivacy(channelToUpdate, channel_type, password);
		this.server.emit('privacyChanged', new ChatRoomDTO(channelToUpdate));
	}

	@SubscribeMessage('changeUserRole')
	async handleChangeUserRole(
		@MessageBody() data: { user_id: number; channel_id: number; new_role: ChannelMemberType; },
	): Promise<void> {
		
		console.log('calling changeUserRole');
		const { user_id, channel_id, new_role } = data;
		await this.chatService.changeMemberRole(user_id, channel_id, new_role);
		if (new_role === ChannelMemberType.owner)
			await this.chatService.changeOwnershipChannel(user_id, channel_id);
	
		this.server.to(channel_id.toString()).emit('userRoleChanged', { user_id, new_role });
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(@MessageBody() roomId: number, @ConnectedSocket() client: Socket) {

		client.join(roomId.toString());
		this.logger.debug(`Socket ${client.id} joined room ${roomId}`);
	}

	@SubscribeMessage('joinRooms')
	handleJoinRooms(@MessageBody() roomIds: number[], @ConnectedSocket() client: Socket) {

		roomIds.forEach(roomId => {
			client.join(roomId.toString());
			this.logger.debug(`Socket ${client.id} joined room ${roomId}`);
		})
	}

	@SubscribeMessage('checkPasswordChannel')
	async checkPasswordChannel(
		@MessageBody() data: { channelId: number, inputPassword: string },
		@ConnectedSocket() client: Socket
	) {

		const status: boolean = await this.chatService.verifyPassword(data.inputPassword, data.channelId);
		client.emit('verifyPassword', status);
	}
};