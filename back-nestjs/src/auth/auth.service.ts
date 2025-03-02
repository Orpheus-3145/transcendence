import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, response, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';

import { UsersService } from 'src/users/users.service';
import AccessTokenDTO from 'src/dto/auth.dto';
import { UserDTO } from 'src/dto/user.dto';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
@Injectable()
export class AuthService {
	constructor(
		private readonly config: ConfigService,
		private readonly userService: UsersService,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(AuthService.name);

		if (this.config.get<boolean>('DEBUG_MODE_SESSION', false) == false)
			this.logger.setLogLevels(['log', 'warn', 'error', 'fatal']);
	}

	async checkCode(code: string): Promise<{access: AccessTokenDTO, intraId: number, userMe: Record<string, any>}> {
		const access: AccessTokenDTO = await this.getUserAccessToken(code);
		if (access === null)
			return null;
		const userMe = await this.getUserMe(access.access_token);
		if (userMe === null)
			return null;
		const intraId: number = userMe.id;
		return {access: access, intraId: intraId, userMe: userMe};
	}

	async handleUserData(intraId: number, access: AccessTokenDTO, userMe: Record<string, any>): Promise<boolean> {
		let user = await this.userService.findOne(intraId);

		if (!user) {
			try {
				const userDTO = await this.userService.createUser(access, userMe);
				return false;
			} catch (error) {
				this.thrower.throwSessionExcp(
					'Creating user failed',
					`${AuthService.name}.${this.constructor.prototype.login.name}()`,
					HttpStatus.UNAUTHORIZED
				);
			}
		}
		// If twoFactorSecret string is not null, 2FA is enabled
		return user?.twoFactorSecret != null;
	}


	// authType is either auth_token or 2fa_token
	addCookie(authType: string, intraId: number, res: Response) {
		const signedToken = sign({ intraId: intraId }, this.config.get<string>('SECRET_KEY'));
		res.cookie(authType, signedToken, {httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000,});
	}

	async login(code: string, res: Response) {
		if (!code)
			this.thrower.throwSessionExcp(
				`Login failed, no code provided`,
				`${AuthService.name}.${this.constructor.prototype.login.name}()`,
				HttpStatus.UNAUTHORIZED,
			);
		this.logger.debug(`Login attempt, code [${code}]`);
		const {access, intraId, userMe} = await this.checkCode(code);
		if (access === null || userMe === null || intraId === null) {
			res.status(HttpStatus.UNAUTHORIZED).clearCookie('auth_token');
			this.thrower.throwSessionExcp(
				`Login failed, invalid code`,
				`${AuthService.name}.${this.constructor.prototype.login.name}()`,
				HttpStatus.UNAUTHORIZED,
			)
		}
		const is2FAEnabled = await this.handleUserData(intraId, access, userMe);

	
		// If 2FA is enabled, send a response prompting for 2FA verification
		if (is2FAEnabled) {
			this.logger.debug(`2FA required for user ${userMe.login}`);
			this.addCookie('2fa_token', intraId, res);
			const frontend2FARedirect = `${this.config.get<string>('URL_FRONTEND_2FA')}`;
			res.redirect(frontend2FARedirect);
			return ;
		}
		// Add auth cookie to complete authentication
		this.addCookie('auth_token', intraId, res);
		res.redirect(this.config.get<string>('URL_FRONTEND'));
	}

	// Maybe think about adding some of this inside a middleware guard
	async validate(req: Request, res: Response) {
		const twoFAToken = req.cookies['2fa_token'];
		if (twoFAToken) {
			return res.status(200).json({ user: { id: 0, auth2F: true } });
		}

		// Extract token
		const token = req.cookies['auth_token'];
		if (!token) {
			return res.redirect(this.config.get<string>('URL_FRONTEND_LOGIN'));
		}

		this.logger.log(`Validating token [${token}]`);
		// Verify token
		let decoded: string | JwtPayload;
		try {
			decoded = verify(token, this.config.get<string>('SECRET_KEY'));
		} catch (error) {
			this.thrower.throwSessionExcp(
				`Token validation error: ${error.message}`,
				`${AuthService.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.UNAUTHORIZED,
			);
		}
		// Check decoded type
		if (typeof decoded !== 'object' || isNaN(Number(decoded.intraId)))
			this.thrower.throwSessionExcp(
				`Invalid token payload`,
				`${AuthService.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		this.logger.log(`Token [${token}] validated`);
		// Find user
		const user = await this.userService.findOne(Number(decoded.intraId));
		if (!user)
			this.thrower.throwSessionExcp(
				`User not found`,
				`${AuthService.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.NOT_FOUND,
			);

		// Success
		this.logger.log(`Token [${token}] validated`);
		res.status(200).json({ user: new UserDTO(user) });
	}

	async logout(res: Response, redir?: string, mess?: string) {
		res.clearCookie('auth_token');

		const responseObj: any = {};

		if (mess) responseObj.message = mess;

		if (redir) responseObj.redirectTo = redir;
		else responseObj.redirectTo = this.config.get<string>('URL_FRONTEND_LOGIN');

		res.json(responseObj);
	}

	async getUserAccessToken(code: string): Promise<AccessTokenDTO | null> {
		if (!code)
			this.thrower.throwSessionExcp(
				`Login failed, no code provided`,
				`${AuthService.name}.${this.constructor.prototype.getUserAccessToken.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		this.logger.debug(
			`Fetching access token from Intra42 at URL ${this.config.get<string>('URL_INTRA_TOKEN')}`,
		);

		const response = await fetch(this.config.get<string>('URL_INTRA_TOKEN'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: this.config.get<string>('SECRET_UID'),
				client_secret: this.config.get<string>('SECRET_PWD'),
				code: code,
				redirect_uri: this.config.get<string>('URL_BACKEND_LOGIN'),
			}),
		});
		if (!response.ok)
			this.thrower.throwSessionExcp(
				`Problem with Intra42 temp key fetching, response: ${JSON.stringify(response)}`,
				`${AuthService.name}.${this.constructor.prototype.getUserAccessToken.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		return response.json();
	}

	async getUserMe(access_token: string): Promise<Record<string, any> | null> {
		if (!access_token)
			this.thrower.throwSessionExcp(
				`No access token provided from Intra42`,
				`${AuthService.name}.${this.constructor.prototype.getUserMe.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		this.logger.debug(`Fetching user42 data with token [${access_token}]`);

		const response = await fetch(this.config.get<string>('URL_INTRA_USERME'), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${access_token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok)
			this.thrower.throwSessionExcp(
				`Problem with Intra42 temp user fetching, response: ${JSON.stringify(response)}`,
				`${AuthService.name}.${this.constructor.prototype.getUserMe.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		const data = await response.json();
		return data;
	}

	// 2FA

	verify2FACode(secretKey: string, token: string): boolean {
		return speakeasy.totp.verify({ secret: secretKey, encoding: 'base32', token: token, window: 1 });
	}

	// Validates 2fa code and completes authentication process
	async validate2FA(token: string, req: Request, res: Response) {
		const twoFactorToken = req.cookies['2fa_token'];
		if (!twoFactorToken) {
			this.thrower.throwSessionExcp(
				'2FA token is missing',
				'AuthService.verifyTwoFactorAuth',
				HttpStatus.UNAUTHORIZED
			);
		}
		let decoded;
		try {
		decoded = verify(twoFactorToken, this.config.get<string>('SECRET_KEY'));
		} catch (err) {
			this.thrower.throwSessionExcp(
				'Error verifying token',
				'AuthService.verifyTwoFactorAuth',
				HttpStatus.UNAUTHORIZED
			);
		}

		const user = await this.userService.findOne(Number(decoded.intraId));
		if (user === null) {
			this.thrower.throwSessionExcp(
				'User not found',
				'AuthService.verifyTwoFactorAuth',
				HttpStatus.NOT_FOUND
			);
		}
		if (!user.twoFactorSecret) {
			this.thrower.throwSessionExcp(
				'2FA not enabled for this user',
				'AuthService.verifyTwoFactorAuth',
				HttpStatus.UNAUTHORIZED
			);
		}

		const isValid = this.verify2FACode(user.twoFactorSecret, token)
		if (!isValid) {
			this.logger.debug("2FA code could not be verified.");
			this.thrower.throwSessionExcp(
				'2FA code is invalid',
				'AuthService.verifyTwoFactorAuth',
				HttpStatus.UNAUTHORIZED
			);
		}
		
		// Complete authentication after the 2fa code is validated
		this.addCookie('auth_token', decoded.intraId, res);
 		res.clearCookie('2fa_token').status(200).json({user: new UserDTO(user), valid: isValid});
	}

	// Verify QRcode to enabled 2fa
	async verifyQRCode(intraId: string, secret: string, token: string): Promise<boolean> {
		this.logger.log("Verifying QR Code");

		const isValid = this.verify2FACode(secret, token);
		if (!isValid) {
			this.logger.debug("Invalid 2FA code");
			return (false);
		}
		try {
			let user = await this.userService.findOne(Number(intraId));
			if (!user) {
				this.thrower.throwSessionExcp(
					'User not found',
					'AuthService.verifyTwoFactorAuth',
					HttpStatus.NOT_FOUND
				);
			}
			user.twoFactorSecret = secret;
			this.userService.update(user);

		}
		catch (error) {
			this.logger.log(`Token verification was valid, but error updating database.`)
			this.thrower.throwSessionExcp(
				'QR verification was valid, but error updating database.',
				'AuthService.verifyTwoFactorAuth',
				HttpStatus.NOT_FOUND
			);
		}
		this.logger.debug("QR Code verified, 2FA successfully enabled.")
		return (true);
	}

	generate2FASecret(): speakeasy.GeneratedSecret {
		const secretCode = speakeasy.generateSecret({ name: this.config.get<string>('PROJECT_NAME')});
		return secretCode;
	}

	async generateQRCode(res: Response) {

		// Generate and return 2FA secret and QR code
		const secret = this.generate2FASecret();
		const qrCode = await QRCode.toDataURL(secret.otpauth_url);
		const responseData = {
			qrCode: qrCode,
			secret: secret.base32,
		};

		res.status(200).json(responseData);
		// 	return ;
		// return { qrCode: qrCode, secret: secret.base32 };
	}

	async delete2FA(userId: string, res: Response) {
		let user = await this.userService.findOne(Number(userId));

		if (!user) {
			this.thrower.throwSessionExcp(
				'User not found',
				'AuthService.disableTwoFactorAuth',
				HttpStatus.NOT_FOUND
			);
		}

		// Disable 2FA
		try {
			user.twoFactorSecret = null;
			await this.userService.update(user);
			res.clearCookie('2fa_token');

		}
		catch (error) {
			this.thrower.throwSessionExcp(
				'Error disabling 2fa in backend',
				'AuthService.disableTwoFactorAuth',
				HttpStatus.NOT_FOUND
			);
		}
		res.status(200).json({ message: '2FA has been disabled successfully.' });

		// return { message: '2FA has been disabled successfully.' };
	}

	async get2FAStatus(intraId: string, res: Response) {
		const user = await this.userService.findOne(Number(intraId));
		if (!user) {
			this.thrower.throwSessionExcp(
				'User not found',
				'2FA status',
				HttpStatus.NOT_FOUND
			);
		}
		const twoFactorEnabled = user.twoFactorSecret != null
		res.status(200).json({is2FAEnabled: twoFactorEnabled});
	}

}