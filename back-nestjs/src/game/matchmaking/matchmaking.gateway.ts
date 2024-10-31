import { WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { ConfigService } from '@nestjs/config';
// import { Injectable } from '@nestjs/common';
// import { User } from '../../entities/user.entity';
// import { Subject } from 'rxjs';
// import { UserDTO } from 'src/dto/user.dto';

// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';


@WebSocketGateway( Number(process.env.PORT_WS_BACKEND), { 
  namespace: process.env.WS_NAMESPACE, 
  cors: {
    origin: process.env.URL_FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  }
})
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  private _waitingPlayersIP: Socket[];
  private _checker;
  
  @WebSocketServer()
  server: Server;

  checkNewGame(): void {

    this.server.emit('message', 'ready');
    if (this._waitingPlayersIP.length > 1)
    {
      this._waitingPlayersIP.shift().emit('message', 'ready');  // message player1
      this._waitingPlayersIP.shift().emit('message', 'ready');  // message player2

      console.log('New game starts!');
    }
  };

  @SubscribeMessage('msg')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket
  ): void {
    
    // do smt with client
    console.log('client says HI: ', data);
  }
  
  handleConnection(client: Socket) {

    this._waitingPlayersIP.push(client);

    if (this._checker == null)
      this._checker = setInterval(() => this.checkNewGame(), 1000);
    
    console.log(`Client connected: ${client.id}`);
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