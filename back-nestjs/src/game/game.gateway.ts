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

@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private interval;

  constructor(private simulationService: SimulationService) {}

  afterInit() {
    // Set up a loop to broadcast game state
    this.interval = setInterval(() => {
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
    @MessageBody() data: { playerId: string; direction: string }
  ) {
    const player = data.playerId === 'leftPlayerId' ? 'player1' : 'player2';
    this.simulationService.movePaddle(player, data.direction);
  }
}

