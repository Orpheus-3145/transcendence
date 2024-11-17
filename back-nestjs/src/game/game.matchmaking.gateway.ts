import { WebSocketGateway,
	WebSocketServer,
	OnGatewayDisconnect,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import MatchmakingService from './game.matchmaking.service';
import { UserDTO } from '../dto/user.dto';


@WebSocketGateway( {
	namespace: process.env.WS_NS_MATCHMAKING,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})
export default class MatchmakingGateway implements OnGatewayDisconnect{

	@WebSocketServer()
	server: Server;

	constructor(private matchmakingService: MatchmakingService) {};

	handleDisconnect(client: Socket): void {
		
		this.matchmakingService.removePlayerFromQueue(client);
	};

	@SubscribeMessage('waiting')
  clientWaitingAdd(@MessageBody() data: UserDTO, @ConnectedSocket() client: Socket) {

    this.matchmakingService.addPlayerToQueue(client, data);
  };
};