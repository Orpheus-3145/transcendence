import { Injectable, HttpStatus } from '@nestjs/common';

import AppLoggerService from 'src/log/log.service';
import { GameException, SessionException, ChatException } from 'src/errors/exceptions';

@Injectable()
export default class ExceptionFactory {
	constructor(private readonly logger: AppLoggerService) {
		this.logger.setContext(ExceptionFactory.name);
	}

	throwGameExcp(
		trace: string,
		sessionToken: string,
		functionContext = ExceptionFactory.name,
		code = HttpStatus.INTERNAL_SERVER_ERROR,
	) {
		this.logger.setContext(functionContext);
		this.logger.error(`Session [${sessionToken}] - Throwing GameException - trace: ${trace}`);
		this.logger.setContext(ExceptionFactory.name);

		throw new GameException(trace, code);
	}

	throwSessionExcp(
		trace: string,
		functionContext = ExceptionFactory.name,
		code = HttpStatus.INTERNAL_SERVER_ERROR,
	) {
		this.logger.setContext(functionContext);
		this.logger.error(`Throwing SessionException - trace: ${trace}`);
		this.logger.setContext(ExceptionFactory.name);

		throw new SessionException(trace, code);
	}

	throwChatExcp(
		trace: string,
		functionContext = ExceptionFactory.name,
		code = HttpStatus.INTERNAL_SERVER_ERROR,
	) {
		this.logger.setContext(functionContext);
		this.logger.error(`Throwing ChatException - trace: ${trace}`);
		this.logger.setContext(ExceptionFactory.name);

		throw new ChatException(trace, code);
	}
}
