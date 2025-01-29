import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

// TODO: We need some kind of schema for users to store data in the DB
@Injectable()
export class TwoFactorAuthService {

	constructor() {}

	// generate secret key and save it to the DB I think
	generateSecret(): string {
		const secret = speakeasy.generateSecret();
		return secret;
	}

	async generateQRCode(secret: string) {
		return QRCode.toDataURL(secret);
	}

	verifyTwoFactorAuthenticationCode(secret: string, token: string) {
		return speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: token,
		});
	}
}