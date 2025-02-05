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
import { GameExceptionFilter } from 'src/errors/exceptionFilters';
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
		this.rematchService.leaveQueue(client);
	}

	@SubscribeMessage('joinQueue')
	joinQueue(@ConnectedSocket() client: Socket, @MessageBody() data: GameInitDTO): void {
		this.rematchService.joinQueue(client, data);
	}

	@SubscribeMessage('askForRematch')
	askForRematch(@ConnectedSocket() client: Socket): void {
		this.rematchService.askForRematch(client);
	}

	@SubscribeMessage('acceptRematch')
	acceptRematch(): void {
		this.rematchService.startGame();
	}

	@SubscribeMessage('abortRematch')
	abortRematch(@ConnectedSocket() client: Socket): void {
		this.rematchService.abortRematch(client);
	}
}
