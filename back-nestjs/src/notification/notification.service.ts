import { Injectable, forwardRef } from '@nestjs/common';
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

	async findAndRmvNotification(id:string)
	{
		var numb = Number(id);
		const noti = await this.notificationRepository.find({ where: { id: numb} });
		await this.notificationRepository.remove(noti);
	}

	async initRequest(sender:User, receiver:User, type:NotificationType)
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
		console.log(noti);
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
		console.log(noti);
	}

	async removeNotification(id:number)
	{
	 	const notification: Notification = await this.notificationRepository.findOne({where: {id:id} });
	 	if (!notification) {
	 		throw new Error('Notification not found');
	 	}
	 	await this.notificationRepository.remove(notification);
	}

	async removeReq(sender:string, receiver:string, type:NotificationType)
	{
		var send = Number(sender);
		var recv = Number(receiver);
		const arr = await this.notificationRepository.find({ where: { receiverId: recv, senderId: send } });

		for (const item of arr) {
			if (item.type === type) {
				await this.notificationRepository.remove(item);
				return ;
			}
		}
	}
}
