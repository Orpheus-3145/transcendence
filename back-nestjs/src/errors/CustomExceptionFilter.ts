import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	NotFoundException,
} from '@nestjs/common';

import SimulationException from './SimulationException';

// @Catch() // Cattura tutte le eccezioni
@Catch(SimulationException)
export default class CustomExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		console.log(`Excp caught! ${exception.message}`)
		// const ctx = host.switchToHttp();
		// const response = ctx.getResponse();
		// const request = ctx.getRequest();

		// const status = exception instanceof HttpException
		//     ? exception.getStatus()
		//     : HttpStatus.INTERNAL_SERVER_ERROR;

		// const message = exception instanceof HttpException
		//     ? exception.getResponse()
		//     : exception.message;

		// response.status(status).json({
		//   statusCode: status,
		//   timestamp: new Date().toISOString(),
		//   path: request.url,
		//   message,
		// });
	}
};
