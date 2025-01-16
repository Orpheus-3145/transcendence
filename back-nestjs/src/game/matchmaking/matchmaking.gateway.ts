import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayDisconnect,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody,
} from '@nestjs/websockets';
import { UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { GameMode } from '../game.types';
import MatchmakingService from './matchmaking.service';
import { GameExceptionFilter } from '../../errors/exceptionFilters';

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
export default class MatchmakingGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private matchmakingService: MatchmakingService) {}

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		this.matchmakingService.removePlayerFromQueue(client);
	}
	// export interface InitData {
	// 	sessionToken: string;
	// 	mode: GameMode;
	// 	extras: boolean;
	// }
	@SubscribeMessage('waiting')
	clientWaitingAdd(
		@MessageBody() data: {sessionToken: string,	mode: GameMode,	extras: boolean},
		@ConnectedSocket() client: Socket,
	): void {
		this.matchmakingService.addPlayerToQueue(client, data.extras);
	}
}
