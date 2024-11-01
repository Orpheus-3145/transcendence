// game/game.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SimulationService } from './simulation/simulation.service';

@WebSocketGateway(Number(process.env.PORT_WS_BACKEND), { 
  namespace: process.env.WS_NAMESPACE, 
  cors: {
    origin: process.env.URL_FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  }
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private interval;

  constructor(private simulationService: SimulationService) {}

  afterInit() {
    // Set up a loop to broadcast game state
    this.interval = setInterval(() => {
		// console.log("Set interval called backend!");
       const gameState = this.simulationService.getGameState();
      this.server.emit('gameState', gameState);
    }, 1000 / 30); // Emit at 30 FPS
  }

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
    this.simulationService.setStartPos(); // Reset game on new connection
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  // Handle player move events from frontend
	@SubscribeMessage('playerMove')
		handlePlayerMove(
		@MessageBody() data: { playerId: string; direction: string }) {
	console.log(`PlayerMove message - PlayerID: ${data.playerId} Direction: ${data.direction}`);
    const player = data.playerId === 'leftPlayerId' ? 'player1' : 'player2';
	// Validate direction before calling movePaddle
	if (data.direction === 'up' || data.direction === 'down') {
	this.simulationService.movePaddle(player, data.direction);
	} else {
	console.warn(`Invalid direction received: ${data.direction}`);
  	}
	}

	@SubscribeMessage('windowSize')
	handleWindowSize(@MessageBody() data: { width: number, height: number }) {
 	this.simulationService.windowWidth = data.width;
  	this.simulationService.windowHeight = data.height;
	}
}


