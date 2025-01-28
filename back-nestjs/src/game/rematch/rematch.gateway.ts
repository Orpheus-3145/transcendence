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

import RematchService from './rematch.service';
import { GameExceptionFilter } from '../../errors/exceptionFilters';
import GameInitDTO from 'src/dto/gameInit.dto';

@WebSocketGateway({
	namespace: process.env.WS_NS_REMATCH,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})
@UseFilters(GameExceptionFilter)
export default class RematchGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private rematchService: RematchService) {}

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		
		// emit to other player that client left the room
	}

	@SubscribeMessage('joinQueue')
	joinQueue(@MessageBody() data: GameInitDTO, @ConnectedSocket() client: Socket): void {
		this.rematchService.joinQueue(client, data);
	}

	@SubscribeMessage('playAgain')
	playAgain(@ConnectedSocket() client: Socket): void {
		this.rematchService.playAgain(client);
	}

	@SubscribeMessage('acceptPlayAgain')
	acceptPlayAgain(@ConnectedSocket() client: Socket): void {
		this.rematchService.startGame();
	}
}
