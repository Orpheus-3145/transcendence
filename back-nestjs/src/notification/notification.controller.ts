import { Controller, Inject, Get, Param, Post, HttpException, forwardRef} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UsersService } from 'src/users/users.service';
import { NotificationType } from 'src/entities/notification.entity';


@Controller('notification')
export class NotificationController {

	constructor(
		private readonly notificationService: NotificationService,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
	) { }


	@Get('/getFromUser/:userid')
	async getNotificationUser(@Param('userid') userid: string)
	{
		var user = this.userService.getUserId(userid);
		if (!user)
		{
			console.log("nani da fuq!!");
			throw new HttpException('Not Found', 404);
		}
		var arr = this.notificationService.findNotificationReceiver(userid);
		if (!arr)
			throw new HttpException('Not Found', 404);

		return (arr);
	}

	@Get('/acceptNotiFR/:sender/:receiver')
	async acceptNotificationFR(@Param('sender') sender: string, @Param('receiver') receiver: string)
	{
		this.userService.friendRequestAccepted(sender, receiver);
		this.notificationService.removeReq(sender, receiver, NotificationType.friendRequest);
	}

	@Get('/declineNotiFR/:sender/:receiver')
	async declineNotificationFR(@Param('sender') sender: string, @Param('receiver') receiver: string)
	{
		this.notificationService.removeReq(sender, receiver, NotificationType.friendRequest);
	}

	@Get('/acceptNotiGI/:sender/:receiver')
	async acceptNotificationGI(@Param('sender') sender: string, @Param('receiver') receiver: string)
	{
		//need to init a game session
		this.notificationService.removeReq(sender, receiver, NotificationType.gameInvite);
	}

	@Get('/declineNotiGI/:sender/:receiver')
	async declineNotificationGI(@Param('sender') sender: string, @Param('receiver') receiver: string)
	{
		this.notificationService.removeReq(sender, receiver, NotificationType.gameInvite);
	}

	@Get('removeNotification/:id')
	async rmvNotification(@Param('id') id: string)
	{
		var numb = Number(id);
		const noti = await this.notificationService.findNotificationId(numb);
		if (noti == null)
		{
			console.log("ERROR: notification not found in rmvNotification!");
			throw new HttpException('Not Found', 404);
		}
		this.notificationService.removeNotification(noti);
	}
}
