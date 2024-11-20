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

import SimulationService from './game.simulation.service';
import { GameMode } from './player.interface';


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
export default class SimulationGateway implements OnGatewayConnection, OnGatewayDisconnect{

	@WebSocketServer()
  server: Server;

  constructor(private simulationService: SimulationService) {};

	handleConnection(): void {

		if (this.simulationService.isRunning() == false)
			this.simulationService.startSession();
	}

	handleDisconnect(): void {
		
		this.simulationService.stopEngine();
	};

	@SubscribeMessage('playerInfo')
  addPlayer(@MessageBody() data: {playerId: number, nameNick: string}, 
						@ConnectedSocket() client: Socket): void {
		
    this.simulationService.addPlayer(client, data.playerId, data.nameNick);
	};

	@SubscribeMessage('initData')
  setInitData(@MessageBody() data: {sessionToken: string, mode: GameMode}): void {
		
    this.simulationService.setInitData(data.sessionToken, data.mode);
	};

	@SubscribeMessage('playerMove')
	movePaddle( @MessageBody() data: {playerNick: string; direction: 'up' | 'down'}): void {
	
		this.simulationService.movePaddle(data.playerNick, data.direction);
	};
}
