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
import { ChatExceptionFilter } from 'src/errors/exceptionFilters';
import { ChannelDTO } from 'src/dto/channel.dto';
import { DurationDTO, MutingUserDTO } from 'src/dto/mutingUser.dto';
import User from 'src/entities/user.entity';


@WebSocketGateway( {
	namespace: process.env.WS_NS_CHAT, 		// Defines WebSocket namespace (e.g., "/chat")
	cors: {
		origin: process.env.URL_FRONTEND, 	// Allows frontend to connect
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],				// Uses only WebSocket (no polling)
})
@UseFilters(ChatExceptionFilter)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {

	private _mutingTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
		const newChannel = await this.chatService.createChannel(channelDTO);
		// Join the channel
		client.join(newChannel.channel_id.toString());
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
		this.server.emit('joinedAvailableChannel', { user_id, channel_id, name, email });
		// this.server.to(channel_id.toString()).emit('joinedAvailableChannel', { user_id, channel_id, name, email });
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@MessageBody() data: { user_id: number, user_name: string, channel_id: number },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const { user_id, channel_id } = data;
		const channel: Channel | null = await this.chatService.removeUserFromChannel(user_id, channel_id);
		const channelDto: ChatRoomDTO | null = (channel !== null) ? new ChatRoomDTO(channel) : null;

		const keyMap: string = `${channel_id}-${user_id}`;
		// remove timeout for mute if it exists on that user
		if (this._mutingTimeouts.get(keyMap)) {
			clearTimeout(this._mutingTimeouts.get(keyMap));
			this._mutingTimeouts.delete(keyMap);
		}

		this.server.emit('leftChannel', {channelDto, userId: user_id});		
		client.leave(channel_id.toString());
	}

	@SubscribeMessage('kickUserFromChannel')
	async kickUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.removeUserFromChannel(data.userId, data.channelId);

		const keyMap: string = `${data.channelId}-${data.userId}`;
		// remove timeout for mute if it exists on that user
		if (this._mutingTimeouts.get(keyMap)) {
			clearTimeout(this._mutingTimeouts.get(keyMap));
			this._mutingTimeouts.delete(keyMap);
		}

		this.server.emit('userKicked', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('banUserFromChannel')
	async banUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.banUserFromChannel(data.userId, data.channelId);

		const keyMap: string = `${data.channelId}-${data.userId}`;
		// remove timeout for mute if it exists on that user
		if (this._mutingTimeouts.get(keyMap)) {
			clearTimeout(this._mutingTimeouts.get(keyMap));
			this._mutingTimeouts.delete(keyMap);
		}

		this.server.emit('userBanned', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('unbanUserFromChannel')
	async unbanUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.unbanUserFromChannel(data.userId, data.channelId);
		this.server.emit('userUnbanned', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('muteUserFromChannel')
	async muteUserFromChannel(@MessageBody() data: MutingUserDTO): Promise<void> 
	{
		await this.chatService.muteUserFromChannel(data.userId, data.channelId);

		const userToMute: User = await this.chatService.getUser(data.userId);
		const channel: Channel = await this.chatService.getChannel(data.channelId);

		this.startTimeoutForMuting(userToMute, channel, data.time);
		this.server.emit('userMuted', {id: channel.channel_id, userId: userToMute.id});
	}

	startTimeoutForMuting(userToMute: User, channel: Channel, time: DurationDTO): void {

		// in milliseconds
		const expirationBanTime: number = (time.days * 86400 + time.hours * 3600 + time.minutes * 60 + time.seconds) * 1000;
		// creating unique key: combination of userID (banned) and channelID
		const keyMap: string = `${channel.channel_id}-${userToMute.id}`;

		this._mutingTimeouts.set(keyMap, setTimeout(() => {
			this.unmuteUserFromChannel({userId: userToMute.id, channelId: channel.channel_id});

			const keyToRemove: string = `${channel.channel_id}-${userToMute.id}`;
			this._mutingTimeouts.delete(keyToRemove);
		}, expirationBanTime));
	}

	@SubscribeMessage('unmuteUserFromChannel')
	async unmuteUserFromChannel(@MessageBody() data: {userId: number, channelId: number}): Promise<void> 
	{
		await this.chatService.unmuteUserFromChannel(data.userId, data.channelId);

		const keyMap: string = `${data.channelId}-${data.userId}`;
		// remove timeout for mute if it exists on that user
		if (this._mutingTimeouts.get(keyMap)) {
			clearTimeout(this._mutingTimeouts.get(keyMap));
			this._mutingTimeouts.delete(keyMap);
		}

		this.server.emit('userUnmuted', {id: data.channelId, userId: data.userId});
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
	  @MessageBody() messageData: { sender_id: number, receiver_id: number, content: string }
	): Promise<void> {
		
		const { sender_id, receiver_id, content } = messageData;
		const newMessage = await this.chatService.createMessage(receiver_id, sender_id, content);
		// Emit the message to the specific channel
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
	async handleDeleteChannel(@MessageBody() channel_id: number): Promise<void> {

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