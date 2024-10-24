import { Controller, Get } from '@nestjs/common';

import MatchmakingService from './matchmaking.service';


@Controller('matchmaking')
export default class MatchmakingController {

  constructor(
    private readonly mmService: MatchmakingService,
  ) {};
  
  @Get()
  async getCurrentPlayers(): Promise<number> {
    
    return this.mmService.getPlayers();
  };
};