import { Injectable, Inject, forwardRef } from '@nestjs/common';

import AppLoggerService from 'src/log/log.service';
import { GameException, SessionException, ChatException} from './exceptions';


@Injectable()
export default class ExceptionFactory {
	constructor(@Inject(forwardRef(() => AppLoggerService))
                private logger: AppLoggerService) {

		this.logger.setContext(ExceptionFactory.name);
	}

	throwGameExcp(trace: string, sessionToken: string, functionContext=ExceptionFactory.name) {

		this.logger.setContext(functionContext);
		this.logger.error(`Session [${sessionToken}] - Throwing GameException - trace: ${trace}`);
		this.logger.setContext(ExceptionFactory.name);

		throw new GameException(trace);
	}

  throwSessionExcp(trace: string, functionContext=ExceptionFactory.name) {

		this.logger.setContext(functionContext);
		this.logger.error(`Throwing SessionException - trace: ${trace}`);
		this.logger.setContext(ExceptionFactory.name);

    throw new SessionException(trace);
  }

  throwChatExcp(trace: string, functionContext=ExceptionFactory.name) {

		this.logger.setContext(functionContext);
		this.logger.error(`Throwing ChatException - trace: ${trace}`);
		this.logger.setContext(ExceptionFactory.name);

    throw new ChatException(trace);
  }
}
