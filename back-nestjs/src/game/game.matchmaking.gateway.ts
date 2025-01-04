import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayDisconnect,
	SubscribeMessage,
	ConnectedSocket,
} from '@nestjs/websockets';
import { UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import MatchmakingService from './game.matchmaking.service';
import CustomExceptionFilter from '../errors/CustomExceptionFilter';

@WebSocketGateway({
	namespace: process.env.WS_NS_MATCHMAKING,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})
@UseFilters(CustomExceptionFilter)
export default class MatchmakingGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private matchmakingService: MatchmakingService) {}

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		
		this.matchmakingService.removePlayerFromQueue(client);
	}

	@SubscribeMessage('waiting')
	clientWaitingAdd(@ConnectedSocket() client: Socket): void {
		this.matchmakingService.addPlayerToQueue(client);
	};
};
