import { Controller, Get, Query, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import GameService from './game.service';

@Controller('game')
export default class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(
    private readonly gameService: GameService,
  ) { }

  @Get('engine')
  async run_game(@Res() res: Response) {
    return this.gameService.gameSimulation(code, res);
  }
  
  @Get('currentPlayers')
  async getCurrentPlayers(): Promise<number> {
    
    return this.gameService.getPlayers();
  };
};
