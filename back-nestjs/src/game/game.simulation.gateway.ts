import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import SimulationService from './game.simulation.service';
import { UserDTO } from '../dto/user.dto';
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
export default class SimulationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private simulationService: SimulationService) {};


  // @SubscribeMessage('gameData')
  // handleGameWindow(@MessageBody() gameData: GameDataDTO,
	// 								 @MessageBody() intra42data: UserDTO, 
	// 								 @ConnectedSocket() client: Socket) {

	// 	this.simulationService.setGameData(gameData);
	// 	this.simulationService.setStartPos();
	// 	this.simulationService.setupGame(this.server);
	// };

	@SubscribeMessage('mode')
	handleClientInfo(@MessageBody() data: {mode: GameMode, intra42data: UserDTO},
									 @ConnectedSocket() client: Socket) {

		this.simulationService.setMode(data.mode);
		this.simulationService.setPlayer(client, data.intra42data);
	}

	@SubscribeMessage('mode')
	setModeGame(@MessageBody() mode: 'single' | 'multi') {

	}
  
	@SubscribeMessage('playerInfo')
  setPlayerInfo(@MessageBody() intra42data: UserDTO, 
								@ConnectedSocket() client: Socket) {

	};

	@SubscribeMessage('playerMove')
	handlePlayerMove( @MessageBody() data: { playerId: string; direction: string }) {
	
		const player = data.playerId === 'id1' ? 'player1' : 'player2';
	
			// Validate direction before calling movePaddle
		if (data.direction === 'up' || data.direction === 'down') {
			this.simulationService.movePaddle(player, data.direction);
		} else {
		console.warn(`Invalid direction received: ${data.direction}`);
			}
	};

	// @SubscribeMessage('windowSize')
	// handleWindowSize(@MessageBody() data: { width: number, height: number }) {
 	// this.simulationService.windowWidth = data.width;
  	// this.simulationService.windowHeight = data.height;
	// }
}
