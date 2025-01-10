import {
	HttpException,
	HttpStatus,
} from '@nestjs/common';


export class GameException extends HttpException {

  constructor(trace: string, code?: number) {

    if (! code)
      code = HttpStatus.INTERNAL_SERVER_ERROR;
    super(trace, code);
  }
}

export class SessionException extends HttpException {

  constructor(trace: string, code?: number) {

    if (! code)
      code = HttpStatus.INTERNAL_SERVER_ERROR;
    super(trace, code);
  }
}

export class ChatException extends HttpException {

  constructor(trace: string, code?: number) {

    if (! code)
      code = HttpStatus.INTERNAL_SERVER_ERROR;
    super(trace, code);
  }
}