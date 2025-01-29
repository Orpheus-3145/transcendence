import { Controller, Get, Query, Req, Res, UseFilters } from '@nestjs/common';
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

	// ✅ NEW: Enable 2FA for a user
	@Get('enable-2fa')
	async enableTwoFactorAuth(@Query('userId') userId: string) {
		return this.authService.enableTwoFactorAuth(Number(userId));
	}

	// ✅ NEW: Verify 2FA token during login
	@Get('verify-2fa')
	async verifyTwoFactorLogin(@Query('userId') userId: string, @Query('token') token: string, @Res() res: Response) {
		return this.authService.verifyTwoFactorLogin(Number(userId), token, res);
	}
}
