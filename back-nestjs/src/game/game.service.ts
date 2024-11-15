import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Request, Response } from 'express';
// import { UsersService as UserService } from '../users/users.service';
//


@Injectable()
export default class GameService {
  constructor(
    // private usersRepository: Repository<User>,
    // private configService: ConfigService,
    // private userService: UserService,

  ) {};

  async getPlayers(): Promise<number> {
    
    var count = 1;

    // do some async reading on this.usersRepository

    return count;
  };

};
