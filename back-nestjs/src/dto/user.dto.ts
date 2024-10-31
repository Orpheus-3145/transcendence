import { IsEmail, IsEnum, IsNumber, IsString, Length, IsArray } from 'class-validator';
import { User } from '../entities/user.entity'

export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
  InGame = 'ingame',
}

export class UserDTO {

  constructor(user: User) {
    this.id = user.id;
    this.nameNick = user.nameNick;
    this.nameIntra = user.nameNick;
    this.nameFirst = user.nameFirst;
    this.nameLast = user.nameLast;
    this.email = user.email;
    this.image = user.image;
    this.greeting = user.greeting;
    this.status = user.status;
    this.friends = user.friends;
  }

  @IsNumber()
  id: number;

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

}