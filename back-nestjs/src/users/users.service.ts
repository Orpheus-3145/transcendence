import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TopologyClosedEvent } from 'typeorm';

import { User } from '../entities/user.entity';
import { UserStatus, UserDTO } from '../dto/user.dto';
import { AccessTokenDTO } from '../dto/auth.dto';
import AppLoggerService from 'src/log/log.service';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		private logger: AppLoggerService) {
    
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
		try {
			await user.validate();
			// TODO check user not exists in table, if so, inserts into it
			await this.usersRepository.save(user);
			// thi
			return new UserDTO(user);
		} catch (error) {
			console.error('User validation error: ', error);
			throw error;
		}
	}

	async findOne(intraId: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { intraId } });
	}
}
