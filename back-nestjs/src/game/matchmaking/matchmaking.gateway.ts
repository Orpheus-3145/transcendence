import { UserDTO } from '../../dto/user.dto';
import { WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface Player {
  
  clientSocket: Socket,
  intraId: number,
  nameNick: string,
};

@WebSocketGateway( {
  namespace: process.env.WS_NS_MATCHMAKING, 
  cors: {
    origin: process.env.URL_FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class MatchmakingGateway implements OnGatewayDisconnect{
  private _waitingPlayersIP: Player[] = [];
  private _checker = null;

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket): void {
    
    for (const player of this._waitingPlayersIP) {

      if (player.clientSocket.id === client.id)
        this.removePlayerFromQueue(client);
    }
  };

  @SubscribeMessage('waiting')
  clientWaitingAdd(@MessageBody() data: UserDTO, @ConnectedSocket() client: Socket) {

    this.addPlayerToQueue(client, data);
  };

  @SubscribeMessage('leavingWait')
  clientWaitingRemove(@ConnectedSocket() client: Socket) {

    this.removePlayerFromQueue(client);
  };

  addPlayerToQueue(clientSocket: Socket, intra42data: UserDTO): void {

    const newPlayer: Player = {
      clientSocket: clientSocket,
      intraId: intra42data.id,
      nameNick: intra42data.nameNick,
    };
  
    this._waitingPlayersIP.push(newPlayer);

    this.setChecker();

    console.log(`player ${newPlayer.nameNick} [${newPlayer.clientSocket.handshake.address}] joined queue`);
  };

  removePlayerFromQueue(clientSocket: Socket): void {

    const tmpWaitingPlayers: Player[] = [];
    while (this._waitingPlayersIP.length > 0) {

      const currentPlayer = this._waitingPlayersIP.pop();
      if (currentPlayer.clientSocket.id !== clientSocket.id)
        tmpWaitingPlayers.push(currentPlayer);
      else
        console.log(`player ${currentPlayer.nameNick} left queue `);
    }
    
    this._waitingPlayersIP = tmpWaitingPlayers;

    if (this._waitingPlayersIP.length == 0)
      this.unsetChecker();
  };

  checkNewGame(): void {

    if (this._waitingPlayersIP.length > 1) {
      
      this._waitingPlayersIP.shift().clientSocket.emit('ready');  // message player1
      this._waitingPlayersIP.shift().clientSocket.emit('ready');  // message player2
    }
  };

  setChecker(): void {

    if (this._checker === null)
      this._checker = setInterval(() => this.checkNewGame(), 1000);
  };

  unsetChecker(): void {
      
    clearInterval(this._checker);
    this._checker = null;
  };
};