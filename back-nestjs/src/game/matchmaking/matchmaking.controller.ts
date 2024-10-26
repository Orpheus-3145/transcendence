import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
// import { UserDTO } from 'src/dto/user.dto';

import MatchmakingService from './matchmaking.service';


@Controller('game/matchmaking')
export default class MatchmakingController {
  constructor(
    private readonly mmService: MatchmakingService,
  ) {};

  @Get()
  waitForMatch(@Req() req: Request, @Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const intervalId = setInterval(() => {

      if (this.mmService.readyForGame() == true)
      {
        res.write(`data: ready to play!\n\n`);
        clearInterval(intervalId);
      }
    }, 1000);

    // req.on('close', () => {
    //   clearInterval(intervalId);
    // });
  }

  @Get('addPlayer')
  addPlayer( @Req() request: Request ) {

    this.mmService.addPlayer((request as any).ip);
  };

  @Get('removePlayer')
  removePlayer( @Req() request: Request ) {

    this.mmService.removePlayer((request as any).ip);
  };
};