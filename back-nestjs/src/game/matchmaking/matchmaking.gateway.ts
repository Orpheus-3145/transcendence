import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { Injectable } from '@nestjs/common';
// import { User } from '../../entities/user.entity';
// import { Subject } from 'rxjs';
// import { UserDTO } from 'src/dto/user.dto';

// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';


@WebSocketGateway(4001, { namespace: '/matchmaking', 
  cors: {
    origin: 'http://localhost:3000', // TODO store in env. var
    methods: ['GET'],
    credentials: true,
  }
})
export class MatchmakingGateway {
  private _waitingPlayersIP = new Set<Socket>();
  
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this._waitingPlayersIP.add(client);

    if (this._waitingPlayersIP.size == 2)
      this.server.emit('message', 'ready');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    this._waitingPlayersIP.delete(client);
  }
};