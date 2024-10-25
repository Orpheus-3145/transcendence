
import { Injectable, Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { SimulationService } from './simulation.service';
import { UsersService as UserService } from '../../users/users.service';
import { AccessTokenDTO } from '../../dto/auth.dto';
import { UserDTO } from '../../dto/user.dto';
import { User } from '../../entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('simulations')
export default class SimulationController {
  constructor(
    @InjectRepository(User)
    private userService: UserService,
	private simulationService: SimulationService
  ) { }

}
