import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from 'src/auth/auth.service';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';

// Maybe add a guard like:
// @UseGuards(AuthGuard)
@Controller('auth')
@UseFilters(SessionExceptionFilter)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('login')
	async login(@Query('code') code: string, @Res() res: Response) {
		console.log("Login Endpoint");
		await this.authService.login(code, res);
	}

	// Token validation happens here. Part of this might make more sense as a guard middleware
	@Get('validate')
	async validate(@Req() req: Request, @Res() res: Response) {
		console.log("Validate Endpoint");
		await this.authService.validate(req, res);
	}

	@Get('logout')
	async logout(@Res() res: Response) {
		await this.authService.logout(res);
	}

	// Generate 2FA QRCode and send it to the front-end
	@Get('generate-qr')
	async getQRCode(@Query('intraId') intraId: string,@Res() res: Response) {
		console.log('Generate QR Endpoint by IntraId: ', intraId); // Debug log
		try {
			await this.authService.generateQRCode(res);
		} catch (error) {
			console.error('Error in enable-2FA:', error); // Log errors
		}
	}

	// If QR is verified, save the 2fa secret to the database
	@Post('verify-qr')
	async verifyQRCode(
	@Body() body: { intraId: string; secret: string; token: string },
	@Res() res: Response
	) {
		console.log(`Verify QR Endpoint with Secret: ${body.secret}, Token: ${body.token}`);
		const isVerified = await this.authService.verifyQRCode(body.intraId, body.secret, body.token);
		console.log("QR code verified status is ", isVerified);
		return res.json({ success: isVerified });

	}

	@Post('delete-2fa')
	async deleteQRCode(@Query('intraId') intraId: string, @Res() res: Response) {
		console.log("Delete 2fa Endpoint IntraId: ", intraId);
		await this.authService.delete2FA(intraId, res);
	}

	@Get('status-2fa')
	async get2FAStatus(@Query('intraId') intraId: string, @Res() res: Response) {
		console.log("Get 2fa Status Endpoint IntraId: ", intraId);
		return await this.authService.get2FAStatus(intraId, res);
	}

	@Post('verify-2fa')
	async validate2FA(@Body() body: { tempCode: string }, @Req() req, @Res() res: Response) {
		console.log("Validate 2fa Endpoint tempCode: ", body.tempCode);
		await this.authService.validate2FA(body.tempCode, req, res);
	}
}
