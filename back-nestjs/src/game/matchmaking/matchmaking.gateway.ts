import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import MatchmakingService from './matchmaking.service';
import { GameExceptionFilter } from 'src/errors/exceptionFilters';
import GameDataDTO from 'src/dto/gameData.dto';

@WebSocketGateway({
	namespace: process.env.WS_NS_MATCHMAKING,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})
@UseFilters(GameExceptionFilter)
export default class MatchmakingGateway implements OnGatewayDisconnect{
	@WebSocketServer()
	server: Server;

	constructor(private matchmakingService: MatchmakingService) {}

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		
		this.matchmakingService.removePlayerFromQueue(client);
	}

	@SubscribeMessage('waiting')
	clientWaitingAdd(@MessageBody() data: GameDataDTO, @ConnectedSocket() client: Socket): void {
		this.matchmakingService.addPlayerToQueue(client, data);
	}
}
