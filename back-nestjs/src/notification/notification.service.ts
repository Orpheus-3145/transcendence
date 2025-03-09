import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import User from '../entities/user.entity'
import { fromMaskToArray, PowerUpSelected } from 'src/game/types/game.enum';
import { ChannelMember } from 'src/entities/chat.entity';
import AppLoggerService from 'src/log/log.service';
import { MessageNotification } from 'src/entities/messageNotification.entity';
import { GameInvitation } from 'src/entities/gameInvitation.entity';
import { FriendRequest, NotificationStatus } from 'src/entities/friendRequest.entity';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { Message } from 'src/entities/message.entity';
import { NotificationType } from 'src/dto/notification.dto';


@Injectable()
export class NotificationService {
	constructor(
		@InjectRepository(MessageNotification)
		private messageNotificationRepository: Repository<MessageNotification>,

		@InjectRepository(GameInvitation)
		private gameInvitationRepository: Repository<GameInvitation>,

		@InjectRepository(FriendRequest)
		private friendRequestRepository: Repository<FriendRequest>,

		private readonly logger: AppLoggerService,
		
		private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(NotificationService.name);
	}

	async findAllNotifications(): Promise<{
			gameInv: GameInvitation[],
			friendReq: FriendRequest[],
			messageNoti: MessageNotification[],
		}>
	{
		const [gameInv, friendReq, messageNoti ] = await Promise.all([
			this.gameInvitationRepository.find( { where: { status: NotificationStatus.Pending}} ),
			this.friendRequestRepository.find( { where: { status: NotificationStatus.Pending}} ),
			this.messageNotificationRepository.find( { where: { status: NotificationStatus.Pending}} ),
		]);
		
		return ({
			gameInv: gameInv,
			friendReq: friendReq,
			messageNoti: messageNoti,
		});
	}

	async getFriendRequest(notificationId: number): Promise<FriendRequest | null> {

		return (await this.friendRequestRepository.findOne( { where: {id: notificationId}}));
	}

	async getGameInvitation(notificationId: number): Promise<GameInvitation | null> {

		return (await this.gameInvitationRepository.findOne( { where: {id: notificationId}}));
	}

	async getMessageNotification(notificationId: number): Promise<MessageNotification | null> {

		return (await this.messageNotificationRepository.findOne( { where: {id: notificationId}}));
	}

	isSenderBlocked(sender: User, receiver: User): boolean
	{
		for (const item of receiver.blocked) 
		{
			if (item === sender.intraId.toString()) 
				return (true);
		}
		return (false);
	}

	async createFriendRequest(sender: User, receiver: User): Promise<FriendRequest | null> {

		if (this.isSenderBlocked(sender, receiver) == true) {
			this.logger.debug(`${receiver.nameNick} has blocked ${sender.nameNick}, friend request not sent`);
			return (null);
		}

		const existingFriendRequest = await this.friendRequestRepository.findOne({
			where: {
				sender: {id: sender.id},
				receiver: {id: receiver.id},
			}
		});
		if (existingFriendRequest !== null)
			return existingFriendRequest;

		const newFriendRequest: FriendRequest = this.friendRequestRepository.create({
			sender: sender,
			receiver: receiver,
		});
		await this.friendRequestRepository.save(newFriendRequest);
		this.logger.log(`Sending friend request from ${sender.nameNick} to ${receiver.nameNick}`);
		
		return newFriendRequest;
	}

	async acceptFriendRequest(friendRequest: FriendRequest): Promise<void> {

		friendRequest.status = NotificationStatus.Accepted;
		await this.friendRequestRepository.save(friendRequest);
		
		this.logger.log(`${friendRequest.receiver.nameNick} accepted friend request from ${friendRequest.sender.nameNick}`)
	}

	async refuseFriendRequest(friendRequest: FriendRequest): Promise<void> {

		friendRequest.status = NotificationStatus.Declined;
		await this.friendRequestRepository.save(friendRequest);
		
		this.logger.log(`${friendRequest.receiver.nameNick} declined friend request from ${friendRequest.sender.nameNick}`)
	}
	
	async createGameInvitation(sender: User, receiver: User, powerUps: PowerUpSelected): Promise<GameInvitation | null> {

		if (this.isSenderBlocked(sender, receiver) == true) {
			this.logger.debug(`${receiver.nameNick} has blocked ${sender.nameNick}, game invite not sent`);
			return (null);
		}

		const existingGameInvitation = await this.gameInvitationRepository.findOne({
			where: {
				sender: {id: sender.id},
				receiver: {id: receiver.id},
				powerUpsSelected: powerUps,
			}
		});
		if (existingGameInvitation !== null)
			return existingGameInvitation;

		const newGameInvitation: GameInvitation = this.gameInvitationRepository.create({
			sender: sender,
			receiver: receiver,
			powerUpsSelected: powerUps,
		});
		await this.gameInvitationRepository.save(newGameInvitation);
		this.logger.log(`Sending game invite from ${sender.nameNick} to ${receiver.nameNick}, powerups: ${fromMaskToArray(powerUps)}`)
		
		return newGameInvitation;
	}

	async acceptGameInvitation(gameInvitation: GameInvitation): Promise<void> {

		gameInvitation.status = NotificationStatus.Accepted;
		await this.gameInvitationRepository.save(gameInvitation);
		
		this.logger.log(`${gameInvitation.receiver.nameNick} accepted game invite from ${gameInvitation.sender.nameNick}`)
	}

	async refuseGameInvitation(gameInvitation: GameInvitation): Promise<void> {

		gameInvitation.status = NotificationStatus.Declined;
		await this.gameInvitationRepository.save(gameInvitation);
		
		this.logger.log(`${gameInvitation.receiver.nameNick} declined game invite from ${gameInvitation.sender.nameNick}`)
	}
	
	async createMessageNotification(message: Message, receiver: ChannelMember): Promise<MessageNotification | null> {

		if (this.isSenderBlocked(message.sender.member, receiver.member) == true)
			return null;
	
		const newMessageNotification: MessageNotification = this.messageNotificationRepository.create({
			message: message,
			receiver: receiver,
		});
		await this.messageNotificationRepository.save(newMessageNotification);
		return newMessageNotification;
	}

	async removeNotification(notificationId: number, type: NotificationType): Promise<void> {

		if (type === NotificationType.friendRequest) {
			const toRemove: FriendRequest = await this.getFriendRequest(notificationId);
			
			if (toRemove) {
				await this.friendRequestRepository.remove(toRemove);
				this.logger.log(`Removed friend request id: ${toRemove.id}`);
			}
		} else if (type === NotificationType.gameInvite) {
			const toRemove: GameInvitation = await this.getGameInvitation(notificationId);
			
			if (toRemove) {
				await this.gameInvitationRepository.remove(toRemove);
				this.logger.log(`Removed game invite id: ${toRemove.id}`);
			}
		} else if (type === NotificationType.message) {
			const toRemove: MessageNotification = await this.getMessageNotification(notificationId);
			
			if (toRemove) {
				await this.messageNotificationRepository.remove(toRemove);
				this.logger.log(`Removed message notification id: ${toRemove.id}`);
			}
		}
	}

	// called in chatService
	// async initGroupMessage(channel: Channel, receiver: User, message: string)
	// {
	// 	var tmp = await this.doesNotificationExist(channel.channel_id, receiver.id, NotificationType.groupChat);
	// 	if (tmp != null)
	// 	{
	// 		tmp.message = message;
	// 		this.notificationRepository.save(tmp);
	// 		return (tmp);
	// 	}
	// 	else
	// 	{
	// 		var noti = new Notification();
	// 		// noti.senderId = channel.channel_id;
	// 		// noti.receiverId = receiver.id;
	// 		noti.type = NotificationType.groupChat;
	// 		noti.status = NotificationStatus.Pending;
	// 		noti.message = message;
	// 		noti.powerUpsSelected = null;
	// 		this.notificationRepository.save(noti);
	// 		return (noti);
	// 	}		
	// }
}
