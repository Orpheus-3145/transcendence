import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
	ConnectedSocket,
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
export default class SimulationGateway implements OnGatewayDisconnect{
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
  
	handleDisconnect(): void {
		
		this.simulationService.interruptGame();
	};

	@SubscribeMessage('playerInfo')
  setPlayer(@MessageBody() data: {playerId: number, nameNick: string}, 
						@ConnectedSocket() client: Socket): void {
		
    this.simulationService.setPlayer(client, data.playerId, data.nameNick);
	};

	@SubscribeMessage('initData')
  setInitData(@MessageBody() data: {sessionToken: string, mode: GameMode}): void {
		
    this.simulationService.setInitData(data.sessionToken, data.mode);
	};

	@SubscribeMessage('playerMove')
	movePaddle( @MessageBody() data: {playerNick: string; direction: 'up' | 'down'}): void {
	
		// const player = data.playerId === 'id1' ? 'player1' : 'player2';
	
			// Validate direction before calling movePaddle
		// if (data.direction === 'up' || data.direction === 'down') {
		this.simulationService.movePaddle(data.playerNick, data.direction);
		// } else {
		// 	console.warn(`Invalid direction received: ${data.direction}`);
		// }
	};


	// @SubscribeMessage('windowSize')
	// handleWindowSize(@MessageBody() data: { width: number, height: number }) {
 	// this.simulationService.windowWidth = data.width;
  	// this.simulationService.windowHeight = data.height;
	// }
}
