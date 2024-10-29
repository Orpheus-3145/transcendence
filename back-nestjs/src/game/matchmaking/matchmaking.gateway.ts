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
const ws_frontend = process.env.URL_FRONTEND;

@WebSocketGateway({ namespace: ws_namespace, 
  cors: {
    origin: ws_frontend,
    methods: ['GET'],
    credentials: true,
  }
})
export class MatchmakingGateway {
  private _waitingPlayersIP: Socket[];
  private _checker;
  
  @WebSocketServer()
  server: Server;

  constructor() {
  
    // setInterval(() => this.checkNewGame(), 1000);
  }

  checkNewGame(): void {

    this.server.emit('message', 'ready');
    if (this._waitingPlayersIP.length > 1)
    {
      this._waitingPlayersIP.shift().emit('message', 'ready');  // message player1
      this._waitingPlayersIP.shift().emit('message', 'ready');  // message player2

      console.log('New game starts!');
    }
  };

  handleConnection(client: Socket) {

    this._waitingPlayersIP.push(client);

    console.log(`Client connected: ${client.id}`);
    if (this._checker == null)
      this._checker = setInterval(() => this.checkNewGame(), 1000);
  }

  handleDisconnect(client: Socket) {

    const tmpWaitingPlayers: Socket[] = [];
    while (this._waitingPlayersIP.length > 0) {
      
      const currentPlayer = this._waitingPlayersIP.pop();
      if (currentPlayer != client)
        tmpWaitingPlayers.push(currentPlayer);
    }
    this._waitingPlayersIP = tmpWaitingPlayers;

    if (this._waitingPlayersIP.length == 0)
    {
      clearInterval(this._checker);
      this._checker = null;
    }

    console.log(`Client disconnected: ${client.id}`);
  }
};