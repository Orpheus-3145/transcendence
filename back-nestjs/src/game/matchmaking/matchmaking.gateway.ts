import { User } from '../../entities/user.entity';
import { UserDTO } from '../../dto/user.dto';
import { WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
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
  namespace: process.env.NS_MATCHMAKING, 
  cors: {
    origin: process.env.URL_FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class MatchmakingGateway implements OnGatewayConnection, OnGatewayDisconnect{
  private _waitingPlayersIP: Player[] = [];
  private _checker = null;

  @WebSocketServer()
  server: Server;

  checkNewGame(): void {

    if (this._waitingPlayersIP.length > 1) {
      
      this._waitingPlayersIP.shift().clientSocket.emit('ready');  // message player1
      this._waitingPlayersIP.shift().clientSocket.emit('ready');  // message player2
    }
  };

  handleDisconnect(client: Socket): void {

    if (this.server.of('/').sockets.get(client.id))
      this.removePlayerFromQueue(client);
  };

  @SubscribeMessage('waiting')
  clientWaitingAdd(@MessageBody() data: UserDTO, @ConnectedSocket() client: Socket) {

    this.addPlayerToQueue(client, data);

    console.log(`Player waiting\nIP: ${client.handshake.address}\nusername: ${data.nameNick}`);
  }

  @SubscribeMessage('leavingWait')
  clientWaitingRemove(@ConnectedSocket() client: Socket) {

    this.removePlayerFromQueue(client);

    console.log(`Player waiting\nIP: ${client.handshake.address}`);
  }

  addPlayerToQueue(clientSocket: Socket, intra42data: UserDTO): void {

    var newPlayer: Player;
    newPlayer.clientSocket = clientSocket;
    newPlayer.intraId = intra42data.id;
    newPlayer.nameNick = intra42data.nameNick;
  
    this._waitingPlayersIP.push(newPlayer);

    this.setChecker();
  }

  removePlayerFromQueue(clientSocket: Socket): void {

    const tmpWaitingPlayers: Player[] = [];
    while (this._waitingPlayersIP.length > 0) {

      const currentPlayer = this._waitingPlayersIP.pop();
      if (currentPlayer.clientSocket.id !== clientSocket.id)
        tmpWaitingPlayers.push(currentPlayer);
      else
        console.log(`Player disconnected\nIP: ${currentPlayer.clientSocket.handshake.address}\nusername: ${currentPlayer.nameNick}`);;
    }
    
    if (tmpWaitingPlayers.length == 0)
      this.unsetChecker();

    this._waitingPlayersIP = tmpWaitingPlayers;
  }

  setChecker(): void {

    if (this._checker === null)
      this._checker = setInterval(() => this.checkNewGame(), 1000);
  }

  unsetChecker(): void {
      
    clearInterval(this._checker);
    this._checker = null;
  }
};