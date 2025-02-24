import { Injectable, Inject, forwardRef } from '@nestjs/common';

import RoomManagerService from 'src/game/session/roomManager.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import AppLoggerService from 'src/log/log.service';
import { WaitingPlayer } from 'src/game/types/game.interfaces';
// import { GameDifficulty, GameMode, PowerUpType } from 'src/game/types/game.enum';
// import { WaitingPlayer } from 'src/game/types/game.interfaces';
// import GameDataDTO from 'src/dto/gameData.dto';

@Injectable()
export default class InvitationService {
	private _gameInvitations: Map<string, WaitingPlayer> = new Map();

  constructor(private readonly logger: AppLoggerService,
		private roomManager: RoomManagerService,
    @Inject(forwardRef(() => ExceptionFactory)) private readonly thrower: ExceptionFactory,
  ) {
		this.logger.setContext(InvitationService.name);
  }

  createGameInvitation(): void {}
	// createGameInvitation(client: Socket, powerUps: Array<PowerUpType>): void {
	// {
	// 	const sessionToken = uuidv4();
	// 	const invitator: WaitingPlayer = {
	// 		clientSocket: client,
	// 		extras: powerUps,
	// 	};

	// 	this._gameInvitations.set(sessionToken, invitator);
	// 	client.emit('invitationCreated', { sessionToken: sessionToken });
	// 	this.logger.log(`session [${sessionToken}] - received invitation for custom game`);
	// }

  acceptGameInvitation(): void {}
	// acceptGameInvitation(client: Socket, sessionToken: string): void {
  // {
	// 	const inviter: WaitingPlayer = this._gameInvitations.get(sessionToken);
	// 	if ( inviter === undefined )
	// 		this.thrower.throwGameExcp(
	// 			`game with token ${sessionToken} doesn't exist`,
	// 			sessionToken,
	// 			`${MatchmakingService.name}.${this.constructor.prototype.acceptGameInvitation.name}()`
	// 		);
	// 	// remove game invitation from queue, signal the players, create the room
	// 	this._gameInvitations.delete(sessionToken);
	// 	inviter.clientSocket.emit('startInvitedGame', sessionToken);
	// 	client.emit('startInvitedGame', sessionToken);

	// 	this.logger.log(`session [${sessionToken}] - creating custom game`);
	// 	const initData: GameDataDTO = {
	// 		sessionToken: sessionToken,
	// 		mode: GameMode.multi,
	// 		difficulty: GameDifficulty.unset,
	// 		extras: inviter.extras,
	// 	};
	// 	this.roomManager.createRoom(initData);
	// }

  refuseGameInvitation(): void {}
	// refuseGameInvitation(sessionToken: string): void {
  // {
	// 	const inviter: WaitingPlayer = this._gameInvitations.get(sessionToken);
	// 	if ( inviter === undefined )
	// 		this.thrower.throwGameExcp(
	// 			`game with token ${sessionToken} doesn't exist`,
	// 			sessionToken,
	// 			`${MatchmakingService.name}.${this.constructor.prototype.refuseGameInvitation.name}()`
	// 		);
	// 	this._gameInvitations.delete(sessionToken);
	// 	inviter.clientSocket.emit('refuseGameInvitation');

	// 	this.logger.log(`session [${sessionToken}] - refused invitation for custom game`);
	// }
}