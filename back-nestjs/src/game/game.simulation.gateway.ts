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
import { GameMode } from './game.types';

import InitDataDTO from 'src/dto/initData.dto';
import PlayerDataDTO from 'src/dto/playerData.dto';
import PaddleDirectionDTO from 'src/dto/paddleDirection.dto';
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
	private roomManager: RoomManager // Keeps a Map of SimulationService instances, one per game simulation
	) {}

	handleConnection(): void { // Called by default everytime a client connects to the websocket
	};

	handleDisconnect(@ConnectedSocket() client: Socket): void { // Called by default everytime a client disconnects to the websocket
		this.roomManager.handleDisconnect(client); 
	};

		// Potential dead-end: can there be a situation where the playerData is sent before initData? This should not happen
	@SubscribeMessage('initData')
	setInitData(@MessageBody() data: InitDataDTO): void {
		
    	// this.simulationService.setInitData(data.sessionToken, data.mode);
		this.roomManager.createRoom(data.sessionToken, data.mode);
	};

	@SubscribeMessage('playerData')
	addPlayer(@MessageBody() data: PlayerDataDTO,
						@ConnectedSocket() client: Socket, mode: GameMode): void {

		const room = this.roomManager.getRoom(data.sessionToken);
		if (room) {
			console.log(`Adding player to room with sessionToken: ${data.sessionToken}`);
			room.addPlayer(client, data.playerId, data.nameNick);
		} else { // Should not happen, but still precautionary
			console.log(`Error cannot add player: room with sessionToken does not exist`); // Change this to an exception
		}
	};

	@SubscribeMessage('playerMove')
	movePaddle( @MessageBody() data: PaddleDirectionDTO,
							@ConnectedSocket() client: Socket): void {

		this.roomManager.movePaddle(data.sessionToken, client.id, data.direction);
	};
};
