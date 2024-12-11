import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import {User} from '../entities/user.entity'
import { UsersService } from 'src/users/users.service';
import { send } from 'process';

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

	async doesNotificationExist(sender:User, receiver:User, type:NotificationType): Promise<Notification | null>
	{
		var noti: Notification = await this.notificationRepository.findOne({where: {senderId: sender.id, receiverId: receiver.id, type: type}});
		return (noti);
	}

	async isSenderBlocked(sender:User, receiver:User): Promise<boolean>
	{
		for (const item of receiver.blocked) 
		{
			if (item === sender.intraId.toString()) 
			{
				return (true);
			}
		}
		return (false);
	}

	async initRequest(sender:User, receiver:User, type:NotificationType): Promise<void>
	{
		if (await this.isSenderBlocked(sender, receiver) == true)
			return ;
		var tmp = await this.doesNotificationExist(sender, receiver, type);
		if (tmp != null)
			return ;
		tmp = await this.doesNotificationExist(receiver, sender, type);
		if ((tmp != null) && (tmp.type == NotificationType.friendRequest))
		{
			this.removeReq(receiver.id.toString(), sender.id.toString(), type);
			this.userService.friendRequestAccepted(sender.id.toString(), receiver.id.toString());
		}
		else
		{
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
	}

	async initMessage(sender:User, receiver:User, message:string): Promise<void>
	{
		if (await this.isSenderBlocked(sender, receiver) == true)
			return ;
		var tmp = await this.doesNotificationExist(sender, receiver, NotificationType.Message);
		if (tmp != null)
		{
			tmp.message = message;
			this.notificationRepository.save(tmp);
		}
		else
		{
			var noti = new Notification();
			noti.senderId = sender.id;
			noti.senderName = sender.nameIntra;
			noti.receiverId = receiver.id;
			noti.receiverName = receiver.nameIntra;
			noti.type = NotificationType.Message;
			noti.status = NotificationStatus.None;
			noti.message = message;
			this.notificationRepository.save(noti);
			//add message to chat
		}
	}

	async removeNotification(noti: Notification): Promise<void>
	{
		this.notificationRepository.remove(noti);
	}

	async removeReq(sender:string, receiver:string, type:NotificationType): Promise<void>
	{
		var send = Number(sender);
		var recv = Number(receiver);
		var arr = await this.notificationRepository.find({ where: { receiverId: recv, senderId: send } });

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
