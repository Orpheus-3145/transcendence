import { WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


@WebSocketGateway( //Number(process.env.PORT_WEBSOCKET),
  {
  namespace: process.env.NS_MATCHMAKING, 
  cors: {
    origin: process.env.URL_FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class MatchmakingGateway implements OnGatewayConnection, OnGatewayDisconnect{
  private _waitingPlayersIP: Socket[] = [];
  private _checker = null;
  
  @WebSocketServer()
  server: Server;

  checkNewGame(): void {

    if (this._waitingPlayersIP.length > 2)
    {
      this._waitingPlayersIP.shift().emit('ready');  // message player1
      this._waitingPlayersIP.shift().emit('ready');  // message player2

      console.log('New game starts!');
    }
  };

  handleConnection(client: Socket): void {

    this._waitingPlayersIP.push(client);

    if (this._checker == null)
      this._checker = setInterval(() => this.checkNewGame(), 1000);
    
    console.log(`Client connected: ${client.id}`);
  };

  handleDisconnect(client: Socket): void {

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
  };
};