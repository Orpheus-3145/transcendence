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
import { UseFilters, UseInterceptors } from '@nestjs/common';

import { PaddleDirection, GameMode } from './game.types';
// import InitDataDTO from 'src/dto/initData.dto';
import PlayerDataDTO from 'src/dto/playerData.dto';
import PaddleDirectionDTO from 'src/dto/paddleDirection.dto';
import { RoomManagerService  } from './game.roomManager.service'; // logic for managing the rooms
import GameExceptionFilter from '../errors/GameExceptionFilter';
import LoggerInterceptor from '../log/log.interceptor'

@WebSocketGateway(
{ 
	namespace: process.env.WS_NS_SIMULATION, 
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
  },
	transports: ['websocket'],
})
@UseFilters(GameExceptionFilter)
// @UseInterceptors(LoggerInterceptor)
export default class RoomManagerGateway implements OnGatewayConnection, OnGatewayDisconnect{

	@WebSocketServer()
	server: Server;

	// Keeps a Map of SimulationService instances, one per game simulation
	constructor(private roomManager: RoomManagerService) {}
	
	// Called by default everytime a client connects to the websocket
	handleConnection(): void {};

	handleDisconnect(@ConnectedSocket() client: Socket): void { // Called by default everytime a client disconnects to the websocket
		this.roomManager.handleDisconnect(client); 
	};

	// Potential dead-end: can there be a situation where the playerData is sent before initData? This should not happen
	@SubscribeMessage('createRoomSinglePlayer')
	setInitData(@MessageBody() data: {sessionToken: string}): void {
		this.roomManager.createRoom(data.sessionToken, GameMode.single);
	};

	@SubscribeMessage('playerLeftGame')
	handlePlayerLeft(@ConnectedSocket() client: Socket): void {
		this.roomManager.handleDisconnect(client);
	};

	@SubscribeMessage('playerData')
	addPlayer(@MessageBody() data: PlayerDataDTO,
						@ConnectedSocket() client: Socket, mode: GameMode): void {
		this.roomManager.addPlayer(data.sessionToken, client, data.playerId, data.nameNick);
	};

	@SubscribeMessage('playerMovedPaddle')
	movePaddle( @MessageBody() data: PaddleDirectionDTO,
							@ConnectedSocket() client: Socket): void {
		this.roomManager.movePaddle(data.sessionToken, client.id, data.direction);
	};
};