import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import User from '../entities/user.entity'
import { fromMaskToArray, PowerUpSelected } from 'src/game/types/game.enum';
import { ChannelMember } from 'src/entities/channel.entity';
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

	async getFriendRequest(notificationId: number, throwExcept: boolean = true): Promise<FriendRequest | null> {

		const friendReq: FriendRequest = await this.friendRequestRepository.findOne( { where: {id: notificationId}});
		if (!friendReq && throwExcept === true)
			this.thrower.throwChatExcp(`No friend request found with id: ${notificationId}`,
				`${NotificationService.name}.${this.constructor.prototype.getFriendRequest.name}()`,
				HttpStatus.NOT_FOUND);
		
				return friendReq;
	}

	async getGameInvitation(notificationId: number, throwExcept: boolean = true): Promise<GameInvitation | null> {

		const gameInvitation: GameInvitation = await this.gameInvitationRepository.findOne( { where: {id: notificationId}});
		if (!gameInvitation && throwExcept === true)
			this.thrower.throwChatExcp(`No game invitation found with id: ${notificationId}`,
				`${NotificationService.name}.${this.constructor.prototype.getGameInvitation.name}()`,
				HttpStatus.NOT_FOUND);

		return gameInvitation;
	}

	async getMessageNotification(notificationId: number, throwExcept: boolean = true): Promise<MessageNotification | null> {

		const messageNotification: MessageNotification = await this.messageNotificationRepository.findOne( { where: {id: notificationId}});
		if (!messageNotification && throwExcept === true)
			this.thrower.throwChatExcp(`No message invitation found with id: ${notificationId}`,
				`${NotificationService.name}.${this.constructor.prototype.getMessageNotification.name}()`,
				HttpStatus.NOT_FOUND);
		
		return messageNotification;
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

		let newFriendRequest: FriendRequest = this.friendRequestRepository.create({
			sender: sender,
			receiver: receiver,
		});
		newFriendRequest = await this.friendRequestRepository.save(newFriendRequest);
		this.logger.log(`Sending friend request from ${sender.nameNick} to ${receiver.nameNick}`);
		
		return newFriendRequest;
	}

	async acceptFriendRequest(friendRequest: FriendRequest): Promise<void> {

		friendRequest.status = NotificationStatus.Accepted;
		await this.friendRequestRepository.save(friendRequest);
		
		this.logger.log(`${friendRequest.receiver.nameNick} accepted friend request from ${friendRequest.sender.nameNick}`);
	}

	async refuseFriendRequest(friendRequest: FriendRequest): Promise<void> {

		friendRequest.status = NotificationStatus.Declined;
		await this.friendRequestRepository.save(friendRequest);
		
		this.logger.log(`${friendRequest.receiver.nameNick} declined friend request from ${friendRequest.sender.nameNick}`);
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

		let newGameInvitation: GameInvitation = this.gameInvitationRepository.create({
			sender: sender,
			receiver: receiver,
			powerUpsSelected: powerUps,
		});
		newGameInvitation = await this.gameInvitationRepository.save(newGameInvitation);
		this.logger.log(`Sending game invite from ${sender.nameNick} to ${receiver.nameNick}, powerups: ${fromMaskToArray(powerUps)}`);
		
		return newGameInvitation;
	}

	async acceptGameInvitation(gameInvitation: GameInvitation): Promise<void> {

		gameInvitation.status = NotificationStatus.Accepted;
		await this.gameInvitationRepository.save(gameInvitation);
		
		this.logger.log(`${gameInvitation.receiver.nameNick} accepted game invite from ${gameInvitation.sender.nameNick}`);
	}

	async refuseGameInvitation(gameInvitation: GameInvitation): Promise<void> {

		gameInvitation.status = NotificationStatus.Declined;
		await this.gameInvitationRepository.save(gameInvitation);
		
		this.logger.log(`${gameInvitation.receiver.nameNick} declined game invite from ${gameInvitation.sender.nameNick}`);
	}
	
	async createMessageNotification(message: Message, receiver: ChannelMember): Promise<MessageNotification | null> {

		if (this.isSenderBlocked(message.sender.member, receiver.member) == true)
			return null;
	
		let newMessageNotification: MessageNotification = this.messageNotificationRepository.create({
			message: message,
			receiver: receiver,
		});
		newMessageNotification = await this.messageNotificationRepository.save(newMessageNotification);
		this.logger.log(`Sending message notification from ${message.sender.member.nameNick} to ${receiver.member.nameNick}`);
		console.log(`Notification: ${JSON.stringify(newMessageNotification)}`);
		
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
}
