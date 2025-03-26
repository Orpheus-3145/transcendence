import {CanActivate, ExecutionContext, HttpStatus, Injectable} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { verify, JwtPayload } from 'jsonwebtoken';
import User from 'src/entities/user.entity';

export interface CustomRequest extends Request {
	validatedUser?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
 constructor(
		private readonly config: ConfigService,
		private readonly userService: UsersService,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
	) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
	const response = context.switchToHttp().getResponse();
    await this.validateUser(request, response);
	return true;
  }


	// Maybe think about adding some of this inside a middleware guard
	async validateUser(req: CustomRequest, res: Response) {
		const twoFAToken = req.cookies['2fa-token'];
		if (twoFAToken) {
			return res.status(200).json({ user: { id: 0, twoFAEnabled: true } });
		}

		// Extract token
		const token = req.cookies['auth-token'];
		if (!token) {
			res.status(401);
			res.redirect(this.config.get<string>('URL_FRONTEND_LOGIN'));
			this.thrower.throwSessionExcp(
				`Token validation error`,
				`${AuthGuard.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.UNAUTHORIZED,
			);
		}
		this.logger.log(`Validating token [${token}]`);

		// Verify token
		let decoded: string | JwtPayload;
		try {
			decoded = verify(token, this.config.get<string>('SECRET_KEY'));
		} catch (error) {
			res.clearCookie('auth_token');
			res.status(401);
			res.redirect(this.config.get<string>('URL_FRONTEND_LOGIN'));
			this.thrower.throwSessionExcp(
				`Token validation error: ${error.message}`,
				`${AuthGuard.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.UNAUTHORIZED,
			);
		}

		// Check decoded type
		if (typeof decoded !== 'object' || isNaN(Number(decoded.intraId))) {
			res.clearCookie('auth_token');
			res.status(401);
			res.redirect(this.config.get<string>('URL_FRONTEND_LOGIN'));
			this.thrower.throwSessionExcp(
				`Invalid token payload`,
				`${AuthGuard.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.UNAUTHORIZED,
			);
		}

		this.logger.log(`Token [${token}] validated`);

		// Find user
		const user = await this.userService.findOneIntra(Number(decoded.intraId));
		if (!user) {
			res.clearCookie('auth_token');
			res.status(401);
			res.redirect(this.config.get<string>('URL_FRONTEND_LOGIN'));
			this.thrower.throwSessionExcp(
				`User not found`,
				`${AuthGuard.name}.${this.constructor.prototype.validate.name}()`,
				HttpStatus.NOT_FOUND,
			);
		}
		req.validatedUser = user as User;
		// Success
		// this.logger.log(`Token [${token}] validated`);
		// res.status(200).json({ user: new UserDTO(user) });
	}


}
