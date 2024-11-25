import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import {User} from '../entities/user.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) { }


	async findAll(): Promise<Notification[]>
	{
		return (this.notificationRepository.find());
	}
  
	async findUser(id: string): Promise<Notification[]>
	{
		var tmp = Number(id);
		return (this.notificationRepository.find({where: {receiverId: tmp}}));
	}

	async initFriendReq(sender:User, receiver:User)
	{
		var noti = new Notification();
		noti.senderId = sender.id;
		noti.senderName = sender.nameIntra;
		noti.receiverId = receiver.id;
		noti.receiverName = receiver.nameIntra;
		noti.type = NotificationType.FriendReq;
		noti.status = NotificationStatus.Pending;
		noti.message = null;
		this.notificationRepository.save(noti);
	}

	async initMessage(sender:User, receiver:User, message:string)
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
	}

	// async removeNotification(id:number)
	// {
	// 	const notification: Notification = await this.notificationRepository.findOne({where: id });
	// 	if (!notification) {
	// 		throw new Error('Notification not found');
	// 	}
	// 	await this.notificationRepository.remove(notification);
	// }

}
