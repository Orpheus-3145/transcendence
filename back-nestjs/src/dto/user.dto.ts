import { IsEmail, IsEnum, IsNumber, IsString, Length, IsBoolean } from 'class-validator';
import User from '../entities/user.entity';

export enum UserStatus {
	Online = 'online',
	Offline = 'offline',
	InGame = 'ingame',
}

export class UserDTO {
	constructor(user: User) {
		this.id = user.user_id;
		this.intraId = user.intraId;
		this.nameNick = user.nameNick;
		this.nameFirst = user.nameFirst;
		this.nameLast = user.nameLast;
		this.email = user.email;
		this.image = user.image;
		this.greeting = user.greeting;
		this.status = user.status;
		// this.twoFactorSecret = user.twoFactorSecret;
		this.twoFactorEnabled = user.twoFactorEnabled;
	}

	@IsNumber()
	id: number;

	@IsNumber()
	intraId: number;

	@IsString()
	nameNick: string | null;

	@IsString()
	nameFirst: string;

	@IsString()
	nameLast: string;

	@IsEmail()
	email: string;

	@IsString()
	image: string | null;

	@IsString()
	@Length(0, 100)
	greeting: string;

	@IsEnum(UserStatus)
	status: UserStatus;

	// @IsString()
	// twoFactorSecret: string | null;

	@IsBoolean()
	twoFactorEnabled: boolean
}
