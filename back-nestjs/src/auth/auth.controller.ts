import { Controller, Get, Query, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('login')
  async login(@Query('code') code: string, @Res() res: Response) {
    return this.authService.login(code, res);
  }

  @Get('validate')
  async validate(@Req() req: Request, @Res() res: Response) {
    return this.authService.validate(req, res);
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    this.authService.handleRedir(res, true, '/login', 'Logged out successfully');
  }
}