import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseFilters } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from 'src/auth/auth.service';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';

@Controller('auth')
@UseFilters(SessionExceptionFilter)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('login')
	async login(@Query('code') code: string, @Res() res: Response) {
		return this.authService.login(code, res);
	}

	@Get('validate')
	async validate(@Req() req: Request, @Res() res: Response) {

		return this.authService.validate(req, res);
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
			// console.log('Enable 2FA result:', result); // Check if this logs
			return result;
		} catch (error) {
			console.error('Error in enable-2FA:', error); // Log errors
		}
	}

	// @Post('verify-qr')
	// async verifyQRCode(@Query('intraId') intraId: string, @Query('token') token: string, @Query ('secret') secret: string, @Res() res: Response) {
		
	// 	console.log(`Secret: ${secret}, Token: ${token}`);
	// 	return await this.authService.verifyQRCode(intraId, secret, token);
	// }
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
	async deleteQRCode(@Query('intraId') intraId: string) {
		console.log("TRYING TO DELETE");
		return await this.authService.delete2FA(intraId);
	}

	@Get('status-2fa')
	async get2FAStatus(@Query('intraId') intraId: string) {
		return await this.authService.get2FAStatus(intraId);
	}

	@Post('verify-2fa')
	async validate2FA(@Query('intraId') intraId: string, @Query('token') token: string, @Res() res: Response) {
		console.log(`2FA code being verified: ${intraId}, token: ${token}`);
		return await this.authService.validate2FA(intraId, token);
	}
}
