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
import { PaddleDirection } from './game.types';

import InitDataDTO from 'src/dto/initData.dto';
import PlayerDataDTO from 'src/dto/playerData.dto';


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

		if (this.simulationService.isWaiting() === false)
			this.simulationService.startWaiting();
	};

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		
		this.simulationService.handleDisconnect(client);
	};

	@SubscribeMessage('initData')
  setInitData(@MessageBody() data: InitDataDTO): void {
		
    this.simulationService.setInitData(data.sessionToken, data.mode);
	};

	@SubscribeMessage('playerData')
  addPlayer(@MessageBody() data: PlayerDataDTO, 
						@ConnectedSocket() client: Socket): void {
		
    this.simulationService.addPlayer(client, data.playerId, data.nameNick);
	};

	@SubscribeMessage('playerMove')
	movePaddle( @MessageBody() data: PaddleDirection,
							@ConnectedSocket() client: Socket): void {
	
		this.simulationService.movePaddle(client.id, data);
	};
};
