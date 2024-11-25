import { Controller, Get, Param, Post, HttpException, Body} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Express } from 'express';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { NotificationStatus } from 'src/entities/notification.entity';


@Controller('notification')
export class NotificationController {

	constructor(
		private readonly notificationService: NotificationService,
		private readonly userService: UsersService,
	  ) { }


	  @Get('/getFromUser/:userid')
	  async getNotificationUser(@Param('userid') userid: string)
	  {
		var user = this.userService.getUser(userid);
		if (!user)
		{
			console.log("nani da fuq!!");
			throw new HttpException('Not Found', 404);
		}
		var arr = this.notificationService.findUser(userid);
		if (!arr)
			throw new HttpException('Not Found', 404);

		return (arr);
	  }

	//   @Get('/removeNotification/:id')
	//   async removeNotification(@Param('id') id:string)
	//   {
	// 	var tmp = Number(id);
	// 	this.notificationService.removeNotification(tmp);
	//   }

	//   @Post('handleNotification')
	//   async handleNotification(@Body() noti:Notification)
	//   {
	// 	if (noti.status == NotificationStatus.Accepted)
	// 	{

	// 	}
	// 	this.notificationService.removeNotification(noti.id);
	//   }
	}
