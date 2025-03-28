import { IsEmail, IsEnum, IsNumber, IsString, Length, IsArray, ValidateNested } from 'class-validator';
import User  from '../entities/user.entity'
import { AnimationSelected } from 'src/game/types/game.enum';

export enum UserStatus {
	Online = 'online',
	Offline = 'offline',
	InGame = 'ingame',
}

export default class UserDTO {
	constructor(user: User) {
		this.id = user.id;
		this.intraId = user.intraId;
		this.nameNick = user.nameNick;
		this.nameIntra = user.nameIntra;
		this.nameFirst = user.nameFirst;
		this.nameLast = user.nameLast;
		this.email = user.email;
		this.image = user.image;
		this.greeting = user.greeting;
		this.status = user.status;
		this.friends = user.friends;
		this.blocked = user.blocked;
		this.gameAnimation = user.gameAnimation;
	}

	@IsNumber()
	id: number;

	@IsNumber()
	intraId: number;

	@IsString()
	nameIntra: string;

	@IsEmail()
	email: string;

	@IsString()
	nameFirst: string;

	@IsString()
	nameLast: string;

	@IsString()
	nameNick: string;

	@IsString()
	@Length(0, 100)
	greeting: string;

	@IsEnum(UserStatus)
	status: UserStatus;

	@IsString()
	image: string;

	@IsString()
	twoFactorSecret: string | null;

	@IsArray()
	@IsString({ each: true })
	friends: string[];

	@IsArray()
	@IsString({ each: true })
	blocked: string[];

	@IsString()
	role: string;

	@IsEnum(AnimationSelected)
	gameAnimation: AnimationSelected;
}



