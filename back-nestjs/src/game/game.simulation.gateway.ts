import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import SimulationService from './game.simulation.service';

@WebSocketGateway({
	namespace: process.env.WS_NS_SIMULATION,
	cors: {
		origin: process.env.URL_FRONTEND,
		methods: ['GET', 'POST'],
		credentials: true,
	},
	transports: ['websocket'],
})
export default class SimulationGateway {
	@WebSocketServer()
	server: Server;

	//   private gameStateInterval;
	//   private updateBallInterval;
	//   private botPaddleInterval;

	constructor(private simulationService: SimulationService) {}

	//   afterInit() {

	// 	this.simulationService.setupGame(this.server);
	// 	// Set up a loop to broadcast game state
	// 	// this.gameStateInterval = setInterval(() => {
	// 	// 	// console.log("Set interval called backend!");
	// 	// 	const gameState = this.simulationService.getGameState();
	// 	// 	this.server.emit('gameState', gameState);
	// 	// }, 1000 / 30); // Emit at 30 FPS

	// 	// this.updateBallInterval = setInterval(() => {
	// 	// 	this.simulationService.updateBall();
	// 	// }, 1000/30); // For 30 FPS, like the other interval
	// 	// this.botPaddleInterval = setInterval(() =>{this.simulationService.updateBotPaddle();}, 1000/30);
	// 	}

	// handleConnection(client: any) {
	// console.log('Client connected:', client.id);
	// // this.simulationService.setStartPos(); // Reset game on new connection

	// }

	// handleDisconnect(client: any) {
	// console.log('Client disconnected:', client.id);
	// }

	@SubscribeMessage('gameData')
	handleGameWindow(
		@MessageBody()
		data: {
			windowWidth: number;
			windowHeight: number;
			paddleWidth: number;
			paddleHeight: number;
			bot: boolean;
		},
	) {
		// console.log(`Received size: Window - ${data.windowWidth}, ${data.windowHeight} | Paddle ${data.paddleWidth}, ${data.paddleHeight}`);
		this.simulationService.setGameData(
			data.windowWidth,
			data.windowHeight,
			data.paddleWidth,
			data.paddleHeight,
			data.bot,
		);
		this.simulationService.setStartPos();
		this.simulationService.setupGame(this.server);
	}

	@SubscribeMessage('playerMove')
	handlePlayerMove(@MessageBody() data: { playerId: string; direction: string }) {
		// console.log(`PlayerMove message - PlayerID: ${data.playerId} Direction: ${data.direction}`);
		const player = data.playerId === 'id1' ? 'player1' : 'player2';
		// Validate direction before calling movePaddle
		if (data.direction === 'up' || data.direction === 'down') {
			this.simulationService.handlePaddle(player, data.direction);
		} else {
			console.warn(`Invalid direction received: ${data.direction}`);
		}
	}

	// @SubscribeMessage('windowSize')
	// handleWindowSize(@MessageBody() data: { width: number, height: number }) {
	// this.simulationService.windowWidth = data.width;
	// this.simulationService.windowHeight = data.height;
	// }
}
