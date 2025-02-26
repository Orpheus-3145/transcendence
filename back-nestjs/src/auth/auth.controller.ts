import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseFilters } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from 'src/auth/auth.service';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';

// Maybe add a guard
@Controller('auth')
@UseFilters(SessionExceptionFilter)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('login')
	async login(@Query('code') code: string, @Res() res: Response) {
		console.log("LOGIN!");
		return this.authService.login(code, res);
	}

	@Get('validate')
	async validate(@Req() req: Request, @Res() res: Response) {
		console.log("VALIDATE!");
		this.authService.validate(req, res);
	}

	@Get('logout')
	async logout(@Res() res: Response) {
		this.authService.logout(res);
	}

	// Generate 2FA QRCode and send it to the FE
	@Get('generate-qr')
	async getQRCode(@Query('intraId') intraId: string) {
		console.log('Received request to enable 2FA for intraId:', intraId); // Debug log
		try {
			const result = await this.authService.generateQRCode();
			return result;
		} catch (error) {
			console.error('Error in enable-2FA:', error); // Log errors
		}
	}

	@Post('verify-qr')
	async verifyQRCode(
	@Body() body: { intraId: string; secret: string; token: string },
	@Res() res: Response
	) {
	console.log(`Secret: ${body.secret}, Token: ${body.token}`);
		const isVerified = await this.authService.verifyQRCode(body.intraId, body.secret, body.token);
		return res.json({ success: isVerified });

	}

	@Post('delete-2fa')
	async deleteQRCode(@Query('intraId') intraId: string, @Res() res: Response) {
		return await this.authService.delete2FA(intraId, res);
	}

	@Get('status-2fa')
	async get2FAStatus(@Query('intraId') intraId: string) {
		return await this.authService.get2FAStatus(intraId);
	}

	@Post('verify-2fa')
	async validate2FA(@Body() body: { TOTPcode: string }, @Req() req, @Res() res: Response) {
		console.log(`2FA code being verified: token: ${body.TOTPcode}`);
		return await this.authService.validate2FA(body.TOTPcode, req, res);
	}
}
