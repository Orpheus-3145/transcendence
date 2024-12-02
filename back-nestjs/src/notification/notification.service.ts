import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import {User} from '../entities/user.entity'
import { UsersService } from 'src/users/users.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
	@Inject(forwardRef(() => UsersService))
	private readonly userService: UsersService,
  ) { }


	async findAll(): Promise<Notification[]>
	{
		return (this.notificationRepository.find());
	}
  
	async findNotificationReceiver(id: string): Promise<Notification[]>
	{
		var tmp = Number(id);
		return (this.notificationRepository.find({where: {receiverId: tmp}}));
	}

	async findNotificationId(id:number): Promise<Notification>
	{
		return (this.notificationRepository.findOne({where: {id: id}}));
	}

	async doesFriendReqExist(sender:User, receiver:User, type:NotificationType): Promise<Boolean>
	{
		var noti: Notification = await this.notificationRepository.findOne({where: {senderId: receiver.id, receiverId: sender.id}});
		if ((noti != null) && (noti.type == type))
			return (true);
		return (false);
	}

	async initRequest(sender:User, receiver:User, type:NotificationType)
	{
		if ((type == NotificationType.friendRequest) && (await this.doesFriendReqExist(sender, receiver, NotificationType.friendRequest) == true))
		{
			this.userService.friendRequestAccepted(sender.id.toString(), receiver.id.toString());
			this.removeReq(receiver.id.toString(), sender.id.toString(), type);
			return ;
		}
		if ((type == NotificationType.gameInvite) && (await this.doesFriendReqExist(sender, receiver, NotificationType.gameInvite) == true))
		{
			//init game session
			this.removeReq(receiver.id.toString(), sender.id.toString(), type);
			return ;
		}
		var noti = new Notification();
		noti.senderId = sender.id;
		noti.senderName = sender.nameIntra;
		noti.receiverId = receiver.id;
		noti.receiverName = receiver.nameIntra;
		noti.type = type;
		noti.status = NotificationStatus.Pending;
		noti.message = null;
		this.notificationRepository.save(noti);
	}

	async doesMessageNotiExist(sender:User, receiver:User)
	{
		var noti: Notification = await this.notificationRepository.findOne({where: {senderId: receiver.id, receiverId: sender.id, type: NotificationType.Message}});
		return (noti);
	}

	async initMessage(sender:User, receiver:User, message:string)
	{
		var tmp = this.doesMessageNotiExist(sender, receiver);
		if (tmp != null)
		{
			(await tmp).message = message;
			this.notificationRepository.save(await tmp);
			return ;
		}
		var noti = new Notification();
		noti.senderId = sender.id;
		noti.senderName = sender.nameIntra;
		noti.receiverId = receiver.id;
		noti.receiverName = receiver.nameIntra;
		noti.type = NotificationType.Message;
		noti.status = NotificationStatus.None;
		noti.message = message;
		this.notificationRepository.save(noti);
	}

	async removeNotification(noti: Notification)
	{
		this.notificationRepository.remove(noti);
	}

	async removeReq(sender:string, receiver:string, type:NotificationType)
	{
		var send = Number(sender);
		var recv = Number(receiver);
		const arr = await this.notificationRepository.find({ where: { receiverId: recv, senderId: send } });

		for (const item of arr) 
		{
			if (item.type === type) 
			{
				await this.notificationRepository.remove(item);
				return ;
			}
		}
	}
}
