import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from 'src/auth/auth.service';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';
import { AuthGuard } from './auth.guard';
import UserDTO from 'src/dto/user.dto';

// Maybe add a guard like:
// @UseGuards(AuthGuard)
@Controller('auth')
@UseFilters(SessionExceptionFilter)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('login')
	async login(@Query('code') code: string, @Res() res: Response) {
		await this.authService.login(code, res);
	}

	// Token validation happens here. Part of this might make more sense as a guard middleware
	@Get('validate')
	@UseGuards(AuthGuard)
	async validateUser(@Req() req: Request, @Res() res: Response) {
		if (req.validatedUser) {
			res.status(200).json({ user: new UserDTO(req.validatedUser) });
		}
	}

	@Get('logout')
	async logout(@Res() res: Response) {
		await this.authService.logout(res);
	}

	// Generate 2FA QRCode and send it to the front-end
	@Get('generate-qr')
	@UseGuards(AuthGuard)
	async getQRCode(@Res() res: Response) {
		await this.authService.generateQRCode(res);
	}

	// If QR is verified, save the 2fa secret to the database
	@Post('verify-qr')
	@UseGuards(AuthGuard)
	async verifyQRCode(
	@Body() body: { intraId: string; secret: string; token: string },
	@Res() res: Response
	) {
		const isVerified = await this.authService.verifyQRCode(body.intraId, body.secret, body.token);
		res.json({ success: isVerified });

	}

	@Post('delete-2fa')
	@UseGuards(AuthGuard)
	async deleteQRCode(@Query('intraId') intraId: string, @Res() res: Response) {
		await this.authService.delete2FA(intraId, res);
	}

	@Get('status-2fa')
	@UseGuards(AuthGuard)
	async get2FAStatus(@Query('intraId') intraId: string, @Res() res: Response) {
		await this.authService.get2FAStatus(intraId, res);
	}

	@Post('verify-2fa')
	// @UseGuards(AuthGuard)
	async validate2FA(@Body() body: { tempCode: string }, @Req() req, @Res() res: Response) {
		await this.authService.validate2FA(body.tempCode, req, res);
	}
}
