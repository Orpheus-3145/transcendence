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
import { MessageDTO, ChatRoomDTO } from '../dto/chatRoom.dto'
import { Channel, ChannelMemberType, ChannelType } from '../entities/channel.entity';
import AppLoggerService from 'src/log/log.service';
import { UseFilters } from '@nestjs/common';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';
import { ChannelDTO } from 'src/dto/channel.dto';


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
		
		const {channel_id, name, user_id, email} = data;
		await this.chatService.addUserToChannel(channel_id, user_id);
		
		const updatedChannel = await this.chatService.getChannel(channel_id);
		
		const channelDto = new ChatRoomDTO(updatedChannel);

		client.join(channel_id.toString());

		this.server.emit('joinedChannel', { channelDto, user_id, channel_id, name, email });
	}

	@SubscribeMessage('joinAvailableChannel')
	async handleJoinAvailableChannel(
		@MessageBody() data: { channel_id: number, name: string, user_id: number, email: string },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		
		const {channel_id, name, user_id, email} = data;
		await this.chatService.addUserToChannel(channel_id, user_id );
		client.join(channel_id.toString());
		this.server.to(channel_id.toString()).emit('joinedAvailableChannel', { user_id, channel_id, name, email });
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@MessageBody() data: { user_id: number, user_name: string, channel_id: number },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const { user_id, channel_id } = data;
		const channel: Channel | null = await this.chatService.removeUserFromChannel(user_id, channel_id);
		const channelDto: ChatRoomDTO | null = (channel !== null) ? new ChatRoomDTO(channel) : null;

		this.server.emit('leftChannel', {channelDto, userId: user_id});		
		client.leave(channel_id.toString());
	}

	@SubscribeMessage('kickUserFromChannel')
	async kickUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.removeUserFromChannel(data.userId, data.channelId);
		this.server.emit('userKicked', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('banUserFromChannel')
	async banUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.banUserFromChannel(data.userId, data.channelId);
		this.server.emit('userBanned', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('unbanUserFromChannel')
	async unbanUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.unbanUserFromChannel(data.userId, data.channelId);
		this.server.emit('userUnbanned', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('muteUserFromChannel')
	async muteUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.muteUserFromChannel(data.userId, data.channelId);
		this.server.emit('userMuted', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('unmuteUserFromChannel')
	async unmuteUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.unmuteUserFromChannel(data.userId, data.channelId);
		this.server.emit('userUnmuted', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
	  @MessageBody() messageData: { sender_id: number, receiver_id: number, content: string }
	): Promise<void> {
		
		const { sender_id, receiver_id, content } = messageData;
		const newMessage = await this.chatService.createMessage(receiver_id, sender_id, content);
		// Emit the message to the specific channel
		if (newMessage)			// if newMessage === null if user is muted
			this.server.to(receiver_id.toString()).emit('newMessage', new MessageDTO(newMessage, receiver_id));
	}

	@SubscribeMessage('getChannels')
	async handleGetChannels(@ConnectedSocket() client: Socket): Promise<void> {

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

		await this.chatService.deleteChannel(channel_id);
		this.server.emit('channelDeleted', {channel_id});
	}

	@SubscribeMessage('changePrivacy')
	async handleChangePrivacy(
		@MessageBody() data: { channel_type: ChannelType, channel_id: number, password: string | null },
	): Promise<void> {

		const { channel_type, channel_id, password } = data;
		await this.chatService.changePrivacy(channel_id, channel_type, password);
		const channelUpdated: Channel = await this.chatService.getChannel(channel_id);
		
		this.server.emit('privacyChanged', new ChatRoomDTO(channelUpdated));
	}

	@SubscribeMessage('changeUserRole')
	async handleChangeUserRole(
		@MessageBody() data: { user_id: number; channel_id: number; new_role: ChannelMemberType; },
	): Promise<void> {
		const { user_id, channel_id, new_role } = data;
		await this.chatService.changeMemberRole(user_id, channel_id, new_role);
		if (new_role === ChannelMemberType.owner)
			await this.chatService.changeOwnershipChannel(user_id, channel_id);
		this.server.to(channel_id.toString()).emit('userRoleChanged', { userId: user_id, new_role, channelId: channel_id });
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