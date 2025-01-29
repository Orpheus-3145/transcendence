import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';

import UsersService from 'src/users/users.service';
import AccessTokenDTO from 'src/dto/auth.dto';
import { UserDTO } from 'src/dto/user.dto';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Add 2FA to the existing authentication
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

	async login(code: string, res: Response): Promise<UserDTO | null> {
		if (!code)
			this.thrower.throwSessionExcp(
				`Login failed, no code provided`,
				`${AuthService.name}.${this.constructor.prototype.login.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		this.logger.debug(`Login attempt, code [${code}]`);

		/// Step 1: Fetch user access token
		const access: AccessTokenDTO = await this.getUserAccessToken(code);
		this.logger.debug(`Found access token [${access.access_token}]`);

		// Step 2: Get user information
		const userMe = await this.getUserMe(access.access_token);
		this.logger.debug(`Found user42 ${userMe.login}`);

		// Step 3: Retrieve or create user in database
		const user = await this.userService.createUser(access, userMe);
		this.logger.log(`Login attempt with user ${user.nameNick}`);

		// Step 4: Check if 2FA is enabled for the user
		if (user.twoFactorSecret) {
			this.logger.debug(`2FA is enabled for user ${user.nameNick}. Redirecting to 2FA verification.`);

			// Redirect to the frontend for 2FA verification
			res.redirect(`${this.config.get<string>('URL_FRONTEND_2FA')}?userId=${user.id}`);
			return null; // Stop the login flow until 2FA is verified
		}
		// Step 5: Generate and set the JWT token if 2FA is not enabled
		const signedToken = sign({ intraId: userMe.id }, this.config.get<string>('SECRET_KEY'));
		res.cookie('auth_token', signedToken, {
			httpOnly: true,
			maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
		});
		this.logger.debug(`Access token signed`);

		// const userDTOreturn = await this.userService.createUser(access, userMe);
		// this.logger.log(`Login successful with user ${userDTOreturn.nameNick}`);
		// Step 6: Redirect to frontend and return user
		const userDTOreturn = user;
		res.redirect(this.config.get<string>('URL_FRONTEND'));
		return userDTOreturn;
	}

	async validate(req: Request, res: Response) {
		// Local variable to accumulate response data
		const responseData = {
			message: '',
			rediretTo: '',
			user: null as UserDTO | null,
		};

		// Extract token
		const token = req.cookies['auth_token'];
		if (!token) {
			res.redirect(this.config.get<string>('URL_FRONTEND_LOGIN'));
			return;
		}

		this.logger.debug(`Validating token [${token}]`);
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

		this.logger.debug(`Token [${token}] validated`);
		// Find user
		const user = await this.userService.findOne(Number(decoded.intraId));
		if (!user)
			this.thrower.throwSessionExcp(
				`User not found`,
				`${AuthService.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.NOT_FOUND,
			);

		// Success
		responseData.message = 'User successfully validated.';
		responseData.user = new UserDTO(user);
		res.status(HttpStatus.OK).json(responseData);
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
				`Problem with Intra42 temp key fetching, response: ${response.body}`,
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
				`Problem with Intra42 temp user fetching, response: ${response.body}`,
				`${AuthService.name}.${this.constructor.prototype.getUserMe.name}()`,
				HttpStatus.UNAUTHORIZED,
			);

		return response.json();
	}

	//2FA
	async verifyTwoFactorLogin(userId: number, token: string, res: Response) {
	const isValid = await this.verifyTwoFactorAuth(userId, token);

	if (!isValid) {
		this.thrower.throwSessionExcp('Invalid 2FA token', 'AuthService.verifyTwoFactorLogin', HttpStatus.UNAUTHORIZED);
	}

	// Generate and save the JWT token
	const signedToken = sign({ intraId: userId }, this.config.get<string>('SECRET_KEY'));
	res.cookie('auth_token', signedToken, {
		httpOnly: true,
		maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
	});

	return { message: '2FA verified successfully and login completed.' };
	}

	async verifyTwoFactorAuth(userId: number, token: string): Promise<boolean> {
	const user = await this.userService.findOne(userId);

	if (!user || !user.twoFactorSecret) {
		this.thrower.throwSessionExcp('2FA not enabled or user not found', 'AuthService.verifyTwoFactorAuth', HttpStatus.NOT_FOUND);
	}

	return speakeasy.totp.verify({
		secret: user.twoFactorSecret,
		encoding: 'base32',
		token,
		window: 1, // Small time window for drift
	});
	}
	async enableTwoFactorAuth(userId: number): Promise<{ qrCode: string; secret: string }> {
	const user = await this.userService.findOne(userId);

		if (!user) {
			this.thrower.throwSessionExcp('User not found', 'AuthService.enableTwoFactorAuth', HttpStatus.NOT_FOUND);
		}

		// this.logger.debug(`2FA is enabled for user ${user.nameNick}. Redirecting to 2FA verification.`);
		console.log(`2FA is enabled for user ${user.nameNick}. Redirecting to 2FA verification.`);
		// Generate a 2FA secret
		const secret = speakeasy.generateSecret({
			name: `YourAppName (${user.email})`,
			issuer: 'YourAppName',
		});

		// Save the secret in the database
		user.twoFactorSecret = secret.base32;
		user.twoFactorEnabled = true;
		await this.userService.update(user);

		// Generate and return the QR code
		const qrCode = await QRCode.toDataURL(secret.otpauth_url);
		return { qrCode, secret: secret.base32 };
	}


}
