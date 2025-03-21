import { IsEnum, IsNumber, IsString } from "class-validator";
import { MessageNotification } from "src/entities/messageNotification.entity";
import { FriendRequest, NotificationStatus } from "src/entities/friendRequest.entity";
import { GameInvitation } from "src/entities/gameInvitation.entity";
import { PowerUpSelected } from "src/game/types/game.enum";


export enum NotificationType {
	gameInvite = 'Game Invite',
	friendRequest = 'Friend Request',
	message = 'message',
	groupChat = 'groupChat',
}

export default class NotificationDTO {
	constructor(gameInvitation: GameInvitation);
	constructor(friendRequest: FriendRequest);
	constructor(chatNotification: MessageNotification);

	constructor(notification: GameInvitation | FriendRequest | MessageNotification) {
		if (notification instanceof GameInvitation) {
			this.id = notification.id;
			this.senderId = notification.sender.id;
			this.receiverId = notification.receiver.id;
			this.senderName = notification.sender.nameNick;
			this.receiverName = notification.receiver.nameNick;
			this.type = NotificationType.gameInvite;
			this.status = notification.status;
			this.message = '';
			this.powerUpsSelected = notification.powerUpsSelected;

		} else if (notification instanceof FriendRequest) {
			this.id = notification.id;
			this.senderId = notification.sender.id;
			this.receiverId = notification.receiver.id;
			this.senderName = notification.sender.nameNick;
			this.receiverName = notification.receiver.nameNick;
			this.type = NotificationType.friendRequest;
			this.status = notification.status;
			this.message = '';
			this.powerUpsSelected = PowerUpSelected.noPowerUp;

		} else if (notification instanceof MessageNotification) {
			this.id = notification.id;
			this.senderId = notification.message.channel.channel_id;
			this.receiverId = notification.receiver.user.id;
			this.senderName = notification.message.channel.title;
			this.receiverName = notification.receiver.user.nameNick;
			this.type = NotificationType.groupChat;
			this.status = notification.status;
			this.message = notification.message.content;
			this.powerUpsSelected = PowerUpSelected.noPowerUp;
			if (notification.message.channel.isDirectMessage)
			{
				this.type = NotificationType.message;
				this.senderId = notification.message.sender.user.id;
				this.senderName = notification.message.sender.user.nameNick;
			}
		}
	}

	@IsNumber()
	id: number;

	@IsNumber()
	senderId: number;

	@IsNumber()
	receiverId: number;

	@IsString()
	senderName: string;

	@IsString()
	receiverName: string;

	@IsEnum(NotificationType)
	type: NotificationType;

	@IsEnum(NotificationStatus)
	status: NotificationStatus;

	@IsString()
	message: String;

	@IsEnum(PowerUpSelected)
	powerUpsSelected: PowerUpSelected;
}