import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export default class GameService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async getPlayers(): Promise<number> {
    
    var count = 1;

    // do some async reading on this.usersRepository

    return count;
  }
};
