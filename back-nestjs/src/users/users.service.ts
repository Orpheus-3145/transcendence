import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TopologyClosedEvent } from 'typeorm';

import User from 'src/entities/user.entity';
import { UserStatus, UserDTO } from 'src/dto/user.dto';
import AccessTokenDTO from 'src/dto/auth.dto';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';

@Injectable()
export default class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(UsersService.name);
	}

	async createUser(access: AccessTokenDTO, userMe: Record<string, any>): Promise<UserDTO> {
		const user = new User();
		user.accessToken = access.access_token;
		user.intraId = userMe.id;
		user.nameNick = userMe.login;
		user.nameFirst = userMe.first_name;
		user.nameLast = userMe.last_name;
		user.email = userMe.email;
		user.image = userMe.image.link;
		user.greeting = 'Hello, I have just landed!';
		user.status = UserStatus.Offline;
		// Not sure if these go here
		user.twoFactorSecret = userMe.twoFactorSecret;
		// user.twoFactorEnabled = userMe.twoFactorEnabled;
		user.twoFactorEnabled = true;


		this.logger.debug(`Inserting user ${user.nameNick} in database`);
		try {
			await user.validate();
			await this.usersRepository.save(user);
			return new UserDTO(user);
		} catch (error) {
			this.thrower.throwSessionExcp(
				`User validation error: ${error}`,
				`${UsersService.name}.${this.constructor.prototype.createUser.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findOne(intraId: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { intraId } });
	}

	async update(user: User): Promise<User> {
		try {
			await this.usersRepository.save(user);
			return user;
		} catch (error) {
			this.thrower.throwSessionExcp(
				`User update error: ${error}`,
				`${UsersService.name}.${this.constructor.prototype.update.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
