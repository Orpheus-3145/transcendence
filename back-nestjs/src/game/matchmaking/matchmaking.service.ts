import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export default class MatchmakingService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async getPlayers(): Promise<number> {
    
    var count = 1;

    // do some async reading on this.usersRepository

    return count;
  };
};
