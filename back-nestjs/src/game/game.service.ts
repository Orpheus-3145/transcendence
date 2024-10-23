import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { UsersService as UserService } from '../users/users.service';
import { AccessTokenDTO } from '../dto/auth.dto';
import { UserDTO } from '../dto/user.dto';
import { User } from '../entities/user.entity';


@Injectable()
export class GameService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) { }

  run_game() {

	  // run  physics simulation here
  }
}
