import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { HelloService } from './hello.service';

@Controller()
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  async getHello(@Req() req: Request): Promise<string> {
    // console.log('All Cookies:', req.cookies);
    // const sessionCookie = req.cookies['myCookie'];
    // console.log('Session Cookie:', sessionCookie);
    return this.helloService.getData();
  }
}