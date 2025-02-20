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

import MatchmakingService from './matchmaking.service';
import { GameExceptionFilter } from 'src/errors/exceptionFilters';
import GameDataDTO from 'src/dto/gameData.dto';
import { PowerUpType } from '../types/game.enum';

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
export default class MatchmakingGateway{		//  implements OnGatewayDisconnect 
	@WebSocketServer()
	server: Server;

	constructor(private matchmakingService: MatchmakingService) {}

	// handleDisconnect(@ConnectedSocket() client: Socket): void {
	// 	this.matchmakingService.removePlayerFromQueue(client);
	// }

	@SubscribeMessage('waiting')
	clientWaitingAdd(@MessageBody() data: GameDataDTO, @ConnectedSocket() client: Socket): void {
		this.matchmakingService.addPlayerToQueue(client, data);
	}

	@SubscribeMessage('createInvitation')
	createInvitation(@MessageBody() powerUps: Array<PowerUpType>, @ConnectedSocket() client: Socket): void {
		this.matchmakingService.createGameInvitation(client, powerUps);
	}

	@SubscribeMessage('acceptInvitation')
	acceptInvitation(@MessageBody() sessionToken: string, @ConnectedSocket() client: Socket): void {
		this.matchmakingService.acceptGameInvitation(client, sessionToken);
	}

	@SubscribeMessage('refuseInvitation')
	refuseInvitation(@MessageBody() sessionToken: string): void {
		this.matchmakingService.refuseGameInvitation(sessionToken);
	}
}
