import { Controller, Get, Query, Req, Res, UseFilters,  } from '@nestjs/common';
import { Request, Response } from 'express';

import { SessionExceptionFilter } from 'src/errors/exceptionFilters';
import InvitationService from './invitation.service';


@Controller('gameInvitation')
@UseFilters(SessionExceptionFilter)
export default class InvitationController {
	constructor(private readonly invService: InvitationService) {}

	@Get('createInvitation')
	// createInvitation(@MessageBody() powerUps: Array<PowerUpType>, @ConnectedSocket() client: Socket): void {
	createInvitation(@Req() request: Request, @Res() res: Response): void {
		// this.invService.createGameInvitation(client, powerUps);
	}

	@Get('acceptInvitation')
	// acceptInvitation(@MessageBody() sessionToken: string, @ConnectedSocket() client: Socket): void {
	acceptInvitation(@Req() request: Request, @Res() res: Response): void {
		// this.invService.acceptGameInvitation(client, sessionToken);
	}

	@Get('refuseInvitation')
	// refuseInvitation(@MessageBody() sessionToken: string): void {
	refuseInvitation(@Req() request: Request, @Res() res: Response): void {
		// this.invService.refuseGameInvitation(sessionToken);
	}
}