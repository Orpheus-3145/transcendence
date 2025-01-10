import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';

import UsersService from 'src/users/users.service';
import AccessTokenDTO from 'src/dto/auth.dto';
import { UserDTO } from 'src/dto/user.dto';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UsersService,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
	) {
    	this.logger.setContext(AuthService.name);
	}

	handleRedir(res: Response, clear: boolean, redir?: string, mess?: string) {
	
		if (clear)
			res.clearCookie('auth_token');
	
		const responseObj: any = {};

		if (mess)
			responseObj.message = mess;
		if (redir)
			responseObj.redirectTo = redir;

		res.json(responseObj);
	}

	async getUserAccessToken(code: string): Promise<AccessTokenDTO | null> {

		if (!code) 
			this.thrower.throwSessionExcp(`Login failed, no code provided`, `${AuthService.name}.${this.constructor.prototype.getUserAccessToken.name}()`, HttpStatus.UNAUTHORIZED)

		const response = await fetch(this.configService.get<string>('URL_INTRA_TOKEN'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: this.configService.get<string>('SECRET_UID'),
				client_secret: this.configService.get<string>('SECRET_PWD'),
				code: code,
				redirect_uri: this.configService.get<string>('URL_BACKEND_LOGIN'),
			}),
		});
		
		if (!response.ok)
			this.thrower.throwSessionExcp(`Problem with Intra42 temp key fetching, response: ${response.body}`, `${AuthService.name}.${this.constructor.prototype.getUserAccessToken.name}()`, HttpStatus.UNAUTHORIZED)

		return response.json();
	}

	async getUserMe(access_token: string): Promise<Record<string, any> | null> {
		
		if (!access_token)
			this.thrower.throwSessionExcp(`No access token provided from Intra42`, `${AuthService.name}.${this.constructor.prototype.getUserMe.name}()`, HttpStatus.UNAUTHORIZED)
		
		const response = await fetch(this.configService.get<string>('URL_INTRA_USERME'), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${access_token}`,
				'Content-Type': 'application/json',
			},
		});
		
		if (!response.ok)
			this.thrower.throwSessionExcp(`Problem with Intra42 temp user fetching, response: ${response.body}`, `${AuthService.name}.${this.constructor.prototype.getUserMe.name}()`, HttpStatus.UNAUTHORIZED)
	
		return response.json();
	}

	async login(code: string, res: Response): Promise<UserDTO | null> {
	
		if (!code)
			this.thrower.throwSessionExcp(`Login failed, no code provided`, `${AuthService.name}.${this.constructor.prototype.login.name}()`, HttpStatus.UNAUTHORIZED)

		const access: AccessTokenDTO = await this.getUserAccessToken(code);
		const userMe = await this.getUserMe(access.access_token);
		const signedToken = sign({ intraId: userMe.id }, this.configService.get<string>('SECRET_KEY'));

		res.cookie('auth_token', signedToken, {
			httpOnly: true,
			maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
		});

		const userDTOreturn = await this.userService.createUser(access, userMe);
		this.logger.log(`Successful login with user ${userDTOreturn.nameNick}`)
		
		res.redirect(this.configService.get<string>('URL_FRONTEND'));
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
		if (!token)
			this.thrower.throwSessionExcp(`Validator token 'auth_token' not found in cookies`, `${AuthService.name}.${this.constructor.prototype.validate.name}()`, HttpStatus.UNAUTHORIZED)


		// Verify token
		let decoded: string | JwtPayload;
		try {
			decoded = verify(token, this.configService.get<string>('SECRET_KEY'));
		} catch (error) {
			this.thrower.throwSessionExcp(`Token validation error`, `${AuthService.name}.${this.constructor.prototype.validate.name}()`, HttpStatus.UNAUTHORIZED)

		}
		// Check decoded type
		if (typeof decoded !== 'object' || isNaN(Number(decoded.intraId)))
			return this.failResponse(res, responseData, 'Invalid token payload.', '/login');

		// Find user
		const user = await this.userService.findOne(Number(decoded.intraId));
		if (!user) return this.failResponse(res, responseData, 'User not found.', '/login');

		// Success
		responseData.message = 'User successfully validated.';
		responseData.user = new UserDTO(user);
		res.status(200).json(responseData);
	}

	private failResponse(res: Response, responseData: any, message: string, redirectTo: string) {
		responseData.message = message;
		responseData.redirectTo = redirectTo;
		res.clearCookie('auth_token');
		res.status(401).json(responseData);
	}
}
