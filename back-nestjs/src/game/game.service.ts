import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { UsersService as UserService } from '../users/users.service';
import { AccessTokenDTO } from '../dto/auth.dto';
import { UserDTO } from '../dto/user.dto';
import { User } from '../entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export default class GameService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private userService: UserService,
  ) { }

  async getPlayers(): Promise<number> {
    
    var count = 1;

    // do some async reading on this.usersRepository

    return count;
  };

  gameSimulation() {

	  // call the game simulation
  };


};
