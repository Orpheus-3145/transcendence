import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HelloService {
  async getData(): Promise<string> {
    return `Hello, World from Service! Data:`;
  }
}