
import { ExceptionFilter, Catch, ArgumentsHost, InternalServerErrorException } from '@nestjs/common';

@Catch(InternalServerErrorException)
export class HttpExceptionFilter implements ExceptionFilter {
  
  catch(exception: InternalServerErrorException) {
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse<Response>();
  //   const request = ctx.getRequest<Request>();
  //   const status = exception.getStatus();

  //   response
  //     .status(status)
  //     .json({
  //       statusCode: status,
  //       timestamp: new Date().toISOString(),
  //       path: request.url,
  //     });
  }
}



// @UseFilters(new HttpExceptionFilter())
// export class CatsController {}