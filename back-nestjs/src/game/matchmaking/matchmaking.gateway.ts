import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { ConfigService } from '@nestjs/config';
// import { Injectable } from '@nestjs/common';
// import { User } from '../../entities/user.entity';
// import { Subject } from 'rxjs';
// import { UserDTO } from 'src/dto/user.dto';

// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';


const ws_port = Number(process.env.PORT_WS_BACKEND);
const ws_namespace = process.env.WS_NAMESPACE;
const ws_frontend = process.env.ORIGIN_URL_FRONT;

@WebSocketGateway(ws_port, { namespace: ws_namespace, 
  cors: {
    origin: ws_frontend,
    methods: ['GET'],
    credentials: true,
  }
})
export class MatchmakingGateway {
  private _waitingPlayersIP = new Set<Socket>();
  
  @WebSocketServer()
  server: Server;

  constructor() {}

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