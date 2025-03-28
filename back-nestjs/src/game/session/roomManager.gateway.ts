import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters } from '@nestjs/common';

import PlayerDataDTO from 'src/dto/playerData.dto';
import PaddleDirectionDTO from 'src/dto/paddleDirection.dto';
import RoomManagerService from './roomManager.service';
import { GameExceptionFilter } from 'src/errors/exceptionFilters';
import GameDataDTO from 'src/dto/gameData.dto';

@WebSocketGateway({
	namespace: process.env.WS_NS_SIMULATION,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})
@UseFilters(GameExceptionFilter)
export default class RoomManagerGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private roomManager: RoomManagerService) {}

	handleConnection(): void {}

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		this.roomManager.handleDisconnect(client);
	}

	@SubscribeMessage('createRoomSinglePlayer')
	setInitData(@MessageBody() data: GameDataDTO): void {
		this.roomManager.createRoom(data);
	}

	@SubscribeMessage('playerData')
	addPlayer(@MessageBody() data: PlayerDataDTO, @ConnectedSocket() client: Socket): void {
		this.roomManager.addPlayer(data, client);
	}

	@SubscribeMessage('playerMovedPaddle')
	movePaddle(@MessageBody() data: PaddleDirectionDTO, @ConnectedSocket() client: Socket): void {
		this.roomManager.movePaddle(data, client);
	}

	@SubscribeMessage('askForRematch')
	askForRematch(@MessageBody() data: {sessionToken: string}, @ConnectedSocket() client: Socket): void {
		this.roomManager.askForRematch(data.sessionToken, client);
	}

	@SubscribeMessage('acceptRematch')
	acceptRematch(@MessageBody() data: {sessionToken: string}, @ConnectedSocket() client: Socket): void {
		this.roomManager.acceptRematch(data.sessionToken, client);
	}

	@SubscribeMessage('abortRematch')
	abortRematch(@MessageBody() data: {sessionToken: string}, @ConnectedSocket() client: Socket): void {
		this.roomManager.abortRematch(data.sessionToken, client);
	}

	@SubscribeMessage('playerIsActive')
	updateIdleInterval(@MessageBody() data: PlayerDataDTO) {
		this.roomManager.updateIdleInterval(data);
	}
}
