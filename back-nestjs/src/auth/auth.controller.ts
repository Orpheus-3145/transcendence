import { Controller, Get, Post, Query, Req, Res, UseFilters } from '@nestjs/common';
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

	// Maybe make this post
	@Get('enable-2fa')
	async enableTwoFactorAuth(@Query('intraId') userId: string) {
		console.log('Received request to enable 2FA for userId:', userId); // Debug log
		try {
			const result = await this.authService.enableTwoFactorAuth(userId);
			console.log('Enable 2FA result:', result); // Check if this logs
			return result;
		} catch (error) {
			console.error('Error in enable-2FA:', error); // Log errors
		}
	}

	// Maybe make this post
	@Get('disable-2fa')
	async disableTwoFactorAuth(@Query('intraId') intraId: string) {
		return this.authService.disableTwoFactorAuth(intraId);
	}

	@Get('user-2fa-status')
	async getTwoFactorAuthStatus(@Query('intraId') intraId: string) {
		return this.authService.getTwoFactorAuthStatus(intraId);
	}

	@Get('generate-2fa')
	async generate2faCode(@Query('intraId') intraId: string) {
		return this.authService.generateQRCode(intraId);
	}

	// ✅ NEW: Verify 2FA token during login
	@Get('verify-2fa')
	async verifyTwoFactorLogin(@Query('intraId') intraId: string, @Query('token') token: string, @Res() res: Response) {
		console.log(`Verify 2fa endpoint: intraId: ${intraId}, token: ${token}`);
		return this.authService.verifyTwoFactorLogin(intraId, token, res);
	}
}
