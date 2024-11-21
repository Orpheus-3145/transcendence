import { Controller, Get, Param, Post, HttpException} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Express } from 'express';


@Controller('notification')
export class NotificationController {

	constructor(
		private readonly notificationService: NotificationService,
	  ) { }

}
