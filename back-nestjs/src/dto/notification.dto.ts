import { IsEnum, IsNumber, IsString } from "class-validator";
import { MessageNotification } from "src/entities/messageNotification.entity";
import { FriendRequest, NotificationStatus } from "src/entities/friendRequest.entity";
import { GameInvitation } from "src/entities/gameInvitation.entity";
import { PowerUpSelected } from "src/game/types/game.enum";


export enum NotificationType {
  gameInvite = 'Game Invite',
	friendRequest = 'Friend Request',
	message = 'message',
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
      this.senderId = notification.message.sender.member.id;
      this.receiverId = notification.receiver.member.id;
      this.senderName = notification.message.sender.member.nameNick;
      this.receiverName = notification.receiver.member.nameNick;
      this.type = NotificationType.message;
      this.status = notification.status;
      this.message = notification.message.content;
      this.powerUpsSelected = PowerUpSelected.noPowerUp;
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