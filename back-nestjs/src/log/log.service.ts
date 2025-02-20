import { ConsoleLogger, LogLevel, ConsoleLoggerOptions, Injectable, Scope } from '@nestjs/common';
import * as fs from 'fs';

@Injectable({ scope: Scope.TRANSIENT })
export default class AppLoggerService extends ConsoleLogger {
	private readonly _logPath: string = process.env.LOG_PATH;
	private readonly _logName: string = process.env.LOG_FILE_NAME;
	private readonly logFile: string = '';

	constructor(context?: string, options?: ConsoleLoggerOptions) {
		super(context || 'DefaultContext', options);

		const now = new Date();
		const day = now.getDate().toString().padStart(2, '0'); // "07"
		const month = (now.getMonth() + 1).toString().padStart(2, '0'); // "12"
		const year = now.getFullYear() - 2000; // "//**"

		this.logFile = `${this._logPath}/${this._logName}_${day}:${month}:${year}.log`;
	}

	setLogLevels(levels: LogLevel[]): void {
		this.options.logLevels = levels;
	}

	setContext(context: string): void {
		super.setContext(context);
	}

	isLevelEnabled(level: LogLevel): boolean {
		return this.options.logLevels.includes(level);
	}

	debug(message: any, ...optionalParams: any[]) {
		if (this.isLevelEnabled('debug') === false) return;

		super.debug(message, this.context);
		this.writeNewEntry('debug', message);
	}

	verbose(message: any, ...optionalParams: any[]) {
		if (this.isLevelEnabled('verbose') === false) return;

		super.verbose(message, this.context);
		this.writeNewEntry('verbose', message);
	}

	log(message: any, ...optionalParams: any[]) {
		if (this.isLevelEnabled('log') === false) return;

		super.log(message);
		this.writeNewEntry('log', message);
	}

	warn(message: any, ...optionalParams: any[]) {
		if (this.isLevelEnabled('warn') === false) return;

		super.warn(message, this.context);
		this.writeNewEntry('warn', message);
	}

	error(message: any, ...optionalParams: any[]) {
		if (this.isLevelEnabled('error') === false) return;

		super.error(message, this.context);
		this.writeNewEntry('error', message);
	}

	fatal(message: any, ...optionalParams: any[]) {
		if (this.isLevelEnabled('fatal') === false) return;

		super.fatal(message, this.context);
		this.writeNewEntry('fatal', message);
	}

	writeNewEntry(level: LogLevel, message: string) {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0'); // "11"
		const minutes = now.getMinutes().toString().padStart(2, '0'); // "48"
		const seconds = now.getSeconds().toString().padStart(2, '0'); // "00"

		const formattedMessage = `[${hours}:${minutes}:${seconds}] - ${level}: [${this.context}] ${message}\n`;

		fs.appendFileSync(this.logFile, formattedMessage, { encoding: 'utf8' });
	}
}
