import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
// import { UserDTO } from 'src/dto/user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export default class MatchmakingService {
  private waitingPlayersIP: Set<string> = new Set<string>();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {};

  readyForGame(): boolean {
    
    return this.waitingPlayersIP.size == 2;
  };

  addPlayer( playerIP: string ) {
    console.log(`new IP waiting to play: ${playerIP}`);

    this.waitingPlayersIP.add(playerIP);
  };

  removePlayer( playerIP: string ) {
    console.log(`removing: ${playerIP}`);

    this.waitingPlayersIP.delete(playerIP);
  };
};
