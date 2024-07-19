import { Controller, Get, Query, Req, Res, Logger, Inject } from '@nestjs/common';
import { Request, Response } from 'express'; // Removed 'response' as it seems to be a typo
import { AuthService } from './auth.service'; // Import the AuthService class
import { sign, verify } from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) { }

  @Get('login')
  async login(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    let api = await this.authService.getUserAccessToken(code);
    if (api.error) return api;
    let userMe = await this.authService.getUserMe(api.access_token);
    const signedToken = sign({ id: userMe.id }, process.env.SECRET_KEY);
    res.cookie('auth_token', signedToken, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
    res.redirect(process.env.ORIGIN_URL_FRONT);
    return (userMe.id);
  }

  @Get('validate')
  async validate(@Req() req: Request, @Res() res: Response) {
    let token = req.cookies['auth_token'];
    if (!token)
      return res.status(401).json({ id: '0' });
    try {
      const user: any = verify(token, process.env.SECRET_KEY);
      if (!user)
        return res.status(404).json({ id: '0' });
      return res.json(user);
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      return res.status(401).json({ id: '0' });
    }
  }
}