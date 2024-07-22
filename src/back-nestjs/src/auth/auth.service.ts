import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { UsersService as UserService } from '../users/users.service';
import { AccessTokenDTO } from '../dto/auth.dto';
import { UserDTO } from '../dto/user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) { }

  handleRedir(res: Response, clear: boolean, redir?: string, mess?: string) {
    if (clear)
      res.clearCookie('auth_token');
    const responseObj: any = {};
    if (mess)
      responseObj.message = mess;
    if (redir)
      responseObj.redirectTo = redir;
    res.json(responseObj);
  }

  async getUserAccessToken(code: string): Promise<AccessTokenDTO | null> {
    if (!code) {
      console.error('No code');
      return (null);
    }
    try {
      const response = await fetch('https://api.intra.42.fr/oauth/token', {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.configService.get<string>('SECRET_UID'),
          client_secret: this.configService.get<string>('SECRET_PWD'),
          code: code,
          redirect_uri: this.configService.get<string>('REDIRECT_URI'),
        })
      });
      if (!response.ok) {
        throw new Error('Problem with 42 temp key fetching.');
      }
      const token_info: AccessTokenDTO = await response.json();
      return token_info;
    } catch (error) {
      console.error('Error fetching user access token:', error);
    }
    return (null);
  }

  async getUserMe(access_token: string): Promise<Record<string, any> | null> {
    if (!access_token) {
      console.error('No access token');
      return (null);
    }
    try {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    return null;
  }

  async login(code: string, res: Response): Promise<UserDTO | null> {
    if (!code) {
      res.clearCookie('auth_token');
      res.redirect(process.env.ORIGIN_URL_FRONT + '/login');
      return (null);
    }
    const access = await this.getUserAccessToken(code);
    if (access === null)
      return (null);
    const userMe = await this.getUserMe(access.access_token);
    if (userMe === null)
      return (null);
    const signedToken = sign({ intraId: userMe.id }, this.configService.get<string>('SECRET_KEY'));
    res.cookie('auth_token', signedToken, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
    try {
      const userDTOreturn = await this.userService.createUser(access, userMe);
      res.redirect(process.env.ORIGIN_URL_FRONT + '/');
      return (userDTOreturn);
    } catch (error) {
      console.error('Error creating user:', error);
      res.redirect(process.env.ORIGIN_URL_FRONT + '/login');
      return (null);
    }
  }

  async validate(req: Request, res: Response) {
    // Local variable to accumulate response data
    const responseData = {
      message: '',
      rediretTo: '',
      user: null as UserDTO | null,
    }

    // Extract token
    const token = req.cookies['auth_token'];
    if (!token)
      return this.failResponse(res, responseData, 'Validator token not found.', '/login');

    // Verify token
    let decoded: string | JwtPayload;
    try {
      decoded = verify(token, this.configService.get<string>('SECRET_KEY'));
    } catch (error) {
      return this.failResponse(res, responseData, 'Token validation error.', '/login');
    }

    // Check decoded type
    if (typeof decoded !== 'object' || isNaN(Number(decoded.intraId)))
      return this.failResponse(res, responseData, 'Invalid token payload.', '/login');

    // Find user
    const user = await this.userService.findOne(Number(decoded.intraId));
    if (!user)
      return this.failResponse(res, responseData, 'User not found.', '/login');

    // Success
    responseData.message = 'User successfully validated.';
    responseData.user = new UserDTO(user);
    res.status(200).json(responseData);
  }

  private failResponse(res: Response, responseData: any, message: string, redirectTo: string) {
    responseData.message = message;
    responseData.redirectTo = redirectTo;
    res.clearCookie('auth_token');
    res.status(401).json(responseData);
  }
}
