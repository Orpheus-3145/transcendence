
import { ExceptionFilter, Catch, ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(InternalServerErrorException)
export default class GameExceptionFilter implements ExceptionFilter {
  
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    
    const ctx = host.switchToWs();
    console.log('handling');
    // const data: any = ctx.getData();
    // const webSocket: Socket = ctx.getClient().server;
    // console.log(webSocket);
    
    // webSocket.interruptGame();
  }
}


