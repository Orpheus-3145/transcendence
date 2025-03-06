import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import User from '../entities/user.entity'
import { UsersService } from 'src/users/users.service';
import RoomManagerService from 'src/game/session/roomManager.service';
import { GameDifficulty, GameMode, PowerUpSelected } from 'src/game/types/game.enum';
import GameDataDTO from 'src/dto/gameData.dto';
import { Channel } from 'src/entities/chat.entity';
import AppLoggerService from 'src/log/log.service';


@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
		private readonly roomManager: RoomManagerService,
		private readonly logger: AppLoggerService,
  ) {
		this.logger.setContext(NotificationService.name);
	}

	async findAll(): Promise<Notification[]>
	{
		return (this.notificationRepository.find());
	}

	async findNotificationReceiver(id: string): Promise<Notification[]>
	{
		return (this.notificationRepository.find({where: {receiver: {id : Number(id)}}}));
	}

	async findNotificationId(id:number): Promise<Notification>
	{
		return (this.notificationRepository.findOne({where: {id: id}}));
	}

	async doesNotificationExist(sender: number, receiver: number, type:NotificationType): Promise<Notification | null>
	{
		var noti: Notification = await this.notificationRepository.findOne({
			where: {
				sender: {id: sender},
				receiver: {id: receiver},
				type: type
			}
		});
			
		return (noti);
	}

	isSenderBlocked(sender:User, receiver:User): boolean
	{
		for (const item of receiver.blocked) 
		{
			if (item === sender.intraId.toString()) 
				return (true);
		}
		return (false);
	}

	async initRequest(sender:User, receiver:User, type:NotificationType, powerUps: PowerUpSelected): Promise<Notification | null>
	{
		if (this.isSenderBlocked(sender, receiver) == true)
			return (null);
		var tmp = await this.doesNotificationExist(sender.id, receiver.id, type);
		if (tmp != null)
			return (tmp);
		tmp = await this.doesNotificationExist(receiver.id, sender.id, type);
		if ((tmp != null) && (tmp.type == NotificationType.friendRequest))
		{
			this.removeReq(receiver.id.toString(), sender.id.toString(), type);
			this.userService.friendRequestAccepted(sender.id.toString(), receiver.id.toString());
			return (null);
		}
		else
		{
			var noti = new Notification();
			noti.sender = sender;
			noti.receiver = receiver;
			noti.type = type;
			noti.status = NotificationStatus.Pending;
			noti.message = null;
			noti.powerUpsSelected = powerUps;
			this.notificationRepository.save(noti);
			return (noti);
		}
	}

	async initMessage(sender:User, receiver:User, message:string): Promise<Notification | null>
	{
		if (this.isSenderBlocked(sender, receiver) == true)
			return null;
		var tmp = await this.doesNotificationExist(sender.id, receiver.id, NotificationType.Message);
		if (tmp != null)
		{
			tmp.message = message;
			this.notificationRepository.save(tmp);
			return (tmp);
		}
		else
		{
			var noti = new Notification();
			noti.sender = sender;
			noti.receiver = receiver;
			noti.type = NotificationType.Message;
			noti.status = NotificationStatus.Pending;
			noti.message = message;
			noti.powerUpsSelected = null;
			this.notificationRepository.save(noti);
			return (noti);
		}
	}

	async initGroupMessage(channel: Channel, receiver: User, message: string)
	{
		
		var tmp = await this.doesNotificationExist(channel.channel_id, receiver.id, NotificationType.groupChat);
		if (tmp != null)
		{
			tmp.message = message;
			this.notificationRepository.save(tmp);
			return (tmp);
		}
		else
		{
			var noti = new Notification();
			// noti.senderId = channel.channel_id;
			// noti.receiverId = receiver.id;
			noti.type = NotificationType.groupChat;
			noti.status = NotificationStatus.Pending;
			noti.message = message;
			noti.powerUpsSelected = null;
			this.notificationRepository.save(noti);
			return (noti);
		}		
	}

	async removeNotification(noti: Notification): Promise<void>
	{
		this.notificationRepository.remove(noti);
		this.logger.debug(`Removed notification id: ${noti.id}, type: ${noti.type}`);
	}

	async removeReq(sender:string, receiver:string, type:NotificationType): Promise<void> {
		var send = Number(sender);
		var recv = Number(receiver);
		var arr = await this.notificationRepository.find({
			where: { 
				sender: {id: send},
				receiver: {id: recv}
			}
		});

		for (const item of arr) 
		{
			if (item.type === type) 
			{
				await this.removeNotification(item);
				return ;
			}
		}
	}

	async startGameFromInvitation(sender: Socket, receiver: Socket, senderId: string, receiverId: string): Promise<void> {

		const senderIdNumber = Number(senderId);
		const receiverIdNumber = Number(receiverId);
		const gameNotification: Notification = await this.notificationRepository.findOne({
			where: { 
				receiver: { id: receiverIdNumber },
				sender: { id: senderIdNumber },
				type: NotificationType.gameInvite 
			} 
		});

		const initData: GameDataDTO = {
			sessionToken: uuidv4(),
			mode: GameMode.multi,
			difficulty: GameDifficulty.unset,
			extras: gameNotification.powerUpsSelected,
		};
		this.roomManager.createRoom(initData);

		sender.emit('goToGame', initData);
		receiver.emit('goToGame', initData);
	}
}
