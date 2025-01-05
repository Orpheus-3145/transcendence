import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	NotFoundException,
} from '@nestjs/common';

export default class GameException extends HttpException {

  constructor(trace: string, code?: number) {

    if (! code)
      code = HttpStatus.INTERNAL_SERVER_ERROR;
    super(trace, code);
  }


}