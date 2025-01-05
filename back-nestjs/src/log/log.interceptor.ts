import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import AppLoggerService from 'src/log/log.service';

@Injectable()
export default class LoggerInterceptor implements NestInterceptor {
	
	constructor( private readonly logger: AppLoggerService) {}
	
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		
		// WS
		const client = context.switchToWs().getClient();
		const data = context.switchToWs().getData();

		// HTTP
		// const ctx = ExecutionContext.switchToHttp();
    // const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

		console.log('Server to Client - Message being sent:', data);

		return next.handle().pipe(
			tap((response) => {

				// console.log('Server to Client - Response sent:', response);
			}),
		);
	}
}
