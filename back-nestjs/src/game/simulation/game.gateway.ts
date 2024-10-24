import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Store paddle positions (you may want to use a more complex structure in real multiplayer games)
  private paddlePositions = {
    leftPlayer: { y: 300 },  // Example initial position
    rightPlayer: { y: 300 }  // Example initial position
  };

  // Handle new connection
  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  // Handle disconnection
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  // Handle player movement (key press event)
  @SubscribeMessage('playerMove')
  handlePlayerMove(
    @MessageBody() data: { playerId: string; direction: string }
  ) {
    console.log(`Player ${data.playerId} moved: ${data.direction}`);

    // Determine the player's paddle (left or right)
    let playerPaddle = this.paddlePositions.leftPlayer;
    if (data.playerId === 'rightPlayerId') {
      playerPaddle = this.paddlePositions.rightPlayer;
    }

    // Update the paddle position based on direction
    if (data.direction === 'up') {
      playerPaddle.y = Math.max(0, playerPaddle.y - 10);  // Move up, boundary check
    } else if (data.direction === 'down') {
      playerPaddle.y = Math.min(600, playerPaddle.y + 10);  // Move down, boundary check
    }

    // Broadcast the new position back to all clients
    this.server.emit('updatePaddlePosition', {
      playerId: data.playerId,
      newY: playerPaddle.y,
    });
  }
}

