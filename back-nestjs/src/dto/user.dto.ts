import { IsEmail, IsEnum, IsNumber, IsString, Length, IsArray, ValidateNested } from 'class-validator';
import { User } from '../entities/user.entity'
import { Type } from 'class-transformer';

export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
  InGame = 'ingame',
}

export class matchData {
  @IsString()
  player1: string;
  @IsString()
  player2: string;
  @IsString()
  player1Score: string;
  @IsString()
  player2Score: string;
  @IsString()
  whoWon: string;
  @IsString()
  type: string;
}

export class UserDTO {

  constructor(user: User) {
	this.id = user.id;
	this.intraId = user.intraId;
    this.nameNick = user.nameNick;
    this.nameIntra = user.nameNick;
    this.nameFirst = user.nameFirst;
    this.nameLast = user.nameLast;
    this.email = user.email;
    this.image = user.image;
    this.greeting = user.greeting;
    this.status = user.status;
    this.friends = user.friends;
    this.blocked = user.blocked;
    this.matchHistory = user.matchHistory
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

  @IsString()
  nameIntra: string;

  @IsEmail()
  email: string;

  @IsString()
  image: string | null;

  @IsString()
  @Length(0, 100)
  greeting: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsArray()
  @IsString({ each: true })
  friends: string[];

  @IsArray()
  @IsString({ each: true })
  blocked: string[];
  
  @IsString()
  role: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => matchData)
  matchHistory: matchData[];
}



