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
import { PaddleDirection, GameMode } from './game.types';

import InitDataDTO from 'src/dto/initData.dto';
import PlayerDataDTO from 'src/dto/playerData.dto';
import { RoomManager  } from './game.roommanager'; // logic for managing the rooms

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

	constructor(
	// private simulationService: SimulationService,
	private roomManager: RoomManager // Keeps a Map of SimulationService instances
	) {}

	handleConnection(): void { // Called by default everytime a client connecs to the websocket
	};

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		
		// this.simulationService.handleDisconnect(client);
		this.roomManager.handleDisconnect(client); 
	};

	@SubscribeMessage('initData')
  setInitData(@MessageBody() data: InitDataDTO): void {
		
    	// this.simulationService.setInitData(data.sessionToken, data.mode);
		this.roomManager.createRoom(data.sessionToken, data.mode);
	};

	@SubscribeMessage('playerData')
  addPlayer(@MessageBody() data: PlayerDataDTO,
						@ConnectedSocket() client: Socket, mode: GameMode): void {
		
		// this.simulationService.addPlayer(client, data.playerId, data.nameNick);
		// console.log(`sessionToken: ${data.sessionToken}`);
		let room = null;
		console.log(`room: ${room}`);
		room = this.roomManager.getRoom(data.sessionToken);
		console.log(`room: ${room}`);
		if (room) {
			console.log(`sessionToken: ${data.sessionToken}`);
			room.addPlayer(client, data.playerId, data.nameNick);
		} else { // Should not happen, but still precautionary
			this.roomManager.createRoom(data.sessionToken, mode);
			this.roomManager.getRoom(data.sessionToken)?.addPlayer(client, data.playerId, data.nameNick);
		}
	};

	@SubscribeMessage('playerMove')
	movePaddle( @MessageBody() data: { sessionToken: string; direction: PaddleDirection },
							@ConnectedSocket() client: Socket): void {

		this.roomManager.movePaddle(data.sessionToken, client.id, data.direction);
	};
};
